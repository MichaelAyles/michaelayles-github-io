import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    project: z.string().optional(),
    featured: z.boolean().default(false),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    links: z.object({
      live: z.string().nullable().optional(),
      github: z.string().nullable().optional(),
      blog: z.string().nullable().optional(),
    }),
    blogPost: z.string().nullable().optional(),
    order: z.number(),
  }),
});

export const collections = { blog, projects };
