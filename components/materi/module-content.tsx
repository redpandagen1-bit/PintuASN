'use client';

// ============================================================
// components/materi/module-content.tsx
//
// Render isi materi "modul" (content_body) yang ditulis dalam Markdown.
// Mendukung:
//   - Heading, teks tebal, list, tabel (GFM)
//   - Teks matematika LaTeX:  $...$ (inline)  /  $$...$$ (blok)
//   - Gambar  ![alt](url)
//   - SVG inline  <svg ...>...</svg>  → tampil sebagai gambar/diagram
//   - Blockquote  >  → otomatis jadi kotak "Poin Penting"
//
// Konten di-generate admin (lewat upload JSON) & divalidasi di server
// (script/handler SVG ditolak), jadi aman dirender apa adanya.
// ============================================================

import ReactMarkdown from 'react-markdown';
import remarkGfm     from 'remark-gfm';
import remarkMath    from 'remark-math';
import rehypeRaw     from 'rehype-raw';
import rehypeKatex   from 'rehype-katex';

export function ModuleContent({ body }: { body: string }) {
  return (
    <div className="materi-prose text-[13px] leading-6 text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-extrabold text-slate-900 mt-5 mb-2.5 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[15px] font-bold text-slate-900 mt-5 mb-2 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-slate-800 mt-4 mb-1.5 first:mt-0">{children}</h3>
          ),
          p: ({ children }) => <p className="my-2.5 leading-6">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="my-2.5 ml-5 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-2.5 ml-5 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-6 pl-0.5">{children}</li>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer"
              className="text-sky-600 underline underline-offset-2 hover:text-sky-700">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[13px] font-mono text-slate-800">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <div className="my-3 border-l-4 border-slate-300 bg-slate-50 px-3.5 py-2 text-slate-600 [&>p]:my-1 [&>p]:text-[13px]">
              {children}
            </div>
          ),
          img: ({ src, alt }) => (
            <span className="block my-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src as string} alt={alt || ''} className="inline-block max-w-full rounded-xl border border-slate-200" />
              {alt && <span className="block mt-1.5 text-xs text-slate-400">{alt}</span>}
            </span>
          ),
          svg: (props: any) => (
            <span className="block my-4 text-center [&>svg]:inline-block [&>svg]:max-w-full [&>svg]:h-auto">
              <svg {...props} />
            </span>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-slate-200 px-3 py-2 text-left font-bold text-slate-700">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 px-3 py-2 align-top">{children}</td>
          ),
          hr: () => <hr className="my-6 border-slate-200" />,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
