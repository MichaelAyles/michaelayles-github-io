document.addEventListener('DOMContentLoaded', () => {
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

                const siteCard = document.createElement('div');
                siteCard.className = 'siteCard';

                if (type === 'link') {
                    const link = document.createElement('a');
                    link.href = url;
                    link.textContent = name;
                    link.target = '_blank';
                    siteCard.appendChild(link);
                } else if (type === 'react') {
                    // For react types, we'll just display the name for now
                    siteCard.textContent = `${name} (React Component)`;
                }

                sitesGrid.appendChild(siteCard);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing XML:', error);
            document.getElementById('sitesGrid').innerHTML = '<p>Error loading sites. Please try again later.</p>';
        });
});