document.addEventListener('DOMContentLoaded', () => {
    let projects = [];
    let mediaItems = [];
    let currentMediaIndex = 0;

    const addHomeButtonUnderSoftware = () => {
        if (document.querySelector('.home-inline-btn')) return;

        const tagsContainer = document.getElementById('project-tags');
        const targetParent = tagsContainer ? tagsContainer.parentElement : null;
        if (!targetParent) return;

        const btn = document.createElement('a');
        btn.href = '../../index.html';
        btn.className = 'home-inline-btn';
        btn.setAttribute('aria-label', 'Back to main menu');
        btn.innerHTML = '<span>⌂</span><span>Main Menu</span>';

        btn.style.cssText = [
            'display: inline-flex',
            'align-items: center',
            'justify-content: center',
            'gap: 8px',
            'margin-top: 14px',
            'padding: 8px 14px',
            'border-radius: 6px',
            'background-color: #1e1e1e',
            'color: #d7d7d7',
            'border: 1px solid rgba(255, 255, 255, 0.16)',
            'text-decoration: none',
            'font-size: 13px',
            'font-weight: 500',
            'cursor: pointer',
            'transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease'
        ].join(';');

        btn.addEventListener('mouseenter', () => {
            btn.style.color = '#edb049';
            btn.style.borderColor = '#edb049';
            btn.style.backgroundColor = '#272727';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.color = '#d7d7d7';
            btn.style.borderColor = 'rgba(255, 255, 255, 0.16)';
            btn.style.backgroundColor = '#1e1e1e';
        });

        if (tagsContainer.nextSibling) {
            targetParent.insertBefore(btn, tagsContainer.nextSibling);
        } else {
            targetParent.appendChild(btn);
        }
    };

    const attachArrowsToMediaEdges = () => {
        const mediaContainer = document.querySelector('.media-container');
        const prevBtn = document.getElementById('prev-project');
        const nextBtn = document.getElementById('next-project');
        if (!mediaContainer || !prevBtn || !nextBtn) return;

        mediaContainer.style.position = 'relative';

        if (prevBtn.parentElement !== mediaContainer) {
            mediaContainer.appendChild(prevBtn);
        }
        if (nextBtn.parentElement !== mediaContainer) {
            mediaContainer.appendChild(nextBtn);
        }

        const baseArrowStyle = [
            'position: absolute',
            'top: 50%',
            'transform: translateY(-50%)',
            'z-index: 20',
            'width: 42px',
            'height: 42px',
            'border-radius: 50%',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'background-color: rgba(20, 20, 20, 0.65)',
            'color: #ffffff',
            'border: 1px solid rgba(255, 255, 255, 0.2)',
            'cursor: pointer',
            'user-select: none'
        ].join(';');

        prevBtn.style.cssText = `${baseArrowStyle}; left: 14px; right: auto;`;
        nextBtn.style.cssText = `${baseArrowStyle}; right: 14px; left: auto;`;
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch('../../Config/projects.txt');
            if (!response.ok) return [];
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
            if (!response.ok) return;
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

            addHomeButtonUnderSoftware();
        } catch (error) {
            console.error('Error loading project description:', error);
            addHomeButtonUnderSoftware();
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
        try {
            const response = await fetch('media.txt');
            if (!response.ok) return;
            const text = await response.text();
            const mediaContainer = document.getElementById('project-media');
            if (!mediaContainer) return;
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
            attachArrowsToMediaEdges();
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
        } else if (urls[0].includes('youtube.com') || urls[0].includes('youtu.be')) {
            mediaElement = createYouTubeElement(urls[0]);
        } else if (urls[0].includes('sketchfab.com')) {
            mediaElement = createSketchfabElement(urls[0]);
        } else if (/\.mview$/.test(cleanFirstUrl)) {
            mediaElement = createMarmosetViewerElement(urls[0]);
        }

        if (mediaElement && description) {
            const descElement = document.createElement('p');
            descElement.className = 'media-description';
            descElement.textContent = description;
            mediaElement.appendChild(descElement);
        }

        return mediaElement;
    };

    const createImageElement = (urls) => {
        const mediaElement = document.createElement('div');
        mediaElement.className = 'media-item';

        const imgContainer = document.createElement('div');
        imgContainer.className = 'img-container';

        const imgElement1 = document.createElement('img');
        imgElement1.src = urls[0];
        imgElement1.className = 'image-1';
        imgElement1.alt = 'Primary image';
        imgContainer.appendChild(imgElement1);

        if (urls[1]) {
            const imgElement2 = document.createElement('img');
            imgElement2.src = urls[1];
            imgElement2.className = 'image-2';
            imgElement2.alt = 'Secondary image';
            imgContainer.appendChild(imgElement2);

            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';

            const sliderLine = document.createElement('div');
            sliderLine.className = 'slider-line';

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '100';
            slider.value = '50';
            slider.className = 'image-slider';
            slider.setAttribute('aria-label', 'Image comparison slider');
            slider.addEventListener('input', () => {
                const value = slider
