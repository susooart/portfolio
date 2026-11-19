document.addEventListener('DOMContentLoaded', () => {
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
            const text = await response.text();
            const [title, description, tags] = text.split('---').map(line => line.trim());
            document.getElementById('project-title').textContent = title;
            document.title = title;

            const descriptionContainer = document.getElementById('project-description');
            const formattedDescription = convertUrlsToLinks(description);

            if (description.length > 420) {
                const shortDescription = formattedDescription.substring(0, 420);
                descriptionContainer.innerHTML = `${shortDescription}<span id="ellipsis">...</span><span id="full-description" style="display: none;">${formattedDescription.substring(420)}</span><br><span id="toggle-description">Read More</span>`;

                const toggleDescription = document.getElementById('toggle-description');
                const fullDescription = document.getElementById('full-description');
                const ellipsis = document.getElementById('ellipsis');

                toggleDescription.addEventListener('click', () => {
                    const isFullVisible = fullDescription.style.display === 'inline';
                    fullDescription.style.display = isFullVisible ? 'none' : 'inline';
                    ellipsis.style.display = isFullVisible ? 'inline' : 'none';
                    toggleDescription.textContent = isFullVisible ? 'Read More' : 'Read Less';
                });
            } else {
                descriptionContainer.innerHTML = formattedDescription;
            }

            renderTags(tags);
        } catch (error) {
            console.error('Error loading project description:', error);
        }
    };

    const convertUrlsToLinks = (text) => {
        const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        return text.replace(urlPattern, (url) => {
            const truncatedUrl = new URL(url).hostname;
            return `<a href="${url}" target="_blank" class="link-button">${truncatedUrl}</a>`;
        });
    };

    const renderTags = (tags) => {
        const tagsContainer = document.getElementById('project-tags');
        tags.split(',').map(tag => tag.trim()).forEach(tag => {
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
        try {
            const response = await fetch('media.txt');
            const text = await response.text();
            const mediaContainer = document.getElementById('project-media');
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
                    urls = lines[i].split(' // ').map(url => url.trim());
                }

                urls = urls.map(url => (url.startsWith('http') ? url : basePath + url));

                if (description.includes('(marmoset viewer)')) {
                    urls = [`${urls[0]}.mview`];
                }

                const mediaElement = createMediaElement(urls, description);
                if (mediaElement) fragment.appendChild(mediaElement);
                i += 1;
            }

            mediaContainer.appendChild(fragment);
            currentMediaIndex = 0;
            updateCarouselView();
        } catch (error) {
            console.error('Error loading project media:', error);
        }
    };

    const createMarmosetViewerElement = (url) => {
        const mediaElement = document.createElement('div');
        mediaElement.className = 'media-item marmoset-item';

        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.allow = 'autoplay; fullscreen';
        iframe.setAttribute('allowfullscreen', '');
        iframe.title = 'Marmoset Viewer';

        mediaElement.appendChild(iframe);
        return mediaElement;
    };

    const createMediaElement = (urls, description) => {
        let mediaElement;
        const cleanFirstUrl = getCleanPath(urls[0]);

        if (/\.(jpeg|jpg|gif|png|webp)$/.test(cleanFirstUrl)) { mediaElement = createImageElement(urls); } else if (/\.(mp4\vert{}webm)$/.test(cleanFirstUrl)) {
            mediaElement = createVideoElement(urls[0]);
        } else if (urls[0].includes('youtube.com')) {
            mediaElement = createYouTubeElement(urls[0]);
        } else if (urls[0].includes('sketchfab.com')) {
            mediaElement = createSketchfabElement
