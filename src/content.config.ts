import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const projectsCollection = defineCollection({
  // Astro v6 requires a loader for content collections
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    image: z.string().optional(),
  }),
});

export const collections = {
  'projects': projectsCollection,
};
