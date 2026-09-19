const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      let newC = c.replace(/\\`/g, '`');
      if (c !== newC) {
        fs.writeFileSync(p, newC);
        console.log('Fixed', p);
      }
    }
  });
}
walk('src');
