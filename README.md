# mikeayles.com

Personal portfolio and blog. Built with [Astro 5](https://astro.build/), deployed to GitHub Pages.

## Setup

```bash
npm install
npm run dev       # localhost:4321
npm run build     # static output to dist/
```

## Stack

- **Astro 5** - static site generation, content collections
- **MDX + React** - interactive components in blog posts
- **GitHub Actions** - deploy on push to `main`

## Structure

Content lives in `src/content/` as three collections:

- **blog/** - Markdown and MDX posts (`<slug>/index.md` or `index.mdx`) with colocated images
- **projects/** - JSON files with project metadata, links, and cross-references to blog posts
- **featured/** - Markdown write-ups for showcase pages

Blog posts can embed React components (in `src/components/blog/`) using MDX with `client:visible` hydration for interactive calculators and charts.

## Styling

The look is "warm technical": warm paper and ink neutrals rather than cool greys, an orange accent, and a mono face for technical furniture (dates, labels, code, table headers). Everything is token-driven: colours are defined once as CSS custom properties in `src/styles/global.css` and referenced everywhere else. Page-specific styles live in scoped `<style>` blocks inside each `.astro` file.

### Fonts

Loaded from Google Fonts in `src/layouts/BaseLayout.astro`:

| Token | Face | Used for |
| --- | --- | --- |
| `--font-heading` | Space Grotesk 500/600/700 | Headings only |
| `--font-body` | Inter 400-800 | Body text and UI |
| `--font-mono` | JetBrains Mono 400/500 | Code, date pills, tags, table headers, small-caps labels |

### Colour tokens

Defined at `:root` (light) and overridden under `[data-theme="dark"]`. Dark mode is toggled by setting `data-theme="dark"` on `<html>`, persisted to localStorage, with an inline script in `BaseLayout.astro` applying it before paint.

| Token | Part of the page | Light | Dark |
| --- | --- | --- | --- |
| `--paper` | Page background | `#f6f4ef` | `#161310` |
| `--ink` | Body text | `#22242a` | `#e8e2d6` |
| `--heading` | Headings | `#17181c` | `#f4eee3` |
| `--muted` | Deks, captions, secondary text | `#66696f` | `#948e82` |
| `--accent` | Links, h2 underline, date pill text | `#ba4a12` | `#f0782e` |
| `--border` | Rules, table borders, dividers | `#e6e0d6` | `#2c2721` |
| `--inline-code-bg` | Inline code background, table headers | `#efece5` | `#221e18` |
| `--inline-code-border` | Inline code border | `#e2dccf` | `#342d24` |
| `--inline-code-ink` | Inline code text | `#9a3d0f` | `#f0a860` |
| `--chip-bg` | Date/category pill background | `#f7ece4` | `#2a1f16` |
| `--chip-border` | Date/category pill border | `#e6d4c4` | `#4a2f1c` |

Code blocks keep a fixed dark chrome in both themes: `#1b1f23` background with `#c9d1d9` text, and a `#14181c` language bar with `#8b949e` labels.

Both themes pass WCAG AA (4.5:1 or better) for `--ink`, `--muted`, `--accent`, and inline code against `--paper`.

### Legacy aliases

Older components (nav, footer, index pages, React blog components) read an earlier set of token names. These are aliased to the warm palette in `global.css`, so new work should prefer the tokens above, but the old names remain valid:

| Alias | Maps to (light / dark) |
| --- | --- |
| `--background` | `var(--paper)` |
| `--text-primary` | `var(--ink)` |
| `--text-secondary` | `var(--muted)` |
| `--link` | `var(--accent)` |
| `--surface` | `#efece5` / `#1d1915` |
| `--hover-bg` | `#f0ede6` / `#241f1a` |
| `--text-dim` | `#a8a294` / `#5f584d` |

### Type and layout

- Post prose: 18px body (17px under 640px wide) at line-height 1.7, in a 720px centred column (`.prose` in `global.css` and `.article` in `src/pages/blog/[slug].astro`).
- `h2` in posts sits on a 2px `--accent` underline that hugs the text; `h1` and the dek/description are separated from the body by a `--border` rule.
- The homepage and blog index render a chronological feed via `src/components/PostList.astro`, with a month-grouped archive in `src/components/Sidebar.astro` (shown at 900px and wider).
- One deliberate omission: no em-dashes anywhere, in content or code.

## License

Content and code are copyright Michael Ayles unless otherwise noted.
