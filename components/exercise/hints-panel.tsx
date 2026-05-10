"use client";

import { useState } from "react";

export function HintsPanel({ indices }: { indices: string[] }) {
  const [revealed, setRevealed] = useState(0);
  if (indices.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
          indices
        </p>
        <span className="text-[10px] text-stone-600">
          {revealed}/{indices.length}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {indices.slice(0, revealed).map((h, i) => (
          <li key={i} className="text-xs leading-relaxed text-stone-300">
            <span className="mr-2 text-stone-600">{i + 1}.</span>
            {h}
          </li>
        ))}
      </ul>
      {revealed < indices.length && (
        <button
          type="button"
          onClick={() => setRevealed((n) => n + 1)}
          className="mt-3 border border-stone-700 bg-stone-900 px-3 py-1 text-xs text-stone-300 transition hover:border-amber hover:text-amber"
        >
          <span className="mr-1 text-stone-600">&gt;</span>
          révéler un indice
        </button>
      )}
    </div>
  );
}
