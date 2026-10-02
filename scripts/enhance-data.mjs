import fs from 'fs';
import https from 'https';

const collegesFile = './src/data/colleges.json';
const ugFile = './temp_ug.json';
const pgFile = './temp_pg.json';

const colleges = JSON.parse(fs.readFileSync(collegesFile, 'utf8'));
const ugData = JSON.parse(fs.readFileSync(ugFile, 'utf8'));
const pgData = JSON.parse(fs.readFileSync(pgFile, 'utf8'));

// 1. Add Branches
const branchesMap = new Map();

for (const ug of ugData) {
  const cId = ug.college_id;
  if (!branchesMap.has(cId)) branchesMap.set(cId, new Set());
  branchesMap.get(cId).add(ug.course);
}

for (const pg of pgData) {
  const cId = pg.college_id;
  if (!branchesMap.has(cId)) branchesMap.set(cId, new Set());
  branchesMap.get(cId).add(pg.course);
}

// 2. Fetch Images from Wikipedia API
const fetchWikiImage = (query) => {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}`;
    https.get(url, { headers: { 'User-Agent': 'Node.js/MedicalApp' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages;
          if (pages) {
            const page = Object.values(pages)[0];
            if (page && page.original && page.original.source) {
              resolve(page.original.source);
              return;
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

async function processColleges() {
  let imagesFound = 0;
  const placeholder = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=1200';

  for (let i = 0; i < colleges.length; i++) {
    const c = colleges[i];
    
    // Add branches
    if (branchesMap.has(c.id)) {
      c.branches = Array.from(branchesMap.get(c.id));
    } else {
      c.branches = [];
    }

    // Try to get image if it's the placeholder
    if (c.hero_image_url === placeholder) {
      // Small delay to prevent rate limiting
      await new Promise(r => setTimeout(r, 100));
      
      const img = await fetchWikiImage(c.name);
      if (img) {
        c.hero_image_url = img;
        imagesFound++;
        console.log(`Found image for ${c.name}`);
      } else {
        // Try searching with city
        await new Promise(r => setTimeout(r, 100));
        const img2 = await fetchWikiImage(`${c.name}, ${c.city}`);
        if (img2) {
          c.hero_image_url = img2;
          imagesFound++;
          console.log(`Found image for ${c.name} (with city)`);
        }
      }
    }
  }

  console.log(`Found ${imagesFound} new images from Wikipedia API.`);
  fs.writeFileSync(collegesFile, JSON.stringify(colleges, null, 2));
}

processColleges();
