import fs from 'fs';

const cutoffsFile = './src/data/cutoffs.json';
const seatsFile = './src/data/seats.json';
const pgFile = './temp_pg.json';

const cutoffs = JSON.parse(fs.readFileSync(cutoffsFile, 'utf8'));
const seats = JSON.parse(fs.readFileSync(seatsFile, 'utf8'));
const pgData = JSON.parse(fs.readFileSync(pgFile, 'utf8'));

// Filter out old PG data if we run this multiple times
const cleanCutoffs = cutoffs.filter(c => c.track !== 'pg');
const cleanSeats = seats.filter(s => s.track !== 'pg');

for (const raw of pgData) {
  const collegeId = String(raw.college_id);
  const course = (raw.course || "").trim();
  if (!course) continue;

  let quotaStr = (raw.quota || "").toUpperCase();
  let quota = "state";
  if (["AIQ", "OPEN_SEAT"].includes(quotaStr)) quota = "aiq";
  else if (["DEEMED"].includes(quotaStr)) quota = "deemed";
  else if (["DU", "AMU", "JIPMER", "CW_ARMED_FORCES", "CENTRAL"].includes(quotaStr)) quota = "central";

  // Seats
  const numSeats = Number(raw.seats);
  if (!isNaN(numSeats) && numSeats > 0) {
    cleanSeats.push({
      collegeId: collegeId,
      track: "pg",
      course: course,
      quota: quota,
      category: "general", // We just assign all seats to general for simplicity if category is not split
      seats: numSeats
    });
  }

  // Cutoffs
  let catStr = (raw.category || "").toUpperCase();
  let category = null;
  if (catStr === "OPEN" || catStr === "UR" || catStr === "GN") category = "general";
  else if (catStr === "OBC") category = "obc";
  else if (catStr === "SC") category = "sc";
  else if (catStr === "ST") category = "st";
  else if (catStr === "EWS") category = "ews";

  if (category) {
    const processRound = (round, opRank, clRank) => {
      if (opRank !== null && opRank !== undefined && opRank !== '' && clRank !== null && clRank !== undefined && clRank !== '') {
        cleanCutoffs.push({
          collegeId: collegeId,
          track: "pg",
          course: course,
          quota: quota,
          category: category,
          round: round,
          year: 2024,
          openingRank: Number(opRank),
          closingRank: Number(clRank)
        });
      }
    };
    processRound(1, raw.r1_opening_rank, raw.r1_closing_rank);
    processRound(2, raw.r2_opening_rank, raw.r2_closing_rank);
    processRound(3, raw.r3_opening_rank, raw.r3_closing_rank);
  }
}

fs.writeFileSync(cutoffsFile, JSON.stringify(cleanCutoffs, null, 2));
fs.writeFileSync(seatsFile, JSON.stringify(cleanSeats, null, 2));

console.log(`Added PG data! Total seats: ${cleanSeats.length}, Total cutoffs: ${cleanCutoffs.length}`);
