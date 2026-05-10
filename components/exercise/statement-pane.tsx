import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Exercise } from "@/types/exercise";
import type { ADSnapshot } from "@/lib/ad/types";
import { AdTree } from "./ad-tree";

const DIFF_COLOR: Record<string, string> = {
  facile: "text-terminal-ok",
  moyen: "text-terminal-warn",
  difficile: "text-terminal-err",
};

export function StatementPane({
  exercise,
  snapshot,
}: {
  exercise: Exercise;
  snapshot: ADSnapshot | null;
}) {
  return (
    <div className="space-y-6 px-4 py-5 md:px-6 md:py-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.25em] text-stone-500">
          <span>énoncé</span>
          <span className="text-stone-700">·</span>
          <span className="tabular-nums">
            {exercise.module}.{exercise.ordre}
          </span>
          <span className="text-stone-700">·</span>
          <span className={DIFF_COLOR[exercise.difficulte] ?? "text-stone-500"}>
            {exercise.difficulte}
          </span>
        </div>
        <h1 className="text-xl text-amber md:text-2xl">{exercise.titre}</h1>
        <div className="flex flex-wrap gap-2">
          {exercise.concepts.map((c) => (
            <span
              key={c}
              className="border border-stone-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-stone-400"
            >
              {c}
            </span>
          ))}
        </div>
      </header>

      <Section label="contexte">
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-stone-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {exercise.contexte}
          </ReactMarkdown>
        </div>
      </Section>

      {snapshot && (
        <Section label="arbre AD">
          <AdTree snapshot={snapshot} />
        </Section>
      )}

      <Section label="à faire">
        <p className="text-base text-amber-dim">{exercise.enonce}</p>
      </Section>

      <div className="border-t border-stone-800 pt-4">
        <Link
          href={`/cours/${exercise.module}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 transition hover:text-amber"
        >
          <span>📖</span>
          rappel théorique du module {exercise.module}
          <span className="text-stone-700">→</span>
        </Link>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
        {label}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
