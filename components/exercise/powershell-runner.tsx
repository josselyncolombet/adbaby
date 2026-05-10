"use client";

import { useState, useTransition } from "react";
import type { Exercise, ValidationResult } from "@/types/exercise";

interface Props {
  exercise: Exercise;
  validateAction: (
    exerciseId: string,
    command: string,
  ) => Promise<{
    result: ValidationResult;
    output: string;
    errors: string[];
  }>;
}

interface HistoryEntry {
  cmd: string;
  output: string;
  errors: string[];
}

export function PowerShellRunner({ exercise, validateAction }: Props) {
  const [cmd, setCmd] = useState(exercise.donnees.initialCode ?? "");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const r = await validateAction(exercise.id, trimmed);
      setHistory((h) => [
        ...h,
        { cmd: trimmed, output: r.output ?? "", errors: r.errors ?? [] },
      ]);
      setResult(r.result);
    });
  };

  const clear = () => {
    setHistory([]);
    setResult(null);
  };

  const prompt = `PS C:\\> `;

  return (
    <div className="flex flex-col gap-3">
      {/* Saisie — en haut */}
      <div className="border border-stone-800 bg-black">
        <div className="flex items-center justify-between border-b border-stone-800 px-3 py-1.5 text-[10px] uppercase tracking-wider text-stone-500">
          <div className="flex items-center gap-2">
            <span className="text-amber">PS</span>
            <span>{exercise.donnees.snapshot ?? "session"}</span>
            {exercise.donnees.initialCode && (
              <span className="text-amber">· script à adapter</span>
            )}
          </div>
          <span className="text-stone-600">Entrée pour exécuter</span>
        </div>
        <div className="flex items-start px-3 py-2 font-mono text-sm">
          <span className="shrink-0 select-none pt-[2px] text-amber">
            {prompt}
          </span>
          <textarea
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Get-ADUser -Identity ..."
            spellCheck={false}
            rows={3}
            autoFocus
            className="block w-full resize-y bg-transparent pl-1 text-stone-100 outline-none placeholder:text-stone-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="border border-stone-700 bg-stone-900 px-3 py-1.5 text-sm text-stone-200 transition hover:border-amber hover:text-amber disabled:opacity-50"
        >
          {isPending ? "exécution…" : "▶ Exécuter (Entrée)"}
        </button>
        <span className="text-[10px] text-stone-600">
          Maj+Entrée = nouvelle ligne
        </span>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="ml-auto text-[10px] uppercase tracking-wider text-stone-500 transition hover:text-amber"
          >
            effacer
          </button>
        )}
      </div>

      {/* Sortie — en bas */}
      {(history.length > 0 || isPending) && (
        <div className="border border-stone-800 bg-black">
          <div className="border-b border-stone-800 px-3 py-1.5 text-[10px] uppercase tracking-wider text-stone-500">
            sortie
          </div>
          <div className="max-h-[40vh] space-y-2 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed">
            {history.map((h, i) => (
              <div key={i}>
                <p className="whitespace-pre-wrap break-words">
                  <span className="text-amber">{prompt}</span>
                  <span className="text-stone-100">{h.cmd}</span>
                </p>
                {h.errors.map((err, j) => (
                  <p
                    key={j}
                    className="whitespace-pre-wrap break-words text-terminal-err"
                  >
                    {err}
                  </p>
                ))}
                {h.output && (
                  <pre className="whitespace-pre-wrap break-words text-stone-300">
                    {h.output}
                  </pre>
                )}
              </div>
            ))}
            {isPending && <p className="text-stone-500">…</p>}
          </div>
        </div>
      )}

      {result && (
        <div
          className={`border px-3 py-2 text-sm ${
            result.ok
              ? "border-emerald-700 bg-emerald-900/20 text-emerald-300"
              : "border-terminal-err/60 bg-terminal-err/10 text-terminal-err"
          }`}
        >
          <p>
            {result.ok ? "✓ " : "✗ "}
            {result.ok ? result.message ?? "Bonne commande." : result.message}
          </p>
          {!result.ok && "attendu" in result && result.attendu && (
            <p className="mt-1 text-xs text-stone-500">
              attendu :{" "}
              <span className="text-stone-300">{result.attendu}</span>
            </p>
          )}
          {!result.ok && "obtenu" in result && result.obtenu && (
            <p className="text-xs text-stone-500">
              obtenu :{" "}
              <span className="text-stone-300">{result.obtenu}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
