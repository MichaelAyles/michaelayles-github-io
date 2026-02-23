# mikeayles.com

Personal portfolio and blog. Built with [Astro 5](https://astro.build/), deployed to GitHub Pages.

## Setup

```bash
npm install
npm run dev       # localhost:4321
npm run build     # static output to dist/
```

## Stack

- **Astro 5** — static site generation, content collections
- **MDX + React** — interactive components in blog posts
- **GitHub Actions** — deploy on push to `main`

## Structure

Content lives in `src/content/` as three collections:

- **blog/** — Markdown and MDX posts (`<slug>/index.md` or `index.mdx`) with colocated images
- **projects/** — JSON files with project metadata, links, and cross-references to blog posts
- **featured/** — Markdown write-ups for showcase pages

Blog posts can embed React components (in `src/components/blog/`) using MDX with `client:visible` hydration for interactive calculators and charts.

## License

Content and code are copyright Michael Ayles unless otherwise noted.
