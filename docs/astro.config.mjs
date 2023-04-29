import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import prefetch from "@astrojs/prefetch";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import AutoImport from "astro-auto-import";
import MDXCodeBlocks, { mdxCodeBlockAutoImport } from "astro-mdx-code-blocks";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";

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
    preact(),
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    MDXCodeBlocks(),
    mdx(),
    prefetch(),
  ],
  site: `https://mgcrea.github.io`,
  base: "/react-native-dnd",
});
