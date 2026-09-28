const fs = require('fs');
let txt = fs.readFileSync('src/pages/app/SOSActive.tsx', 'utf8');
const mangledIdx = txt.indexOf('useNavigate, useLocation } from \'react-router-dom\';', 100);
if (mangledIdx > 100) {
  const original = txt.substring(0, 72) + txt.substring(mangledIdx);
  fs.writeFileSync('src/pages/app/SOSActive.tsx', original);
  console.log('Restored original!');
}
