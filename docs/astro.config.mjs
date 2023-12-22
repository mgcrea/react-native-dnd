import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import rehypeExternalLinks from "rehype-external-links";
import MDXCodeBlocks from "astro-mdx-code-blocks";

// https://astro.build/config
export default defineConfig({
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          content: {
            type: "text",
            value: " 🔗",
          },
        },
      ],
    ],
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "one-dark-pro",
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    react(),
    preact(),
    MDXCodeBlocks(),
  ],
  site: `https://mgcrea.github.io`,
  base: "/react-native-dnd",
});
