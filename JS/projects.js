(() => {
    const createHomeButton = () => {
        if (!document.body || document.querySelector('.home-floating-btn')) return;

        const homeBtn = document.createElement('a');
        homeBtn.href = '../../index.html';
        homeBtn.className = 'home-floating-btn';
        homeBtn.setAttribute('aria-label', 'Back to main menu');
        homeBtn.title = 'Main menu';
        homeBtn.textContent = '⌂';

        homeBtn.style.position = 'fixed';
        homeBtn.style.bottom = '24px';
        homeBtn.style.right = '24px';
        homeBtn.style.width = '48px';
        homeBtn.style.height = '48px';
        homeBtn.style.borderRadius = '50%';
        homeBtn.style.backgroundColor = '#1e1e1e';
        homeBtn.style.color = '#d7d7d7';
        homeBtn.style.border = '1px solid rgba(255, 255, 255, 0.25)';
        homeBtn.style.display = 'flex';
        homeBtn.style.alignItems = 'center';
        homeBtn.style.justifyContent = 'center';
        homeBtn.style.textDecoration = 'none';
        homeBtn.style.fontSize = '22px';
        homeBtn.style.lineHeight = '1';
        homeBtn.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.65)';
        homeBtn.style.zIndex = '99999';
        homeBtn.style.cursor = 'pointer';

        homeBtn.addEventListener('mouseenter', () => {
            homeBtn.style.color = '#edb049';
            homeBtn.style.borderColor = '#edb049';
            homeBtn.style.backgroundColor = '#272727';
        });

        homeBtn.addEventListener('mouseleave', () => {
            homeBtn.style.color = '#d7d7d7';
            homeBtn.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            homeBtn.style.backgroundColor = '#1e1e1e';
        });

        document.body.appendChild(homeBtn);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createHomeButton);
    } else {
        createHomeButton();
    }

    document.addEventListener('DOMContentLoaded', () => {
        createHomeButton();

        let projects = [];
        let mediaItems = [];
        let currentMediaIndex = 0;

        const fetchProjects = async () => {
            try {
                const response = await fetch('../../Config/projects.txt');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const text = await response.text();
                return text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
            } catch (error) {
                console.error('Error loading projects:', error);
                return [];
            }
        };

        const fetchDescription = async () => {
            try {
                const response = await fetch('description.txt');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const text = await response.text();
                const parts = text.split('---').map(line => line.trim());
                const title = parts[0] || '';
                const description = parts[1] || '';
                const tags = parts[2] || '';

                const titleEl = document.getElementById('project-title');
                if (titleEl && title) {
                    titleEl.textContent = title;
                    document.title = title;
                }

                const descriptionContainer = document.getElementById('project-description');
                if (descriptionContainer && description) {
                    const formattedDescription = convertUrlsToLinks(description);

                    if (description.length > 420) {
                        const shortDescription = formattedDescription.substring(0, 420);
                        descriptionContainer.innerHTML = `${shortDescription}<span id="ellipsis">...</span><span id="full-description" style="display: none;">${formattedDescription.substring(420)}</span><br><span id="toggle-description">Read More</span>`;

                        const toggleDescription = document.getElementById('toggle-description');
                        const fullDescription = document.getElementById('full-description');
                        const ellipsis = document.getElementById('ellipsis');

                        if (toggleDescription && fullDescription && ellipsis) {
                            toggleDescription.addEventListener('click', () => {
                                const isFullVisible = fullDescription.style.display === 'inline';
                                fullDescription.style.display = isFullVisible ? 'none' : 'inline';
                                ellipsis.style.display = isFullVisible ? 'inline' : 'none';
                                toggleDescription.textContent = isFullVisible ? 'Read More' : 'Read Less';
                            });
                        }
                    } else {
                        descriptionContainer.innerHTML = formattedDescription;
                    }
                }

                if (tags) {
                    renderTags(tags);
                }
            } catch (error) {
                console.error('Error loading project description:', error);
            }
        };

        const convertUrlsToLinks = (text) => {
            const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
            return text.replace(urlPattern, (url) => {
                try {
                    const truncatedUrl = new URL(url).hostname;
                    return `<a href="${url}" target="_blank" class="link-button">${truncatedUrl}</a>`;
                } catch {
                    return `<a href="${url}" target="_blank" class="link-button">${url}</a>`;
                }
            });
        };

        const renderTags = (tags) => {
            const tagsContainer = document.getElementById('project-tags');
            if (!tagsContainer) return;
            tagsContainer.innerHTML = '';
            tags.split(',').map(tag => tag.trim()).filter(Boolean).forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.className = 'software-tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        };

        const getCleanPath = (url) => {
            try {
                return new URL(url, window.location.href).pathname.toLowerCase();
            } catch {
                return url.split('?')[0].toLowerCase();
            }
        };

        const isMediaUrl = (line) => {
            const clean = getCleanPath(line);
            return (
                /\.(jpeg|jpg|gif|png|webp|mp4|webm|mview)$/.test(clean) ||
                line.includes('youtube.com') ||
                line.includes('youtu.be') ||
                line.includes('sketchfab.com') ||
                line.includes(' // ')
            );
        };

        const updateCarouselView = () => {
            mediaItems = Array.from(document.querySelectorAll('#project-media .media-item'));
            if (!mediaItems.length) return;

            mediaItems.forEach((item, idx) => {
                const isActive = idx === currentMediaIndex;
                item.style.display = isActive ? 'flex' : 'none';
                item.classList.toggle('active', isActive);

                const video = item.querySelector('video');
                if (video && !isActive) {
                    video.pause();
                }
            });
        };

        const navigateMedia = (direction) => {
            if (!mediaItems.length) return;
            currentMediaIndex = (currentMediaIndex + direction + mediaItems.length) % mediaItems.length;
            updateCarouselView();
        };

        const loadMedia = async () => {
            const mediaContainer = document.getElementById('project-media');
            if (!mediaContainer) return;

            try {
                const response = await fetch('media.txt');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const text = await response.text();
                mediaContainer.innerHTML = '';

                const lines = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
                const basePath = window.location.pathname.split('/').slice(0, -1).join('/') + '/';
                const fragment = document.createDocumentFragment();

                let i = 0;
                while (i < lines.length) {
                    let description = '';
                    let urls = [lines[i]];

                    if (i + 1 < lines.length && !isMediaUrl(lines[i + 1])) {
                        description = lines[i + 1];
                        i += 1;
                    }

                    if (lines[i].includes(' // ')) {
                        urls = lines[i].split
