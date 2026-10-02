import fs from 'fs';

const collegesFile = './src/data/colleges.json';
const ugFile = './temp_ug.json';
const pgFile = './temp_pg.json';
const imagesFile = './src/data/college-images.json';

const colleges = JSON.parse(fs.readFileSync(collegesFile, 'utf8'));
const ugData = JSON.parse(fs.readFileSync(ugFile, 'utf8'));
const pgData = JSON.parse(fs.readFileSync(pgFile, 'utf8'));
const imagesData = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));

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

// 2. Assign images more intelligently
const placeholder = imagesData._placeholder || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=1200';

const matchImage = (c) => {
  const cName = c.name.toLowerCase();
  
  // Custom manual mappings for tricky names
  if (cName.includes('all india institute of medical sciences, new delhi')) return imagesData['aiims_new_delhi'];
  if (cName.includes('all india institute of medical sciences') && cName.includes('bhopal')) return imagesData['aiims_bhopal'];
  if (cName.includes('all india institute of medical sciences') && cName.includes('bhubaneswar')) return imagesData['aiims_bhubaneswar'];
  if (cName.includes('all india institute of medical sciences') && cName.includes('jodhpur')) return imagesData['aiims_jodhpur'];
  if (cName.includes('all india institute of medical sciences') && cName.includes('rishikesh')) return imagesData['aiims_rishikesh'];
  if (cName.includes('all india institute of medical sciences') && cName.includes('raipur')) return imagesData['aiims_raipur'];
  if (cName.includes('all india institute of medical sciences') && cName.includes('patna')) return imagesData['aiims_patna'];
  if (cName.includes('all india institute of medical sciences') && cName.includes('kalyani')) return imagesData['aiims_kalyani'];
  
  // Generic matching
  for (const [key, url] of Object.entries(imagesData)) {
    if (key === '_placeholder') continue;
    
    // exact words match
    const keyWords = key.replace(/_/g, ' ').toLowerCase();
    if (cName.includes(keyWords)) {
      return url;
    }
    
    // ignore punctuation
    const cNorm = cName.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cNorm.includes(keyWords)) {
      return url;
    }
  }
  return null;
}

let imagesAssigned = 0;
let branchesAssigned = 0;

for (const c of colleges) {
  if (branchesMap.has(c.id)) {
    c.branches = Array.from(branchesMap.get(c.id));
    branchesAssigned++;
  } else {
    // If it's a ug_ ID, try stripping it in case the seat matrix didn't have it? 
    // Wait, let's just also check without prefix if it fails
    const rawId = c.id.replace(/^(ug_|pg_)/, '');
    if (branchesMap.has(rawId)) {
      c.branches = Array.from(branchesMap.get(rawId));
      branchesAssigned++;
    } else {
      c.branches = [];
    }
  }
  
  // If it currently has placeholder, try to assign from images file
  if (!c.hero_image_url || c.hero_image_url === placeholder) {
    const url = matchImage(c);
    if (url) {
      c.hero_image_url = url;
      imagesAssigned++;
    } else {
      c.hero_image_url = placeholder;
    }
  }
}

console.log(`Assigned branches to ${branchesAssigned} colleges.`);
console.log(`Assigned new images to ${imagesAssigned} colleges.`);

fs.writeFileSync(collegesFile, JSON.stringify(colleges, null, 2));
