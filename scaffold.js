const fs = require('fs');
const path = require('path');

const dirs = [
  'src/app/medical',
  'src/app/medical/results',
  'src/app/medical/college/[collegeId]',
  'src/app/medical/mentor/[mentorId]',
  'src/app/medical/book',
  'src/components/medical',
  'src/lib/medical'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

const pages = [
  'src/app/medical/page.tsx',
  'src/app/medical/results/page.tsx',
  'src/app/medical/college/[collegeId]/page.tsx',
  'src/app/medical/mentor/[mentorId]/page.tsx',
  'src/app/medical/book/page.tsx'
];

pages.forEach(file => {
  fs.writeFileSync(path.join(__dirname, file), `export default function Page() {\n  return <div>${file} placeholder</div>\n}\n`);
});

const components = [
  'MedicalHero.tsx',
  'TrackToggle.tsx',
  'TrustBar.tsx',
  'RoadmapSection.tsx',
  'GuidanceSection.tsx',
  'CollegeFinderSection.tsx',
  'ChancesCalculatorForm.tsx',
  'ResultsList.tsx',
  'CollegeResultCard.tsx',
  'IndiaCoverageMap.tsx',
  'FAQSection.tsx',
  'MentorSection.tsx',
  'MentorCard.tsx',
  'SuccessStoriesSection.tsx'
];

components.forEach(comp => {
  fs.writeFileSync(path.join(__dirname, 'src/components/medical', comp), `export default function ${comp.split('.')[0]}() {\n  return <div>${comp.split('.')[0]}</div>\n}\n`);
});

const libs = [
  'MedicalPageProvider.tsx',
  'api.ts'
];

fs.writeFileSync(path.join(__dirname, 'src/lib/medical/MedicalPageProvider.tsx'), `import React from 'react';\n\nexport const MedicalPageContext = React.createContext({});\nexport const MedicalPageProvider = ({ children }: { children: React.ReactNode }) => {\n  return <MedicalPageContext.Provider value={{}}>{children}</MedicalPageContext.Provider>\n};\n`);
fs.writeFileSync(path.join(__dirname, 'src/lib/medical/api.ts'), `export const collegeFinder = async () => {};\nexport const getCollege = async () => {};\nexport const getMentor = async () => {};\n`);

console.log("Scaffolding complete.");
