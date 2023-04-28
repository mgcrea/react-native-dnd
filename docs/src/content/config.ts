import { defineCollection, z } from "astro:content";
import { SITE } from "src/config/env";

const docs = defineCollection({
  schema: z.object({
    title: z.string().default(SITE.title),
    description: z.string().default(SITE.description),
    order: z.number().default(99),
    lang: z.literal("en-us").default(SITE.defaultLanguage),
    dir: z.union([z.literal("ltr"), z.literal("rtl")]).default("ltr"),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    ogLocale: z.string().optional(),
  }),
});

export const collections = { docs };
