import json
import time
from pathlib import Path
from io import BytesIO

import requests
from PIL import Image

INPUT_FILE = "src/data/colleges.json"
OUTPUT_FILE = "src/data/colleges.json"
MANUAL_REVIEW_LOG = "needs_manual_review.json"
NOT_FOUND_LOG = "no_wikipedia_match.json"
IMAGE_DIR = Path("public/images")
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

WIKI_API = "https://en.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

HEADERS = {"User-Agent": "gined.in-college-image-enrichment/1.0 (contact: test@example.com)"}
ACCEPTABLE_LICENSE_KEYWORDS = ["cc-by", "cc-sa", "cc0", "public domain", "pd-"]
REQUEST_DELAY = 0.3

def search_wikipedia_article(college_name: str, city: str):
    params = {
        "action": "query", "list": "search", "format": "json",
        "srsearch": f"{college_name} {city}", "srlimit": 1,
    }
    r = requests.get(WIKI_API, params=params, headers=HEADERS, timeout=15)
    r.raise_for_status()
    results = r.json().get("query", {}).get("search", [])
    return results[0]["title"] if results else None

def get_lead_image_filename(article_title: str):
    params = {
        "action": "query", "titles": article_title, "format": "json",
        "prop": "pageimages", "piprop": "name",
    }
    r = requests.get(WIKI_API, params=params, headers=HEADERS, timeout=15)
    r.raise_for_status()
    pages = r.json().get("query", {}).get("pages", {})
    for page in pages.values():
        if "pageimage" in page:
            return page["pageimage"]
    return None

def check_license_and_get_url(filename: str):
    params = {
        "action": "query", "titles": f"File:{filename}", "format": "json",
        "prop": "imageinfo", "iiprop": "url|extmetadata",
    }
    r = requests.get(COMMONS_API, params=params, headers=HEADERS, timeout=15)
    r.raise_for_status()
    pages = r.json().get("query", {}).get("pages", {})
    for page in pages.values():
        if "missing" in page:
            return None
        imageinfo = page.get("imageinfo")
        if not imageinfo:
            return None
        info = imageinfo[0]
        extmeta = info.get("extmetadata", {})
        license_short = extmeta.get("LicenseShortName", {}).get("value", "").lower()
        artist = extmeta.get("Artist", {}).get("value", "Wikimedia Commons contributor")
        if any(keyword in license_short for keyword in ACCEPTABLE_LICENSE_KEYWORDS):
            return {"url": info["url"], "license": license_short, "attribution": artist}
        return None
    return None

def download_and_save(image_url: str, college_id: str) -> str:
    resp = requests.get(image_url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    # convert SVGs? PIL can't natively open SVGs easily without resvg or cairosvg.
    # If URL ends in .svg, skip conversion or skip entirely.
    if image_url.lower().endswith('.svg'):
        return None
        
    img = Image.open(BytesIO(resp.content)).convert("RGB")
    out_path = IMAGE_DIR / f"{college_id}.webp"
    img.save(out_path, "WEBP", quality=80)
    return f"/images/{college_id}.webp"

def main():
    with open(INPUT_FILE, encoding="utf-8") as f:
        colleges = json.load(f)

    manual_review, not_found = [], []
    total = len(colleges)

    for i, record in enumerate(colleges, 1):
        if record.get("hero_image_url") and not record["hero_image_url"].startswith("data:image"):
            if not "unsplash" in record["hero_image_url"]:
                # Keep existing valid images (like previously grabbed ones)
                continue

        name, city = record.get("name", ""), record.get("city", "")
        college_id = record.get("id", "")
        status = None

        try:
            article = search_wikipedia_article(name, city)
            if not article:
                not_found.append({"college_id": college_id, "college_name": name})
                status = "no_wikipedia_article"
            else:
                filename = get_lead_image_filename(article)
                if not filename:
                    not_found.append({"college_id": college_id, "college_name": name, "article": article})
                    status = "no_lead_image"
                else:
                    licensed = check_license_and_get_url(filename)
                    if not licensed:
                        manual_review.append({
                            "college_id": college_id, "college_name": name,
                            "article": article, "filename": filename,
                            "reason": "license not auto-confirmed as reusable",
                        })
                        status = "needs_manual_review"
                    else:
                        local_path = download_and_save(licensed["url"], college_id)
                        if local_path:
                            record["hero_image_url"] = local_path
                            record["image_source"] = "wikimedia_commons"
                            status = "ok"
                        else:
                            status = "unsupported_format_svg"
        except Exception as e:
            manual_review.append({"college_id": college_id, "college_name": name, "error": str(e)})
            status = f"error: {e}"

        if status != "ok":
            record.setdefault("hero_image_url", None)
            record["image_source"] = status

        print(f"[{i}/{total}] {name} -> {status}")
        time.sleep(REQUEST_DELAY)

        if i % 25 == 0:
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(colleges, f, ensure_ascii=False, indent=2)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(colleges, f, ensure_ascii=False, indent=2)
        
    print(f"\nDone. Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
