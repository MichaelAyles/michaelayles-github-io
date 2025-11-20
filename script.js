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

    if (links.github) {
        const ghLink = document.createElement('a');
        ghLink.href = links.github;
        ghLink.className = 'project-link';
        ghLink.textContent = 'Code';
        ghLink.target = '_blank';
        linksCol.appendChild(ghLink);
    }

    if (links.writeup) {
        const writeupLink = document.createElement('a');
        writeupLink.href = '#';
        writeupLink.className = 'project-link';
        writeupLink.textContent = 'Read More';
        writeupLink.onclick = (e) => {
            e.preventDefault();
            openWriteup(links.writeup, title);
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
