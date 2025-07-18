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
        const card = createCard(tool.name, tool.description, tool.url, 'Access');
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
                const url = site.getElementsByTagName('url')[0].textContent;
                const name = site.getElementsByTagName('name')[0].textContent;
                const type = site.getElementsByTagName('type')[0].textContent;
                const description = site.getElementsByTagName('description') && 
                                  site.getElementsByTagName('description')[0] ? 
                                  site.getElementsByTagName('description')[0].textContent : '';

                // Skip private items (Home Assistant is now in private tools)
                if (url.includes('homeassistant.mikeayles.com')) {
                    return;
                }

                if (type === 'link') {
                    const card = createCard(name, description, url, 'View Project');
                    card.style.animationDelay = `${publicIndex * 0.1}s`;
                    sitesGrid.appendChild(card);
                    publicIndex++;
                } else if (type === 'react') {
                    const card = createCard(name, 'React Component (Coming Soon)', '#', 'Preview');
                    card.querySelector('a').onclick = (e) => e.preventDefault();
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
});

function createCard(title, description, url, linkText) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animation = 'fadeInUp 0.8s ease-out forwards';
    card.style.opacity = '0';
    
    const h3 = document.createElement('h3');
    h3.textContent = title;
    card.appendChild(h3);
    
    if (description) {
        const p = document.createElement('p');
        p.textContent = description;
        card.appendChild(p);
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.className = 'card-link';
    link.textContent = linkText;
    link.target = '_blank';
    card.appendChild(link);
    
    return card;
}