document.addEventListener('DOMContentLoaded', () => {
    // Add development tools
    const devToolsGrid = document.getElementById('devTools');
    const devTool = {
        url: 'http://100.79.131.40:8080/?folder=/home/mike/Desktop/Projects',
        name: 'VS Code Server',
        description: 'Access VS Code through Tailscale'
    };
    
    const devCard = createCard(devTool.name, devTool.description, devTool.url, 'Open VS Code');
    devToolsGrid.appendChild(devCard);
    
    // Load sites from XML
    fetch('sites-config.xml')
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            const sites = data.getElementsByTagName('site');
            const sitesGrid = document.getElementById('sitesGrid');

            Array.from(sites).forEach(site => {
                const url = site.getElementsByTagName('url')[0].textContent;
                const name = site.getElementsByTagName('name')[0].textContent;
                const type = site.getElementsByTagName('type')[0].textContent;
                const description = site.getElementsByTagName('description') && 
                                  site.getElementsByTagName('description')[0] ? 
                                  site.getElementsByTagName('description')[0].textContent : '';

                if (type === 'link') {
                    const card = createCard(name, description, url, 'Visit');
                    sitesGrid.appendChild(card);
                } else if (type === 'react') {
                    const card = createCard(name, 'React Component (Coming Soon)', '#', 'Preview');
                    card.querySelector('a').onclick = (e) => e.preventDefault();
                    sitesGrid.appendChild(card);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing XML:', error);
            document.getElementById('sitesGrid').innerHTML = '<p style="color: white;">Error loading sites. Please try again later.</p>';
        });
});

function createCard(title, description, url, linkText) {
    const card = document.createElement('div');
    card.className = 'siteCard';
    
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
    link.textContent = linkText;
    link.target = '_blank';
    card.appendChild(link);
    
    return card;
}