const fs = require('fs');
let txt = fs.readFileSync('src/pages/app/Home.tsx', 'utf8');

txt = txt.replace('iconBg?: string;', 'iconBg?: string;\n  onClick?: () => void;');
txt = txt.replace('iconBg = \'bg-blue-50\' }: StatusCardProps)', 'iconBg = \'bg-blue-50\', onClick }: StatusCardProps)');
txt = txt.replace('<div className="bg-white/70', '<div onClick={onClick} className={`${onClick ? \'cursor-pointer active:scale-95 transition-transform\' : \'\'} bg-white/70');

fs.writeFileSync('src/pages/app/Home.tsx', txt);
