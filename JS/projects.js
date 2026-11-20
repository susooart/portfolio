(() => {
    // =========================================================
    // PATH MANAGEMENT - GITHUB PAGES
    // =========================================================

    const getSiteRootPath = () => {
        const pathname = window.location.pathname;
        const lower = pathname.toLowerCase();
        const projectsToken = '/projects/';
        const idx = lower.indexOf(projectsToken);

        if (idx !== -1) {
            return pathname.slice(0, idx + 1);
        }

        return new URL('../../', window.location.href).pathname;
    };

    const getSiteRootUrl = () => {
        return new URL(getSiteRootPath(), window.location.origin);
    };

    const getProjectBaseUrl = () => {
        return new URL('./', window.location.href);
    };

    const resolveMediaUrl = (rawUrl, projectBase = getProjectBaseUrl()) => {
        const cleaned = rawUrl.trim();

        if (/^(https?:|data:|blob:)/i.test(cleaned)) {
            return cleaned;
        }

        if (cleaned.startsWith('/')) {
            return new URL(
                cleaned.replace(/^\/+/, ''),
                getSiteRootUrl()
            ).href;
        }

        if (/^Resources\//i.test(cleaned)) {
            return new URL(cleaned, getSiteRootUrl()).href;
        }

        return new URL(cleaned, projectBase).href;
    };

    const getCurrentProjectSlug = () => {
        const parts = window.location.pathname.split('/').filter(Boolean);
        const projectsIdx = parts.findIndex(
            p => p.toLowerCase() === 'projects'
        );

        if (projectsIdx !== -1 && parts[projectsIdx + 1]) {
            return parts[projectsIdx + 1];
        }

        return '';
    };

    // =========================================================
    // PROJECT URL RESOLUTION
    // =========================================================

    const resolveProjectEntry = (rawEntry, siteRoot) => {
        const cleaned = rawEntry.trim();

        if (!cleaned) return null;

        if (/^https?:\/\//i.test(cleaned)) {
            return {
                href: cleaned,
                mediaBase: '',
                slug: cleaned
            };
        }

        let normalized = cleaned.replace(/^\/+|\/+$/g, '');

        normalized = normalized.replace(/\/index\.html$/i, '');

        const folderPath = normalized.includes('/')
            ? normalized
            : `Projects/${normalized}`;

        const slug = folderPath.split('/').pop();

        const rootUrl = new URL(siteRoot, window.location.origin);

        const projectUrl = new URL(
            folderPath + '/',
            rootUrl
        );

        return {
            href: new URL('index.html', projectUrl).href,
            mediaBase: projectUrl.href,
            slug
        };
    };

    // =========================================================
    // MAIN MENU BUTTON
    // =========================================================

    const addHomeButtonUnderSoftware = () => {
        if (
            !document.body ||
            document.querySelector('.home-inline-btn')
        ) return;

        const tagsContainer = document.getElementById('project-tags');

        const targetParent = tagsContainer
            ? tagsContainer.parentElement
            : null;

        if (!targetParent) return;

        const homeBtn = document.createElement('a');

        homeBtn.href = new URL(
            'index.html',
            getSiteRootUrl()
        ).href;

        homeBtn.className = 'home-inline-btn';
        homeBtn.setAttribute('aria-label', 'Back to main menu');
        homeBtn.title = 'Main menu';
        homeBtn.innerHTML = '<span>⌂</span><span>Main Menu</span>';

        Object.assign(homeBtn.style, {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '14px',
            padding: '8px 14px',
            borderRadius: '6px',
            backgroundColor: '#1e1e1e',
            color: '#d7d7d7',
            border: '1px solid rgba(255,255,255,0.25)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '500',
            lineHeight: '1',
            cursor: 'pointer'
        });

        homeBtn.addEventListener('mouseenter', () => {
            homeBtn.style.color = '#edb049';
            homeBtn.style.borderColor = '#edb049';
            homeBtn.style.backgroundColor = '#272727';
        });

        homeBtn.addEventListener('mouseleave', () => {
            homeBtn.style.color = '#d7d7d7';
            homeBtn.style.borderColor = 'rgba(255,255,255,0.25)';
            homeBtn.style.backgroundColor = '#1e1e1e';
        });

        if (tagsContainer.nextSibling) {
            targetParent.insertBefore(
                homeBtn,
                tagsContainer.nextSibling
            );
        } else {
            targetParent.appendChild(homeBtn);
        }
    };
        // =========================================================
    // FIXED CAROUSEL ARROWS
    // =========================================================

    const setFixedArrowPositions = () => {
        const prevBtn = document.getElementById('prev-project');
        const nextBtn = document.getElementById('next-project');

        if (!prevBtn || !nextBtn) return;

        if (prevBtn.parentElement !== document.body) {
            document.body.appendChild(prevBtn);
        }

        if (nextBtn.parentElement !== document.body) {
            document.body.appendChild(nextBtn);
        }

        const mediaContainer = document.querySelector('.media-container');

        const rect = mediaContainer
            ? mediaContainer.getBoundingClientRect()
            : null;

        const topPos = rect
            ? Math.max(
                120,
                Math.round(rect.top + Math.min(220, rect.height * 0.28))
            )
            : 220;

        [prevBtn, nextBtn].forEach(btn => {
            Object.assign(btn.style, {
                position: 'fixed',
                top: `${topPos}px`,
                transform: 'translateY(-50%)',
                zIndex: '9999',
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                maxWidth: '44px',
                maxHeight: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(20,20,20,0.72)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.22)',
                cursor: 'pointer',
                userSelect: 'none'
            });
        });

        if (rect) {
            const leftPos = Math.max(
                16,
                Math.round(rect.left + 16)
            );

            const rightPos = Math.max(
                16,
                Math.round(window.innerWidth - rect.right + 16)
            );

            prevBtn.style.left = `${leftPos}px`;
            prevBtn.style.right = 'auto';

            nextBtn.style.right = `${rightPos}px`;
            nextBtn.style.left = 'auto';
        } else {
            prevBtn.style.left = '16px';
            prevBtn.style.right = 'auto';

            nextBtn.style.right = '16px';
            nextBtn.style.left = 'auto';
        }
    };

    // =========================================================
    // FIND PROJECT THUMBNAIL
    // =========================================================

    const findProjectThumbnail = async (entry) => {
        if (!entry.mediaBase) return '';

        try {
            const res = await fetch(
                new URL('media.txt', entry.mediaBase).href
            );

            if (res.ok) {
                const text = await res.text();

                const lines = text
                    .split('\n')
                    .map(l => l.trim())
                    .filter(l => l && !l.startsWith('#'));

                for (const line of lines) {
                    const firstUrl = line.split(' // ')[0].trim();

                    const cleanUrl = firstUrl
                        .split('?')[0]
                        .split('#')[0]
                        .toLowerCase();

                    if (/\.(jpeg|jpg|gif|png|webp)$/.test(cleanUrl)) {
                        return resolveMediaUrl(
                            firstUrl,
                            new URL(entry.mediaBase)
                        );
                    }
                }
            }
        } catch (error) {
            console.warn(
                'Could not read project media.txt:',
                entry.slug,
                error
            );
        }

        const candidates = [
            'thumb.jpg',
            'thumb.png',
            'thumb.webp',
            'thumbnail.jpg',
            'thumbnail.png',
            'cover.jpg',
            'cover.png'
        ];

        for (const file of candidates) {
            try {
                const url = new URL(file, entry.mediaBase).href;

                const check = await fetch(url, {
                    method: 'HEAD'
                });

                if (check.ok) return url;

            } catch {
                // Try next candidate
            }
        }

        return '';
    };

    // =========================================================
    // OTHER PROJECTS CAROUSEL
    // =========================================================

    const renderOtherProjectsCarousel = async (projectEntries) => {
        const mediaContainer = document.querySelector('.media-container');

        if (
            !mediaContainer ||
            document.getElementById('other-projects-section')
        ) return;

        const siteRoot = getSiteRootPath();
        const currentSlug = getCurrentProjectSlug().toLowerCase();

        const parsedEntries = projectEntries
            .map(item => resolveProjectEntry(item, siteRoot))
            .filter(item =>
                item &&
                item.slug.toLowerCase() !== currentSlug
            );

        if (!parsedEntries.length) return;

        const shuffled = [...parsedEntries].sort(
            () => Math.random() - 0.5
        );

        const pickedCards = [];

        for (const item of shuffled) {
            if (pickedCards.length >= 3) break;

            const thumbUrl = await findProjectThumbnail(item);

            if (!thumbUrl) {
                console.warn(
                    'No thumbnail found for:',
                    item.slug
                );
                continue;
            }

            const cardLink = document.createElement('a');

            cardLink.href = item.href;
            cardLink.title = item.slug;

            Object.assign(cardLink.style, {
                display: 'block',
                aspectRatio: '16 / 9',
                overflow: 'hidden',
                borderRadius: '8px',
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.12)',
                textDecoration: 'none'
            });

            const img = document.createElement('img');

            img.src = thumbUrl;
            img.alt = item.slug;
            img.loading = 'lazy';

            Object.assign(img.style, {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.25s ease'
            });

            cardLink.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.04)';
                cardLink.style.borderColor = '#edb049';
            });

            cardLink.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
                cardLink.style.borderColor =
                    'rgba(255,255,255,0.12)';
            });

            cardLink.appendChild(img);
            pickedCards.push(cardLink);
        }

        if (!pickedCards.length) return;

        const section = document.createElement('div');

        section.id = 'other-projects-section';

        Object.assign(section.style, {
            width: '100%',
            maxWidth: '920px',
            margin: '24px auto 0 auto',
            padding: '16px 20px 0 20px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            boxSizing: 'border-box',
            order: '999',
            flexShrink: '0'
        });

        const heading = document.createElement('h3');

        heading.textContent = 'Other Projects';

        Object.assign(heading.style, {
            margin: '0 0 12px 0',
            fontSize: '15px',
            fontWeight: '600',
            color: '#d7d7d7'
        });

        const carousel = document.createElement('div');

        carousel.className = 'other-projects-carousel';

        Object.assign(carousel.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
            gap: '12px',
            width: '100%'
        });

        pickedCards.forEach(card => {
            carousel.appendChild(card);
        });

        section.appendChild(heading);
        section.appendChild(carousel);

        mediaContainer.appendChild(section);
    };
        // =========================================================
    // INITIALIZATION
    // =========================================================

    document.addEventListener('DOMContentLoaded', () => {

        addHomeButtonUnderSoftware();
        setFixedArrowPositions();

        let projects = [];
        let mediaItems = [];
        let currentMediaIndex = 0;

        // =====================================================
        // FETCH PROJECT LIST
        // =====================================================

        const fetchProjects = async () => {
            try {
                const configUrl = new URL(
                    'Config/projects.txt',
                    getSiteRootUrl()
                ).href;

                const response = await fetch(configUrl);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const text = await response.text();

                return text
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line =>
                        line && !line.startsWith('#')
                    );

            } catch (error) {
                console.error(
                    'Error loading projects:',
                    error
                );

                return [];
            }
        };

        // =====================================================
        // CONVERT URLS TO LINKS
        // =====================================================

        const convertUrlsToLinks = (text) => {
            const urlPattern =
                /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

            return text.replace(urlPattern, (url) => {
                try {
                    const hostname = new URL(url).hostname;

                    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="link-button">${hostname}</a>`;

                } catch {
                    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="link-button">${url}</a>`;
                }
            });
        };

        // =====================================================
        // RENDER PROJECT TAGS
        // =====================================================

        const renderTags = (tags) => {
            const tagsContainer =
                document.getElementById('project-tags');

            if (!tagsContainer) return;

            tagsContainer.innerHTML = '';

            tags.split(',')
                .map(tag => tag.trim())
                .filter(Boolean)
                .forEach(tag => {

                    const tagElement =
                        document.createElement('div');

                    tagElement.className = 'software-tag';
                    tagElement.textContent = tag;

                    tagsContainer.appendChild(tagElement);
                });
        };

        // =====================================================
        // FETCH PROJECT DESCRIPTION
        // =====================================================

        const fetchDescription = async () => {
            try {
                const descriptionUrl = new URL(
                    'description.txt',
                    getProjectBaseUrl()
                ).href;

                const response = await fetch(descriptionUrl);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const text = await response.text();

                const parts = text
                    .split('---')
                    .map(line => line.trim());

                const title = parts[0] || '';
                const description = parts[1] || '';
                const tags = parts[2] || '';

                // PROJECT TITLE

                const titleEl =
                    document.getElementById('project-title');

                if (titleEl && title) {
                    titleEl.textContent = title;
                    document.title = title;
                }

                // PROJECT DESCRIPTION

                const descriptionContainer =
                    document.getElementById('project-description');

                if (descriptionContainer && description) {

                    const formattedDescription =
                        convertUrlsToLinks(description);

                    if (description.length > 420) {

                        const shortDescription =
                            formattedDescription.substring(0, 420);

                        descriptionContainer.innerHTML = `
                            ${shortDescription}
                            <span id="ellipsis">...</span>
                            <span id="full-description" style="display:none;">
                                ${formattedDescription.substring(420)}
                            </span>
                            <br>
                            <span id="toggle-description">Read More</span>
                        `;

                        const toggleDescription =
                            document.getElementById('toggle-description');

                        const fullDescription =
                            document.getElementById('full-description');

                        const ellipsis =
                            document.getElementById('ellipsis');

                        if (
                            toggleDescription &&
                            fullDescription &&
                            ellipsis
                        ) {
                            toggleDescription.style.cursor = 'pointer';

                            toggleDescription.addEventListener('click', () => {

                                const isFullVisible =
                                    fullDescription.style.display === 'inline';

                                fullDescription.style.display =
                                    isFullVisible ? 'none' : 'inline';

                                ellipsis.style.display =
                                    isFullVisible ? 'inline' : 'none';

                                toggleDescription.textContent =
                                    isFullVisible ? 'Read More' : 'Read Less';
                            });
                        }

                    } else {
                        descriptionContainer.innerHTML =
                            formattedDescription;
                    }
                }

                // PROJECT TAGS

                if (tags) {
                    renderTags(tags);
                }

                addHomeButtonUnderSoftware();
                setFixedArrowPositions();

            } catch (error) {
                console.error(
                    'Error loading project description:',
                    error
                );

                addHomeButtonUnderSoftware();
            }
        };
                // =====================================================
        // MEDIA URL HELPERS
        // =====================================================

        const getCleanPath = (url) => {
            try {
                return new URL(
                    url,
                    window.location.href
                ).pathname.toLowerCase();

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

        // =====================================================
        // UPDATE MEDIA CAROUSEL
        // =====================================================

        const updateCarouselView = () => {
            mediaItems = Array.from(
                document.querySelectorAll(
                    '#project-media .media-item'
                )
            );

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

        // =====================================================
        // NAVIGATE MEDIA
        // =====================================================

        const navigateMedia = (direction) => {
            if (!mediaItems.length) return;

            currentMediaIndex = (
                currentMediaIndex +
                direction +
                mediaItems.length
            ) % mediaItems.length;

            updateCarouselView();
        };

        // =====================================================
        // CREATE MARMOSET VIEWER
        // =====================================================

        const createMarmosetViewerElement = (url) => {

            const mediaElement = document.createElement('div');

            mediaElement.className = 'media-item marmoset-item';

            const iframe = document.createElement('iframe');

            iframe.src = url;
            iframe.allow = 'autoplay; fullscreen';

            iframe.setAttribute(
                'allowfullscreen',
                ''
            );

            iframe.title = 'Marmoset Viewer';

            mediaElement.appendChild(iframe);

            return mediaElement;
        };

        // =====================================================
        // CREATE IMAGE ELEMENT
        // =====================================================

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

                const sliderContainer =
                    document.createElement('div');

                sliderContainer.className = 'slider-container';

                const sliderLine =
                    document.createElement('div');

                sliderLine.className = 'slider-line';

                const slider = document.createElement('input');

                slider.type = 'range';
                slider.min = '0';
                slider.max = '100';
                slider.value = '50';
                slider.className = 'image-slider';

                slider.setAttribute(
                    'aria-label',
                    'Image comparison slider'
                );

                slider.addEventListener('input', () => {

                    const value = slider.value;

                    imgElement2.style.clipPath =
                        `inset(0 0 0 ${value}%)`;

                    sliderLine.style.left =
                        `calc(${value}% - 1px)`;
                });

                sliderContainer.appendChild(sliderLine);
                sliderContainer.appendChild(slider);

                mediaElement.appendChild(imgContainer);
                mediaElement.appendChild(sliderContainer);

            } else {

                mediaElement.appendChild(imgContainer);
            }

            return mediaElement;
        };

        // =====================================================
        // CREATE VIDEO ELEMENT
        // =====================================================

        const createVideoElement = (url) => {

            const mediaElement = document.createElement('div');

            mediaElement.className = 'media-item';

            const videoElement = document.createElement('video');

            videoElement.src = url;
            videoElement.controls = true;
            videoElement.autoplay = true;
            videoElement.loop = true;
            videoElement.muted = true;
            videoElement.title = 'Video content';

            mediaElement.appendChild(videoElement);

            return mediaElement;
        };

        // =====================================================
        // CREATE YOUTUBE ELEMENT
        // =====================================================

        const createYouTubeElement = (url) => {

            const mediaElement = document.createElement('div');

            mediaElement.className =
                'media-item responsive-iframe-container';

            let videoId = '';

            try {

                const parsed = new URL(url);

                videoId =
                    parsed.searchParams.get('v') ||
                    parsed.pathname.split('/').pop();

            } catch {
                videoId = '';
            }

            const iframe = document.createElement('iframe');

            iframe.src =
                `https://www.youtube.com/embed/${videoId}`;

            iframe.allow =
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';

            iframe.allowFullscreen = true;
            iframe.title = 'YouTube video';

            mediaElement.appendChild(iframe);

            return mediaElement;
        };

        // =====================================================
        // CREATE SKETCHFAB ELEMENT
        // =====================================================

        const createSketchfabElement = (url) => {

            const mediaElement = document.createElement('div');

            mediaElement.className =
                'media-item responsive-iframe-container';

            const sketchfabId = url
                .split('/')
                .pop()
                .split('-')
                .pop();

            const iframe = document.createElement('iframe');

            iframe.src =
                `https://sketchfab.com/models/${sketchfabId}/embed`;

            iframe.allow = 'autoplay; fullscreen; vr';
            iframe.allowFullscreen = true;
            iframe.title = 'Sketchfab model';

            mediaElement.appendChild(iframe);

            return mediaElement;
        };

        // =====================================================
        // CREATE MEDIA ELEMENT
        // =====================================================

        const createMediaElement = (urls, description) => {

            let mediaElement;

            const cleanFirstUrl = getCleanPath(urls[0]);

            if (/\.(jpeg|jpg|gif|png|webp)$/.test(cleanFirstUrl)) {

                mediaElement = createImageElement(urls);

            } else if (/\.(mp4|webm)$/.test(cleanFirstUrl)) {

                mediaElement = createVideoElement(urls[0]);

            } else if (
                urls[0].includes('youtube.com') ||
                urls[0].includes('youtu.be')
            ) {

                mediaElement = createYouTubeElement(urls[0]);

            } else if (urls[0].includes('sketchfab.com')) {

                mediaElement = createSketchfabElement(urls[0]);

            } else if (/\.mview$/.test(cleanFirstUrl)) {

                mediaElement =
                    createMarmosetViewerElement(urls[0]);
            }

            if (mediaElement && description) {

                const descElement =
                    document.createElement('p');

                descElement.className = 'media-description';
                descElement.textContent = description;

                mediaElement.appendChild(descElement);
            }

            return mediaElement;
        };

        // =====================================================
        // LOAD PROJECT MEDIA
        // =====================================================

        const loadMedia = async () => {

            const mediaContainer =
                document.getElementById('project-media');

            if (!mediaContainer) return;

            try {

                const mediaUrl = new URL(
                    'media.txt',
                    getProjectBaseUrl()
                ).href;

                const response = await fetch(mediaUrl);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const text = await response.text();

                mediaContainer.innerHTML = '';

                const lines = text
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line =>
                        line && !line.startsWith('#')
                    );

                const projectBase = getProjectBaseUrl();

                const fragment =
                    document.createDocumentFragment();

                let i = 0;

                while (i < lines.length) {

                    let description = '';

                    let urls = [lines[i]];

                    if (
                        i + 1 < lines.length &&
                        !isMediaUrl(lines[i + 1])
                    ) {

                        description = lines[i + 1];

                        i += 1;
                    }

                    if (lines[i].includes(' // ')) {

                        urls = lines[i]
                            .split(' // ')
                            .map(url => url.trim());
                    }

                    urls = urls.map(url =>
                        resolveMediaUrl(url, projectBase)
                    );

                    if (
                        description.includes('(marmoset viewer)')
                    ) {

                        urls = [`${urls[0]}.mview`];
                    }

                    const mediaElement =
                        createMediaElement(urls, description);

                    if (mediaElement) {
                        fragment.appendChild(mediaElement);
                    }

                    i += 1;
                }

                mediaContainer.appendChild(fragment);

                currentMediaIndex = 0;

                updateCarouselView();

                setFixedArrowPositions();

            } catch (error) {

                console.error(
                    'Error loading project media:',
                    error
                );

                setFixedArrowPositions();
            }
        };
                // =====================================================
        // PROJECT STATISTICS
        // =====================================================

        const fetchStats = async () => {
            try {
                const statsUrl = new URL(
                    'stats.txt',
                    getProjectBaseUrl()
                ).href;

                const response = await fetch(statsUrl);

                if (!response.ok) return;

                const text = await response.text();

                const lines = text
                    .split('\n')
                    .map(line => line.trim())
                    .filter(Boolean);

                const statsContainer =
                    document.getElementById('project-stats');

                if (!statsContainer) return;

                statsContainer.innerHTML = '';

                const iconMap = {
                    'Triangles': 'change_history',
                    'Materials': 'texture',
                    'Texture Size': 'straighten',
                    'Texel Density': 'square_foot',
                    'Target Engine': 'gamepad',
                    'Workflow': 'brush',
                    'Collaborators': 'groups'
                };

                const iconClassMap = {
                    'Triangles': 'triangle-icon',
                    'Materials': 'material-icon',
                    'Texture Size': 'size-icon',
                    'Texel Density': 'td-icon',
                    'Target Engine': 'engine-icon',
                    'Workflow': 'workflow-icon',
                    'Collaborators': 'collab-icon'
                };

                lines.forEach(line => {

                    let [key, value] = line
                        .split(':')
                        .map(part => part.trim());

                    if (!key || !value) return;

                    let info = '';

                    if (
                        value.includes('(') &&
                        value.includes(')')
                    ) {
                        info = value.substring(
                            value.indexOf('(') + 1,
                            value.indexOf(')')
                        );

                        value = value
                            .substring(0, value.indexOf('('))
                            .trim();
                    }

                    if (!value) return;

                    const statElement =
                        document.createElement('div');

                    statElement.className = 'stat';

                    const icon = iconMap[key];
                    const iconClass = iconClassMap[key];

                    if (icon) {

                        const iconElement =
                            document.createElement('span');

                        iconElement.className =
                            `material-icons stat-icon ${iconClass}`;

                        iconElement.textContent = icon;

                        statElement.appendChild(iconElement);
                    }

                    const textElement =
                        document.createElement('span');

                    const strongElement =
                        document.createElement('strong');

                    strongElement.textContent = `${key}:`;

                    textElement.appendChild(strongElement);
                    textElement.appendChild(
                        document.createTextNode(` ${value}`)
                    );

                    statElement.appendChild(textElement);

                    if (info) {

                        const infoIcon =
                            document.createElement('i');

                        infoIcon.className =
                            'fa-solid fa-circle-info stat-info-icon';

                        const tooltip =
                            document.createElement('div');

                        tooltip.className = 'tooltip';
                        tooltip.textContent = info;

                        statElement.appendChild(infoIcon);
                        statElement.appendChild(tooltip);

                        infoIcon.addEventListener(
                            'mouseover',
                            event => {
                                tooltip.style.display = 'block';
                                positionTooltip(event, tooltip);
                            }
                        );

                        infoIcon.addEventListener(
                            'mousemove',
                            event => {
                                positionTooltip(event, tooltip);
                            }
                        );

                        infoIcon.addEventListener(
                            'mouseout',
                            () => {
                                tooltip.style.display = 'none';
                            }
                        );
                    }

                    statsContainer.appendChild(statElement);
                });

            } catch (error) {

                console.error(
                    'Error loading project stats:',
                    error
                );
            }
        };

        // =====================================================
        // TOOLTIP POSITION
        // =====================================================

        const positionTooltip = (event, tooltip) => {

            const tooltipRect =
                tooltip.getBoundingClientRect();

            const viewportWidth = window.innerWidth;

            let top = event.clientY -
                tooltipRect.height - 10;

            let left = event.clientX;

            if (top < 0) {
                top = event.clientY + 10;
            }

            if (left + tooltipRect.width > viewportWidth) {
                left = viewportWidth -
                    tooltipRect.width - 10;
            }

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        };

        // =====================================================
        // BACK TO TOP BUTTON
        // =====================================================

        const backToTopButton =
            document.getElementById('back-to-top');

        const mediaContainer =
            document.querySelector('.media-container');

        if (mediaContainer && backToTopButton) {

            mediaContainer.addEventListener('scroll', () => {

                backToTopButton.style.display =
                    mediaContainer.scrollTop > 1000
                        ? 'block'
                        : 'none';
            });

            backToTopButton.addEventListener('click', () => {

                mediaContainer.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // =====================================================
        // KEYBOARD CONTROLS
        // =====================================================

        window.addEventListener(
            'resize',
            setFixedArrowPositions
        );

        document.addEventListener('keydown', event => {

            const target = event.target;

            const isTyping =
                target &&
                (
                    target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable
                );

            if (isTyping) return;

            if (event.key === 'Escape') {

                window.location.href = new URL(
                    'index.html',
                    getSiteRootUrl()
                ).href;

            } else if (event.key === 'ArrowLeft') {

                navigateMedia(-1);

            } else if (event.key === 'ArrowRight') {

                navigateMedia(1);

            } else if (event.key === 'ArrowUp' && mediaContainer) {

                mediaContainer.scrollBy({
                    top: -200,
                    behavior: 'smooth'
                });

            } else if (event.key === 'ArrowDown' && mediaContainer) {

                mediaContainer.scrollBy({
                    top: 200,
                    behavior: 'smooth'
                });
            }
        });

        // =====================================================
        // INITIALIZE EVERYTHING
        // =====================================================

        const init = async () => {

            projects = await fetchProjects();

            const prevBtn =
                document.getElementById('prev-project');

            const nextBtn =
                document.getElementById('next-project');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    navigateMedia(-1);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    navigateMedia(1);
                });
            }

            await Promise.allSettled([
                fetchDescription(),
                loadMedia(),
                fetchStats()
            ]);

            addHomeButtonUnderSoftware();

            setFixedArrowPositions();

            await renderOtherProjectsCarousel(projects);
        };

        init();

    });

})();
