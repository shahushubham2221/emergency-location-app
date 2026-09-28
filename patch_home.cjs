const fs = require('fs');
let txt = fs.readFileSync('src/pages/app/Home.tsx', 'utf8');

txt = txt.replace('import { useNetworkStatus } from \'../../hooks/useNetworkStatus\';', 'import { useNetworkStatus } from \'../../hooks/useNetworkStatus\';\nimport { useLocation } from \'../../hooks/useLocation\';');

txt = txt.replace('const { isOnline } = useNetworkStatus();', 'const { isOnline } = useNetworkStatus();\n  const { getCurrentLocation } = useLocation(null);');

txt = txt.replace('icon={MapPin}\n            label="GPS"', 'icon={MapPin}\n            label="GPS"\n            onClick={() => getCurrentLocation()}');

fs.writeFileSync('src/pages/app/Home.tsx', txt);
