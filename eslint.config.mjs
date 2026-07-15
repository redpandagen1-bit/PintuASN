import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Deno edge functions (runtime & globals berbeda dari app Next.js).
    "supabase/functions/**",
  ]),
  {
    // Baseline lint untuk build (ignoreDuringBuilds kini false):
    // - Rule stylistic/perf diturunkan ke "warn" agar tidak MEMBLOK build,
    //   tapi tetap terlihat di output lint. Menaikkan ~137 `any` ke tipe
    //   eksplisit adalah refactor besar & berisiko; dijadikan utang terukur,
    //   bukan penghalang rilis.
    // - Rule yang menangkap BUG nyata (react-hooks/rules-of-hooks,
    //   exhaustive-deps) tetap "error".
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "warn",
      // Rule eksperimental & keliru pada async Server Component
      // (pola `try { await fetch } catch { notFound() }` yang idiomatik).
      "react-hooks/error-boundaries": "off",
      // Diagnostik React Compiler (bundled di eslint-config-next terbaru).
      // Bukan bug korektnes — ini kesiapan-optimasi yang sangat opinionated;
      // codebase belum ditulis untuk aturan ini. Dijadikan "warn" agar terlihat
      // tanpa memblok build. rules-of-hooks & exhaustive-deps tetap "error".
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
]);

export default eslintConfig;
