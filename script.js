document.addEventListener('DOMContentLoaded', () => {
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

    // Load public projects from XML
    fetch('sites-config.xml')
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            const sites = data.getElementsByTagName('site');
            const sitesGrid = document.getElementById('sitesGrid');
            let publicIndex = 0;

            Array.from(sites).forEach(site => {
                const name = site.getElementsByTagName('name')[0].textContent;
                const type = site.getElementsByTagName('type')[0].textContent;
                const description = site.getElementsByTagName('description') &&
                                  site.getElementsByTagName('description')[0] ?
                                  site.getElementsByTagName('description')[0].textContent : '';

                // Parse links
                const linksElement = site.getElementsByTagName('links')[0];
                const links = {};
                if (linksElement) {
                    const liveElement = linksElement.getElementsByTagName('live')[0];
                    const githubElement = linksElement.getElementsByTagName('github')[0];
                    const writeupElement = linksElement.getElementsByTagName('writeup')[0];

                    if (liveElement) links.live = liveElement.textContent;
                    if (githubElement) links.github = githubElement.textContent;
                    if (writeupElement) links.writeup = writeupElement.textContent;
                }

                // Parse tags
                const tags = [];
                const tagsElement = site.getElementsByTagName('tags')[0];
                if (tagsElement) {
                    const tagElements = tagsElement.getElementsByTagName('tag');
                    Array.from(tagElements).forEach(tag => {
                        tags.push(tag.textContent);
                    });
                }

                // Parse media
                let media = null;
                const mediaElement = site.getElementsByTagName('media')[0];
                if (mediaElement) {
                    media = mediaElement.textContent;
                }

                // Parse featured
                let featured = false;
                const featuredElement = site.getElementsByTagName('featured')[0];
                if (featuredElement) {
                    featured = featuredElement.textContent === 'true';
                }

                // Skip private items (Home Assistant is now in private tools)
                if (links.live && links.live.includes('homeassistant.mikeayles.com')) {
                    return;
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
        })
        .catch(error => {
            console.error('Error fetching or parsing XML:', error);
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
});

function createCard({ title, description, links = {}, tags = [], media = null, featured = false, linkText = null }) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animation = 'fadeInUp 0.8s ease-out forwards';
    card.style.opacity = '0';

    // Add media preview for featured projects
    if (featured && media) {
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'card-media';
        const img = document.createElement('img');
        img.src = media;
        img.alt = `${title} preview`;
        img.loading = 'lazy';
        mediaContainer.appendChild(img);
        card.appendChild(mediaContainer);
    }

    const h3 = document.createElement('h3');
    h3.textContent = title;
    card.appendChild(h3);

    if (description) {
        const p = document.createElement('p');
        p.textContent = description;
        card.appendChild(p);
    }

    // Add tags if present
    if (tags && tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'card-tags';
        tags.forEach(tag => {
            const tagBadge = document.createElement('span');
            tagBadge.className = 'tag-badge';
            tagBadge.textContent = tag;
            tagBadge.setAttribute('data-tag', tag);
            tagsContainer.appendChild(tagBadge);
        });
        card.appendChild(tagsContainer);
    }

    // Add links container
    const linksContainer = document.createElement('div');
    linksContainer.className = 'card-links';

    // If old style linkText is provided, use single link
    if (linkText && links.live) {
        const link = createLink(links.live, linkText, 'live');
        linksContainer.appendChild(link);
    } else {
        // Create multiple link buttons
        if (links.live) {
            const liveLink = createLink(links.live, 'Live Site', 'live');
            linksContainer.appendChild(liveLink);
        }

        if (links.github) {
            const githubLink = createLink(links.github, 'GitHub', 'github');
            linksContainer.appendChild(githubLink);
        }

        if (links.writeup) {
            const writeupLink = createLink(links.writeup, 'Read Writeup', 'writeup');
            writeupLink.addEventListener('click', (e) => {
                e.preventDefault();
                openWriteup(links.writeup, title);
            });
            linksContainer.appendChild(writeupLink);
        }
    }

    card.appendChild(linksContainer);

    return card;
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

async function openWriteup(writeupPath, title) {
    const modal = document.getElementById('writeupModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    // Show modal with loading state
    modalTitle.textContent = title;
    modalContent.innerHTML = '<div class="loading">Loading writeup...</div>';
    modal.classList.add('active');

    try {
        // Fetch markdown content
        const response = await fetch(writeupPath);
        if (!response.ok) throw new Error('Failed to load writeup');

        const markdown = await response.text();

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
}
