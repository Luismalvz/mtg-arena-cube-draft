const fs = require('fs');
let content = fs.readFileSync('client/src/components/AdminSetup.jsx', 'utf8');

// 1
content = content.replace(
  /<div className=\"flex items-center gap-1 text-amber-400 font-sans text-\\[10px\\] sm:text-xs uppercase tracking-widest font-semibold\">.*?<\\/div>/s,
  ''
);
content = content.replace(
  /<p className=\"text-xs sm:text-sm text-slate-400 font-sans\">.*?<\\/p>/s,
  ''
);

// 2
content = content.replace(
  /<span className=\"text-\\[10px\\] text-amber-400 font-normal uppercase\">Drafter Líder<\\/span>/,
  ''
);
content = content.replace(
  /<label className=\"font-sans text-xs text-slate-200 uppercase tracking-wider font-semibold flex items-center justify-between\">/s,
  '<label className=\"font-sans text-xs text-slate-200 uppercase tracking-wider font-semibold\">'
);

// 3
content = content.replace(
  /\\{playerCount === 8 \\? '\\(Recomendado\\)' : ''\\}/g,
  ''
);
content = content.replace(
  /<span className=\\{\\	ext-\\[9px\\] sm:text-\\[10px\\] \\$\\{isSelected \\? 'text-amber-950 font-bold' : 'text-slate-400'\\}\\\\}>\\s*\\{p.label\\}\\s*<\\/span>/g,
  ''
);

// 4
content = content.replace(
  /\\{\\/\\* SOBRES POR JUGADOR \\*\\/\\}.*?\\{\\/\\* LÍMITE DE TIEMPO \\*\\/\\}/s,
  '{/* LÍMITE DE TIEMPO */}'
);
content = content.replace(
  /className=\"grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4\"/,
  'className=\"grid grid-cols-1 gap-3 sm:gap-4\"'
);

// 5
content = content.replace(
  /<div className=\"flex items-center justify-center gap-1 text-slate-400 text-center\">\\s*<span className=\"material-symbols-outlined text-\\[15px\\]\">lock_reset<\\/span>\\s*<span className=\"font-sans text-\\[10px\\] sm:text-\\[11px\\] uppercase tracking-wider\">\\s*El código expirará tras 3 horas de inactividad\\s*<\\/span>\\s*<\\/div>/g,
  ''
);

// 6
content = content.replace(
  /\\{\\/\\* Footer Branding matching mockup \\*\\/\\}.*?<\\/footer>/s,
  ''
);

fs.writeFileSync('client/src/components/AdminSetup.jsx', content);

