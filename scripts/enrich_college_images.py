"""
enrich_college_images.py

One-time (or periodic) batch enrichment script.
Reads src/data/colleges.json, resolves each college on Google Places,
downloads a real campus photo where one exists, resizes/converts it
to a web-optimized .webp, and writes it to public/images/<college_id>.webp.

Writes an updated JSON file with image_url, image_attribution, and
image_source fields added to every record. Colleges with no usable
Places photo are logged separately — DO NOT fill these with
AI-generated images; use the brand-styled initials fallback in the
frontend instead (college_name's initials on the design system's
ink/teal background).

Usage:
    export GOOGLE_PLACES_API_KEY="your-key-here"
    pip install requests pillow
    python3 scripts/enrich_college_images.py
"""

import json
import os
import time
import sys
from pathlib import Path

import requests
from PIL import Image
from io import BytesIO

API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY")
if not API_KEY:
    sys.exit("Set GOOGLE_PLACES_API_KEY before running this script.")

INPUT_FILE = "src/data/colleges.json"
OUTPUT_FILE = "src/data/colleges.json"
MISSING_LOG = "missing_images.json"
IMAGE_DIR = Path("public/images")
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PHOTO_MAX_WIDTH = 800
REQUEST_DELAY_SECONDS = 0.15


def resolve_photo(college_name: str, city: str, state: str):
    query = f"{college_name}, {city}, {state}, India"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
    }
    resp = requests.post(SEARCH_URL, headers=headers, json={"textQuery": query}, timeout=15)
    if resp.status_code != 200:
        return None, None

    places = resp.json().get("places", [])
    if not places:
        return None, None

    photos = places[0].get("photos", [])
    if not photos:
        return None, None

    photo = photos[0]
    photo_name = photo.get("name")
    attributions = photo.get("authorAttributions", [])
    attribution_text = attributions[0].get("displayName") if attributions else "Google Maps contributor"
    return photo_name, attribution_text


def download_and_save_photo(photo_name: str, college_id: str) -> str:
    media_url = f"https://places.googleapis.com/v1/{photo_name}/media"
    params = {"maxWidthPx": PHOTO_MAX_WIDTH, "key": API_KEY, "skipHttpRedirect": "true"}
    resp = requests.get(media_url, params=params, timeout=15)
    resp.raise_for_status()
    photo_uri = resp.json()["photoUri"]

    img_resp = requests.get(photo_uri, timeout=20)
    img_resp.raise_for_status()

    img = Image.open(BytesIO(img_resp.content)).convert("RGB")
    out_path = IMAGE_DIR / f"{college_id}.webp"
    img.save(out_path, "WEBP", quality=80)
    return f"/images/{college_id}.webp"


def main():
    with open(INPUT_FILE, encoding="utf-8") as f:
        colleges = json.load(f)

    missing = []
    total = len(colleges)

    for i, record in enumerate(colleges, 1):
        # Skip if already a real image (Wikipedia or already fetched)
        if record.get("hero_image_url") and not record["hero_image_url"].startswith("data:image"):
            if not "unsplash" in record["hero_image_url"]:
                continue 

        name = record.get("name", "")
        city = record.get("city", "")
        state = record.get("state", "")
        college_id = record.get("id", "")

        try:
            photo_name, attribution = resolve_photo(name, city, state)
            if not photo_name:
                missing.append({"college_id": college_id, "college_name": name})
                record["hero_image_url"] = None
                record["image_source"] = "none_found"
            else:
                local_path = download_and_save_photo(photo_name, college_id)
                record["hero_image_url"] = local_path
                record["image_attribution"] = attribution
                record["image_source"] = "google_places"
        except Exception as e:
            print(f"[{i}/{total}] FAILED {name}: {e}")
            missing.append({"college_id": college_id, "college_name": name, "error": str(e)})
            record["hero_image_url"] = None
            record["image_source"] = "error"

        print(f"[{i}/{total}] {name} -> {record.get('image_source')}")
        time.sleep(REQUEST_DELAY_SECONDS)

        if i % 25 == 0:
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(colleges, f, ensure_ascii=False, indent=2)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(colleges, f, ensure_ascii=False, indent=2)

    with open(MISSING_LOG, "w", encoding="utf-8") as f:
        json.dump(missing, f, ensure_ascii=False, indent=2)

    print(f"\nDone. See {MISSING_LOG} for missing colleges.")

if __name__ == "__main__":
    main()
