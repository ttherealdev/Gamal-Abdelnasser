/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",

  jsxSingleQuote: false,

  proseWrap: "always",

  htmlWhitespaceSensitivity: "css",
  singleAttributePerLine: true,

  embeddedLanguageFormatting: "auto",

  plugins: ["prettier-plugin-tailwindcss"],

  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["cn", "cva", "clsx", "twMerge", "tv"],
  tailwindAttributes: ["className", "class", "ngClass"],

  overrides: [
    {
      files: ["*.json", "*.jsonc"],
      options: {
        printWidth: 80,
        trailingComma: "none",
      },
    },
    {
      files: ["*.md", "*.mdx"],
      options: {
        printWidth: 80,
        proseWrap: "always",
        embeddedLanguageFormatting: "off",
      },
    },
    {
      files: ["*.yaml", "*.yml"],
      options: {
        tabWidth: 2,
        singleQuote: true,
      },
    },
    {
      files: ["*.css", "*.scss"],
      options: {
        singleQuote: false,
      },
    },
  ],
};
