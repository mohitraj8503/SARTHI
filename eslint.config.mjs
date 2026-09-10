import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["node_modules", ".next", ".next_stable", "out", "dist", "build", "coverage", "uploads", "public/sw.js", "public/workbox-*.js"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-page-custom-font": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;