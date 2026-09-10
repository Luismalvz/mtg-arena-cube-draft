import React from 'react';

export function ManaSymbol({ symbol, size = 'sm' }) {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 text-[10px]',
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  }[size] || 'w-4 h-4 text-xs';

  const clean = symbol.replace(/[{}]/g, '').toUpperCase();

  const colorStyles = {
    W: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    U: 'bg-blue-600 text-white border-blue-400 font-bold',
    B: 'bg-stone-900 text-stone-200 border-stone-600 font-bold',
    R: 'bg-red-600 text-white border-red-400 font-bold',
    G: 'bg-emerald-600 text-white border-emerald-400 font-bold',
    C: 'bg-slate-400 text-slate-900 border-slate-300 font-bold',
    T: 'bg-stone-400 text-stone-900 border-stone-300 font-bold'
  };

  const style = colorStyles[clean] || 'bg-slate-700 text-amber-100 border-slate-500 font-semibold';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border shadow-sm select-none leading-none ${sizeClasses} ${style}`}
      title={`Mana ${clean}`}
    >
      {clean}
    </span>
  );
}

export function ManaCost({ manaCost, size = 'sm' }) {
  if (!manaCost) return null;
  const matches = manaCost.match(/\{[^}]+\}/g);
  if (!matches) return null;

  return (
    <div className="inline-flex items-center gap-0.5">
      {matches.map((sym, i) => (
        <ManaSymbol key={i} symbol={sym} size={size} />
      ))}
    </div>
  );
}
