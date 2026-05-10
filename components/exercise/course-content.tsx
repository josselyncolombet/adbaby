"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function CourseContent({ body }: { body: string }) {
  return (
    <div className="course-content max-w-3xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 text-3xl text-amber first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 border-t border-stone-800 pt-6 text-xl text-amber first:mt-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-base uppercase tracking-wider text-stone-400">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mt-3 space-y-1 text-sm text-stone-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-3 list-decimal space-y-1 pl-6 text-sm text-stone-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-baseline gap-2 before:text-stone-700 before:content-['·']">
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-amber-dim">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-stone-200">{children}</em>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.includes("language-");
            const text = String(children).replace(/\n$/, "");
            if (isBlock) {
              return (
                <pre className="my-3 overflow-auto border-l-2 border-stone-700 bg-stone-900/60 px-3 py-2 text-xs font-mono text-stone-200">
                  <code>{text}</code>
                </pre>
              );
            }
            return (
              <code className="rounded bg-stone-800 px-1 py-0.5 font-mono text-[0.85em] text-amber-dim">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-amber/40 pl-4 text-sm italic text-stone-400">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-stone-800" />,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-amber underline-offset-2 hover:underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-auto border border-stone-800">
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-stone-800 bg-stone-900 px-2 py-1 text-left text-stone-400">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-stone-800/60 px-2 py-1 text-stone-200">
              {children}
            </td>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
