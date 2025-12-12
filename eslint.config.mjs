import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Allow flexible typing across API handlers/admin UI without blocking CI
      "@typescript-eslint/no-explicit-any": "off",
      // Permit `<img>` usage until we migrate to next/image everywhere
      "@next/next/no-img-element": "off",
      // Allow unused vars during rapid admin iteration (can re-enable later)
      "@typescript-eslint/no-unused-vars": "off",
      // Keep PostCSS config terse
      "import/no-anonymous-default-export": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
