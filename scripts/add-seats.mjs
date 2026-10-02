import fs from 'fs';

const cutoffsFile = './src/data/cutoffs.json';
const seatsFile = './src/data/seats.json';
const collegesFile = './src/data/colleges.json';

const seats = JSON.parse(fs.readFileSync(seatsFile, 'utf8'));
const colleges = JSON.parse(fs.readFileSync(collegesFile, 'utf8'));

for (const c of colleges) {
  let total = 0;
  // Calculate total seats from seats.json
  const collegeSeats = seats.filter(s => s.collegeId === c.id);
  for (const s of collegeSeats) {
    total += s.seats || 0;
  }
  c.totalSeats = total;
}

fs.writeFileSync(collegesFile, JSON.stringify(colleges, null, 2));
console.log('Added totalSeats to colleges.json!');
