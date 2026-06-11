import { Fragment } from 'react';
import katex from 'katex';

/**
 * Render teks yang mungkin mengandung notasi matematis LaTeX inline di antara
 * tanda `$...$`. Contoh: "Hasil dari $2^{10} - \\sqrt{144}$ adalah?".
 *
 * - Segmen di dalam `$...$` dirender sebagai math (KaTeX).
 * - Segmen teks biasa dirender apa adanya; newline (\n) jadi <br />.
 * - Jika LaTeX tidak valid, KaTeX tidak melempar error (throwOnError:false)
 *   sehingga teks asli tetap tampil — tidak merusak halaman.
 *
 * Mata uang Indonesia memakai "Rp" (bukan "$"), jadi "$" aman sebagai delimiter.
 */

function renderMath(expr: string): string {
  try {
    return katex.renderToString(expr, { throwOnError: false, output: 'html' });
  } catch {
    return expr;
  }
}

function TextWithBreaks({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export function MathText({
  value,
  className,
}: {
  value?: string | null;
  className?: string;
}) {
  if (value == null || value === '') return null;

  // Pisah pada $...$ — capture group membuat ekspresi math ada di indeks ganjil.
  const segments = value.split(/\$([^$]+)\$/g);
  const hasMath = segments.length > 1;

  if (!hasMath) {
    return (
      <span className={className}>
        <TextWithBreaks text={value} />
      </span>
    );
  }

  return (
    <span className={className}>
      {segments.map((segment, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: renderMath(segment) }}
          />
        ) : (
          <TextWithBreaks key={i} text={segment} />
        )
      )}
    </span>
  );
}
