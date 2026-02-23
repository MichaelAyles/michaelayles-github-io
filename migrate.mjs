import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'blog');
const CONFIG_FILE = path.join(ROOT, 'sites-config.json');
const OUT_BLOG = path.join(ROOT, 'src', 'content', 'blog');
const OUT_PROJECTS = path.join(ROOT, 'src', 'content', 'projects');
const OUT_MEDIA = path.join(ROOT, 'public', 'media');

// Ensure output dirs exist
[OUT_BLOG, OUT_PROJECTS, OUT_MEDIA].forEach(d => fs.mkdirSync(d, { recursive: true }));

// Load sites config
const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

// Build a map of writeup path -> site config entry
const writeupMap = new Map();
for (const site of config.sites) {
  if (site.links?.writeup) {
    // Normalize: "blog/foo/blog.md" -> "foo"
    const parts = site.links.writeup.split('/');
    // Handle paths like "blog/openscad-doom.md/openscad-doom.md"
    const slug = parts[1]; // always the directory name after "blog/"
    writeupMap.set(slug, site);
  }
}

// Get git date for a file (first commit date)
function getGitDate(filePath) {
  try {
    const result = execSync(
      `git log --diff-filter=A --follow --format=%aI -- "${filePath}"`,
      { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    const lines = result.split('\n').filter(Boolean);
    return lines.length > 0 ? lines[lines.length - 1].split('T')[0] : '2024-01-01';
  } catch {
    return '2024-01-01';
  }
}

// Extract H1 title from markdown
function extractTitle(md) {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].replace(/[*_`]/g, '').trim() : null;
}

// Extract first paragraph as description
function extractExcerpt(md) {
  // Remove the H1 line and any images/HTML before first real paragraph
  const lines = md.split('\n');
  let collecting = false;
  let excerpt = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!collecting) {
      // Skip H1, empty lines, images, HTML tags, horizontal rules
      if (trimmed.startsWith('#') || trimmed === '' || trimmed.startsWith('![') ||
          trimmed.startsWith('<') || trimmed.startsWith('---') || trimmed.startsWith('*') && trimmed.endsWith('*')) {
        continue;
      }
      // Skip H2 headers that come before first paragraph
      if (trimmed.startsWith('##')) continue;
      collecting = true;
      excerpt.push(trimmed);
    } else {
      if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('![') || trimmed.startsWith('<')) break;
      excerpt.push(trimmed);
    }
  }
  const text = excerpt.join(' ');
  return text.length > 200 ? text.slice(0, 197) + '...' : text;
}

// Copy directory contents recursively (media files only)
function copyMedia(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  const mediaExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.mp4', '.webp', '.webm'];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const srcPath = path.join(dir, entry.name);
      const relPath = path.relative(srcDir, srcPath);
      const destPath = path.join(destDir, relPath);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        walk(srcPath);
      } else if (mediaExts.includes(path.extname(entry.name).toLowerCase())) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  walk(srcDir);
}

// Rewrite image paths in markdown
function rewriteImagePaths(md, slug) {
  // HTML img tags: src="./image.png" or src="image.png"
  md = md.replace(
    /(<img\s+[^>]*src=["'])(?!http|\/\/)(?:\.\/)?((?:(?!["']).)+)(["'])/gi,
    (match, prefix, imgPath, suffix) => `${prefix}/media/${slug}/${imgPath}${suffix}`
  );
  // Markdown images: ![alt](./image.png) or ![alt](image.png)
  md = md.replace(
    /!\[([^\]]*)\]\((?!http|\/\/)(?:\.\/)?((?:(?!\)).)+)\)/g,
    (match, alt, imgPath) => `![${alt}](/media/${slug}/${imgPath})`
  );
  return md;
}

// Process blog posts
const blogDirs = fs.readdirSync(BLOG_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

console.log(`Found ${blogDirs.length} blog directories`);

// Determine featured posts (ones marked featured in config)
const featuredSlugs = new Set();
for (const site of config.sites) {
  if (site.featured) {
    const writeupPath = site.links?.writeup || '';
    const parts = writeupPath.split('/');
    if (parts.length >= 2) featuredSlugs.add(parts[1]);
  }
}

let order = 0;
for (const slug of blogDirs) {
  const blogDir = path.join(BLOG_DIR, slug);
  const blogMdPath = path.join(blogDir, 'blog.md');

  // Handle the openscad-doom.md case (directory named with .md)
  let mdPath = blogMdPath;
  if (slug === 'openscad-doom.md') {
    mdPath = path.join(blogDir, 'openscad-doom.md');
    if (!fs.existsSync(mdPath)) mdPath = blogMdPath;
  }

  if (!fs.existsSync(mdPath)) {
    console.log(`  Skipping ${slug}: no blog.md found`);
    continue;
  }

  const md = fs.readFileSync(mdPath, 'utf-8');
  const siteConfig = writeupMap.get(slug);
  const title = extractTitle(md) || siteConfig?.name || slug;
  const description = siteConfig?.description || extractExcerpt(md);
  const tags = siteConfig?.tags || [];
  const date = getGitDate(mdPath);
  const isFeatured = featuredSlugs.has(slug);

  // Normalize slug (remove .md suffix if present)
  const cleanSlug = slug.replace(/\.md$/, '');

  // Rewrite image paths in markdown content
  let processedMd = rewriteImagePaths(md, cleanSlug);

  // Build frontmatter
  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `description: "${description.replace(/"/g, '\\"')}"`,
    `date: ${date}`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
  ];
  if (siteConfig?.name) {
    const projSlug = siteConfig.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    frontmatter.push(`project: "${projSlug}"`);
  }
  frontmatter.push(`featured: ${isFeatured}`);
  frontmatter.push(`draft: false`);
  frontmatter.push('---');
  frontmatter.push('');

  // Remove the H1 from the body (it's now in frontmatter as title)
  processedMd = processedMd.replace(/^#\s+.+$/m, '').trimStart();

  const outputContent = frontmatter.join('\n') + processedMd;
  fs.writeFileSync(path.join(OUT_BLOG, `${cleanSlug}.md`), outputContent);

  // Copy media assets
  copyMedia(blogDir, path.join(OUT_MEDIA, cleanSlug));

  console.log(`  Migrated: ${cleanSlug} (${title})`);
}

// Process projects -> JSON files
order = 0;
for (const site of config.sites) {
  const slug = site.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Find matching blog slug
  let blogSlug = null;
  if (site.links?.writeup) {
    const parts = site.links.writeup.split('/');
    if (parts.length >= 2) {
      blogSlug = parts[1].replace(/\.md$/, '');
    }
  }

  const projectData = {
    name: site.name,
    description: site.description,
    tags: site.tags || [],
    featured: site.featured || false,
    links: {
      live: site.links?.live || null,
      github: site.links?.github || null,
      blog: site.links?.blog || null,
    },
    blogPost: blogSlug,
    order: order++,
  };

  fs.writeFileSync(
    path.join(OUT_PROJECTS, `${slug}.json`),
    JSON.stringify(projectData, null, 2)
  );
  console.log(`  Project: ${slug}`);
}

// Copy root-level media (torque images)
for (const file of fs.readdirSync(ROOT)) {
  if (/\.(png|jpg|gif|svg)$/i.test(file) && !file.startsWith('.')) {
    fs.copyFileSync(path.join(ROOT, file), path.join(OUT_MEDIA, file));
  }
}

console.log('\nMigration complete!');
console.log(`Blog posts: ${fs.readdirSync(OUT_BLOG).length}`);
console.log(`Projects: ${fs.readdirSync(OUT_PROJECTS).length}`);
