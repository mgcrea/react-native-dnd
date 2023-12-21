import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import rehypeExternalLinks from "rehype-external-links";
import MDXCodeBlocks, { mdxCodeBlockAutoImport } from "astro-mdx-code-blocks";
import AutoImport from "astro-auto-import";

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
    AutoImport({
      imports: [mdxCodeBlockAutoImport("src/components/markdown/CodeBlock.astro")],
    }),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    MDXCodeBlocks(),
    mdx(),
    preact(),
  ],
  site: `https://mgcrea.github.io`,
  base: "/react-native-dnd",
});
