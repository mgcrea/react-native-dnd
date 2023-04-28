import { getCollection } from "astro:content";

const docs = await getCollection("docs");

const SECTIONS_ORDER = ["guides", "hooks", "providers", "components", "utils"];

export type NavigationItem = {
  title: string;
  order: number;
  href: string;
};

const docsBySection = docs.reduce<Record<string, NavigationItem[]>>((soFar, entry) => {
  const path = entry.slug.split("/");
  const { title, order } = entry.data;
  const navigationItem: NavigationItem = { title, order, href: `/${entry.slug}` };
  const sectionSlug = String(path[0]);
  if (!soFar[sectionSlug]) {
    soFar[sectionSlug] = [];
  }
  soFar[sectionSlug]?.push(navigationItem);
  return soFar;
}, {});

export const NAVIGATION_ITEMS = Object.entries(docsBySection).sort(([a], [b]) =>
  SECTIONS_ORDER.indexOf(a) < SECTIONS_ORDER.indexOf(b) ? -1 : 1
);

NAVIGATION_ITEMS.forEach(([_, items]) => {
  items.sort((a, b) => a.order - b.order);
});

console.dir(NAVIGATION_ITEMS, { depth: null });
