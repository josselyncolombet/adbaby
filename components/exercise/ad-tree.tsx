"use client";

import type { ADSnapshot } from "@/lib/ad/types";

export function AdTree({ snapshot }: { snapshot: ADSnapshot }) {
  return (
    <div className="border border-stone-800 bg-stone-900/30 p-4 text-xs">
      <p className="text-amber">📁 {snapshot.domain.name}</p>
      <ul className="mt-1 space-y-0.5 pl-4 text-stone-300">
        {snapshot.ous.map((ou) => {
          const usersInOu = snapshot.users.filter((u) => u.parentDn === ou.dn);
          return (
            <li key={ou.dn}>
              <p>📁 {ou.name}</p>
              <ul className="space-y-0.5 pl-4 text-stone-400">
                {usersInOu.map((u) => (
                  <li key={u.dn}>
                    👤 {u.samAccountName}
                    {!u.enabled && (
                      <span className="ml-2 text-stone-600">[disabled]</span>
                    )}
                    {u.locked && (
                      <span className="ml-2 text-terminal-err">[locked]</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
