import fs from 'fs';
import https from 'https';

const collegesFile = './src/data/colleges.json';
const colleges = JSON.parse(fs.readFileSync(collegesFile, 'utf8'));

const fetchWikiSearch = (query) => {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${encodeURIComponent(query)}&utf8=&srlimit=1`;
    https.get(url, { headers: { 'User-Agent': 'Node.js/MedicalApp' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.query && json.query.search && json.query.search.length > 0) {
            resolve(json.query.search[0].title);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

const fetchWikiImage = (title) => {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`;
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

    if (c.hero_image_url === placeholder) {
      await new Promise(r => setTimeout(r, 100)); // rate limit
      const title = await fetchWikiSearch(c.name);
      
      if (title) {
        const img = await fetchWikiImage(title);
        if (img) {
          c.hero_image_url = img;
          imagesFound++;
          console.log(`Found image for ${c.name} (via ${title})`);
        }
      }
    }
  }

  console.log(`Found ${imagesFound} new images from Wikipedia Search API.`);
  fs.writeFileSync(collegesFile, JSON.stringify(colleges, null, 2));
}

processColleges();
