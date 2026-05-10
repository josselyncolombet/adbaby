"use client";

import { useState } from "react";
import type { Exercise, ValidationResult } from "@/types/exercise";

export function QcmForm({
  exercise,
  validateAction,
}: {
  exercise: Exercise;
  validateAction: (
    exerciseId: string,
    answer: string,
  ) => Promise<{ result: ValidationResult }>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!selected) return;
    setPending(true);
    try {
      const r = await validateAction(exercise.id, selected);
      setResult(r.result);
    } finally {
      setPending(false);
    }
  };

  const options = exercise.donnees.options ?? [];
  const multi = exercise.type === "audit";
  const [multiSel, setMultiSel] = useState<string[]>([]);

  const submitMulti = async () => {
    setPending(true);
    try {
      const r = await validateAction(exercise.id, multiSel.sort().join(","));
      setResult(r.result);
    } finally {
      setPending(false);
    }
  };

  if (multi) {
    const audit = exercise.donnees.anomalies ?? [];
    return (
      <div className="space-y-3">
        <ul className="space-y-2">
          {audit.map((o) => {
            const checked = multiSel.includes(o.value);
            return (
              <li key={o.value}>
                <label
                  className={`flex cursor-pointer items-start gap-3 border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-amber bg-amber/10 text-amber"
                      : "border-stone-800 bg-stone-900/30 text-stone-300 hover:border-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 accent-amber"
                    checked={checked}
                    onChange={(e) => {
                      setMultiSel((s) =>
                        e.target.checked
                          ? [...s, o.value]
                          : s.filter((v) => v !== o.value),
                      );
                    }}
                  />
                  <span>{o.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          disabled={pending}
          onClick={submitMulti}
          className="border border-stone-700 bg-stone-900 px-3 py-1.5 text-sm text-stone-200 transition hover:border-amber hover:text-amber disabled:opacity-50"
        >
          {pending ? "vérification…" : "▶ Valider"}
        </button>
        <Feedback result={result} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {options.map((o) => (
          <li key={o.value}>
            <label
              className={`flex cursor-pointer items-start gap-3 border px-3 py-2 text-sm transition ${
                selected === o.value
                  ? "border-amber bg-amber/10 text-amber"
                  : "border-stone-800 bg-stone-900/30 text-stone-300 hover:border-stone-600"
              }`}
            >
              <input
                type="radio"
                name={`qcm-${exercise.id}`}
                className="mt-1 accent-amber"
                checked={selected === o.value}
                onChange={() => setSelected(o.value)}
              />
              <span>{o.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={pending || !selected}
        onClick={submit}
        className="border border-stone-700 bg-stone-900 px-3 py-1.5 text-sm text-stone-200 transition hover:border-amber hover:text-amber disabled:opacity-50"
      >
        {pending ? "vérification…" : "▶ Valider"}
      </button>
      <Feedback result={result} />
    </div>
  );
}

function Feedback({ result }: { result: ValidationResult | null }) {
  if (!result) return null;
  return (
    <div
      className={`border px-3 py-2 text-sm ${
        result.ok
          ? "border-emerald-700 bg-emerald-900/20 text-emerald-300"
          : "border-terminal-err/60 bg-terminal-err/10 text-terminal-err"
      }`}
    >
      {result.ok ? "✓ " : "✗ "}
      {result.ok ? result.message ?? "Bonne réponse." : result.message}
      {!result.ok && "attendu" in result && result.attendu && (
        <p className="mt-1 text-xs text-stone-500">
          attendu : <span className="text-stone-300">{result.attendu}</span>
        </p>
      )}
    </div>
  );
}
