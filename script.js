// Theme management - default light, toggle to dark
(function initTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';

    if (isDark) {
        root.removeAttribute('data-theme');
        localStorage.removeItem('theme');
    } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Store project data for permalink lookups
const projectsMap = new Map();

function slugify(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Add private tools
    const privateToolsGrid = document.getElementById('privateTools');
    const privateTools = [
        {
            url: 'http://100.79.131.40:8080/?folder=/home/mike/Desktop/Projects',
            name: 'VS Code Server',
            description: 'Remote development environment (Tailscale VPN required)'
        },
        {
            url: 'https://homeassistant.mikeayles.com',
            name: 'Home Assistant',
            description: 'Smart home automation platform (requires authentication)'
        }
    ];

    privateTools.forEach((tool, index) => {
        const card = createCard({
            title: tool.name,
            description: tool.description,
            links: { live: tool.url },
            linkText: 'Access'
        });
        card.style.animationDelay = `${index * 0.1}s`;
        privateToolsGrid.appendChild(card);
    });

    // Load public projects from JSON
    fetch('sites-config.json')
        .then(response => response.json())
        .then(data => {
            const sitesGrid = document.getElementById('sitesGrid');
            let publicIndex = 0;

            data.sites.forEach(site => {
                const { name, type, description = '', links = {}, tags = [], media = null, featured = false } = site;

                // Skip private items (Home Assistant is now in private tools)
                if (links.live && links.live.includes('homeassistant.mikeayles.com')) {
                    return;
                }

                // Store project data for permalink lookups
                const slug = slugify(name);
                if (links.writeup) {
                    projectsMap.set(slug, { writeup: links.writeup, title: name });
                }
                if (links.featured) {
                    projectsMap.set(`${slug}-featured`, { writeup: links.featured, title: name });
                }

                if (type === 'link') {
                    const card = createCard({
                        title: name,
                        description: description,
                        links: links,
                        tags: tags,
                        media: media,
                        featured: featured
                    });
                    card.style.animationDelay = `${publicIndex * 0.1}s`;
                    sitesGrid.appendChild(card);
                    publicIndex++;
                } else if (type === 'react') {
                    const card = createCard({
                        title: name,
                        description: 'React Component (Coming Soon)',
                        links: { live: '#' },
                        tags: tags
                    });
                    const link = card.querySelector('a');
                    if (link) {
                        link.onclick = (e) => e.preventDefault();
                        link.style.cursor = 'not-allowed';
                        link.style.opacity = '0.5';
                    }
                    card.style.animationDelay = `${publicIndex * 0.1}s`;
                    sitesGrid.appendChild(card);
                    publicIndex++;
                }
            });

            // Check for permalink hash after projects are loaded
            checkHashAndOpenWriteup();
        })
        .catch(error => {
            console.error('Error fetching or parsing JSON:', error);
            document.getElementById('sitesGrid').innerHTML = '<p style="color: var(--text-muted);">Error loading projects. Please try again later.</p>';
        });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Modal close handlers
    const modal = document.getElementById('writeupModal');
    const closeBtn = document.querySelector('.modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Handle browser back/forward with hash changes
    window.addEventListener('hashchange', checkHashAndOpenWriteup);
});

function createCard({ title, description, links = {}, tags = [], media = null, featured = false, linkText = null }) {
    const item = document.createElement('div');
    item.className = 'project-item';
    item.style.animation = 'fadeInUp 0.5s ease-out forwards';

    // Title Column
    const titleCol = document.createElement('div');
    const h3 = document.createElement('div');
    h3.className = 'project-title';
    h3.textContent = title;
    titleCol.appendChild(h3);
    item.appendChild(titleCol);

    // Description Column
    const descCol = document.createElement('div');
    descCol.className = 'project-desc';
    descCol.textContent = description;
    item.appendChild(descCol);

    // Links Column
    const linksCol = document.createElement('div');
    linksCol.className = 'project-links';

    if (links.live) {
        const liveLink = document.createElement('a');
        liveLink.href = links.live;
        liveLink.className = 'project-link';
        liveLink.textContent = 'Live';
        liveLink.target = '_blank';
        linksCol.appendChild(liveLink);
    }

    if (links.blog) {
        const blogLink = document.createElement('a');
        blogLink.href = links.blog;
        blogLink.className = 'project-link';
        blogLink.textContent = 'Blog';
        blogLink.target = '_blank';
        linksCol.appendChild(blogLink);
    }

    if (links.github) {
        const ghLink = document.createElement('a');
        ghLink.href = links.github;
        ghLink.className = 'project-link';
        ghLink.textContent = 'Code';
        ghLink.target = '_blank';
        linksCol.appendChild(ghLink);
    }

    if (links.featured) {
        const slug = slugify(title);
        const featuredSlug = `${slug}-featured`;
        const featuredLink = document.createElement('a');
        featuredLink.href = `#${featuredSlug}`;
        featuredLink.className = 'project-link';
        featuredLink.textContent = 'Featured';
        featuredLink.onclick = (e) => {
            e.preventDefault();
            openWriteup(links.featured, title, featuredSlug);
        };
        linksCol.appendChild(featuredLink);
    }

    if (links.writeup) {
        const slug = slugify(title);
        const writeupLink = document.createElement('a');
        writeupLink.href = `#${slug}`;
        writeupLink.className = 'project-link';
        writeupLink.textContent = 'Read More';
        writeupLink.onclick = (e) => {
            e.preventDefault();
            openWriteup(links.writeup, title, slug);
        };
        linksCol.appendChild(writeupLink);
    }

    item.appendChild(linksCol);

    return item;
}

function createLink(url, text, type) {
    const link = document.createElement('a');
    link.href = url;
    link.className = `card-link card-link-${type}`;
    link.textContent = text;

    // Writeup links are handled by click event, others open in new tab
    if (type !== 'writeup') {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }

    link.style.pointerEvents = 'auto';
    link.style.cursor = 'pointer';

    return link;
}

async function openWriteup(writeupPath, title, slug = null) {
    const modal = document.getElementById('writeupModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    // Update URL hash for permalink (without triggering hashchange)
    if (slug && window.location.hash !== `#${slug}`) {
        history.pushState(null, '', `#${slug}`);
    }

    // Show modal with loading state
    modalTitle.textContent = title;
    modalContent.innerHTML = '<div class="loading">Loading writeup...</div>';
    modal.classList.add('active');

    try {
        // Check if external URL or local path
        const isExternal = writeupPath.startsWith('http://') || writeupPath.startsWith('https://');
        let fetchUrl = writeupPath;
        let baseUrl = null;

        // Convert GitHub blob URLs to raw URLs
        if (isExternal && writeupPath.includes('github.com') && writeupPath.includes('/blob/')) {
            fetchUrl = writeupPath
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');
            // Extract base URL for relative image paths
            baseUrl = fetchUrl.substring(0, fetchUrl.lastIndexOf('/') + 1);
        } else if (isExternal && writeupPath.includes('raw.githubusercontent.com')) {
            baseUrl = fetchUrl.substring(0, fetchUrl.lastIndexOf('/') + 1);
        } else if (!isExternal) {
            // For local paths, extract the directory containing the blog.md file
            baseUrl = writeupPath.substring(0, writeupPath.lastIndexOf('/') + 1);
        }

        // Fetch markdown content
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Failed to load writeup');

        let markdown = await response.text();

        // Rewrite relative image/asset paths to absolute URLs
        if (baseUrl) {
            // Handle HTML img tags with relative src
            markdown = markdown.replace(
                /(<img\s+[^>]*src=["'])(?!http|\/\/)([^"']+)(["'])/gi,
                (match, prefix, path, suffix) => `${prefix}${baseUrl}${path}${suffix}`
            );
            // Handle markdown image syntax ![alt](path)
            markdown = markdown.replace(
                /!\[([^\]]*)\]\((?!http|\/\/)([^)]+)\)/g,
                (match, alt, path) => `![${alt}](${baseUrl}${path})`
            );
        }

        // Parse markdown to HTML using marked.js
        if (typeof marked !== 'undefined') {
            const html = marked.parse(markdown);
            modalContent.innerHTML = html;
        } else {
            // Fallback if marked.js not loaded
            modalContent.innerHTML = `<pre>${markdown}</pre>`;
        }
    } catch (error) {
        console.error('Error loading writeup:', error);
        modalContent.innerHTML = '<div class="error">Failed to load writeup. Please try again later.</div>';
    }
}

function closeModal() {
    const modal = document.getElementById('writeupModal');
    modal.classList.remove('active');

    // Clear the hash without triggering page scroll
    if (window.location.hash) {
        history.pushState(null, '', window.location.pathname);
    }
}

function checkHashAndOpenWriteup() {
    const hash = window.location.hash.slice(1); // Remove the #
    if (!hash) {
        // No hash, close modal if open
        const modal = document.getElementById('writeupModal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
        return;
    }

    // Look up project by slug
    const project = projectsMap.get(hash);
    if (project) {
        openWriteup(project.writeup, project.title, hash);
    }
}
