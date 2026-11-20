(() => {
    const addHomeButtonUnderSoftware = () => {
        if (!document.body || document.querySelector('.home-inline-btn')) return;

        const tagsContainer = document.getElementById('project-tags');
        const targetParent = tagsContainer ? tagsContainer.parentElement : null;
        if (!targetParent) return;

        const homeBtn = document.createElement('a');
        homeBtn.href = '../../index.html';
        homeBtn.className = 'home-inline-btn';
        homeBtn.setAttribute('aria-label', 'Back to main menu');
        homeBtn.title = 'Main menu';
        homeBtn.innerHTML = '<span>⌂</span><span>Main Menu</span>';

        homeBtn.style.display = 'inline-flex';
        homeBtn.style.alignItems = 'center';
        homeBtn.style.justifyContent = 'center';
        homeBtn.style.gap = '8px';
        homeBtn.style.marginTop = '14px';
        homeBtn.style.padding = '8px 14px';
        homeBtn.style.borderRadius = '6px';
        homeBtn.style.backgroundColor = '#1e1e1e';
        homeBtn.style.color = '#d7d7d7';
        homeBtn.style.border = '1px solid rgba(255, 255, 255, 0.25)';
        homeBtn.style.textDecoration = 'none';
        homeBtn.style.fontSize = '13px';
        homeBtn.style.fontWeight = '500';
        homeBtn.style.lineHeight = '1';
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

        if (tagsContainer.nextSibling) {
            targetParent.insertBefore(homeBtn, tagsContainer.nextSibling);
        } else {
            targetParent.appendChild(homeBtn);
        }
    };

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
        const rect = mediaContainer ? mediaContainer.getBoundingClientRect() : null;
        const topPos = rect ? Math.max(120, Math.round(rect.top + Math.min(220, rect.height * 0.28))) : 220;

        [prevBtn, nextBtn].forEach((btn) => {
            btn.style.position = 'fixed';
            btn.style.top = `${topPos}px`;
            btn.style.transform = 'translateY(-50%)';
            btn.style.zIndex = '9999';
            btn.style.width = '44px';
            btn.style.height = '44px';
            btn.style.minWidth = '44px';
            btn.style.minHeight = '44px';
            btn.style.maxWidth = '44px';
            btn.style.maxHeight = '44px';
            btn.style.borderRadius = '50%';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.backgroundColor = 'rgba(20, 20, 20, 0.72)';
            btn.style.color = '#ffffff';
            btn.style.border = '1px solid rgba(255, 255, 255, 0.22)';
            btn.style.cursor = 'pointer';
            btn.style.userSelect = 'none';
        });

        if (rect) {
            const leftPos = Math.max(16, Math.round(rect.left + 16));
            const rightPos = Math.max(16, Math.round(window.innerWidth - rect.right + 16));

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

    const getCurrentProjectSlug = () => {
        const parts = window.location.pathname.split('/').filter(Boolean);
        const projectsIdx = parts.findIndex(p => p.toLowerCase() === 'projects');
        if (projectsIdx !== -1 && parts[projectsIdx + 1]) {
            return parts[projectsIdx + 1];
        }
        return parts[parts.length - 2] || '';
    };

    const resolveProjectEntry = (rawEntry) => {
        const cleaned = rawEntry.trim();
        if (!cleaned) return null;

        if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
            return { href: cleaned, mediaBase: '', slug: cleaned };
        }

        const normalized = cleaned.replace(/^\/+/, '').replace(/\/+$/, '');
        if (normalized.endsWith('.html')) {
            const folder = normalized.split('/').slice(0, -1).join('/');
            return {
                href: `../../${normalized}`,
                mediaBase: folder ? `../../${folder}/` : '',
                slug: folder.split('/').pop() || normalized
            };
        }

        const folderPath = normalized.includes('/') ? normalized : `Projects/${normalized}`;
        return {
            href: `../../${folderPath}/index.html`,
            mediaBase: `../../${folderPath}/`,
            slug: normalized.split('/').pop()
        };
    };

    const findProjectThumbnail = async (entry) => {
        if (!entry.mediaBase) return '';

        try {
            const res = await fetch(`${entry.mediaBase}media.txt`);
            if (res.ok) {
                const text = await res.text();
                const lines = text
                    .split('\n')
                    .map(l => l.trim())
                    .filter(l => l && !l.startsWith('#'));

                for (const line of lines) {
                    const firstUrl = line.split(' // ')[0].trim();
                    const cleanUrl = firstUrl.split('?')[0].toLowerCase();
                    if (/\.(jpeg|jpg|gif|png|webp)$/.test(cleanUrl)) {
                        if (firstUrl.startsWith('http') || firstUrl.startsWith('/')) return firstUrl;
                        if (firstUrl.startsWith('Resources/')) return `../../${firstUrl}`;
                        return `${entry.mediaBase}${firstUrl}`;
                    }
                }
            }
        } catch {
            // Fallback a archivos comunes de thumbnail si no hay imagen en media.txt
        }

        const candidates = ['thumb.jpg', 'thumb.png', 'thumb.webp', 'thumbnail.jpg', 'thumbnail.png', 'cover.jpg', 'cover.png'];
        for (const file of candidates) {
            try {
                const check = await fetch(`${entry.mediaBase}${file}`, { method: 'HEAD' });
                if (check.ok) return `${entry.mediaBase}${file}`;
            } catch {
                // Continuar probando candidatos
            }
        }

        return '';
    };

    const renderOtherProjectsCarousel = async (projectEntries) => {
        const mediaContainer = document.querySelector('.media-container');
        const anchorParent = mediaContainer ? mediaContainer.parentElement : document.body;
        if (!anchorParent || document.getElementById('other-projects-section')) return;

        const currentSlug = getCurrentProjectSlug().toLowerCase();
        const parsedEntries = projectEntries
            .map(resolveProjectEntry)
            .filter(item => item && item.slug.toLowerCase() !== currentSlug);

        if (!parsedEntries.length) return;

        const shuffled = [...parsedEntries].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(3, shuffled.length));

        const section = document.createElement('div');
        section.id = 'other-projects-section';
        section.style.width = '100%';
        section.style.marginTop = '28px';
        section.style.paddingTop = '18px';
        section.style.borderTop = '1px solid rgba(255, 255, 255, 0.12)';
        section.style.boxSizing = 'border-box';

        const heading = document.createElement('h3');
        heading.textContent = 'Other Projects';
        heading.style.margin = '0 0 14px 0';
        heading.style.fontSize = '16px';
        heading.style.fontWeight = '600';
        heading.style.color = '#d7d7d7';

        const carousel = document.createElement('div');
        carousel.className = 'other-projects-carousel';
        carousel.style.display = 'grid';
        carousel.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
        carousel.style.gap = '14px';
        carousel.style.width = '100%';

        for (const item of selected) {
            const thumbUrl = await findProjectThumbnail(item);
            if (!thumbUrl) continue;

            const cardLink = document.createElement('a');
            cardLink.href = item.href;
            cardLink.title = item.slug;
            cardLink.style.display = 'block';
            cardLink.style.aspectRatio = '16 / 9';
            cardLink.style.overflow = 'hidden';
            cardLink.style.borderRadius = '8px';
            cardLink.style.backgroundColor = '#1a1a1a';
            cardLink.style.border = '1px solid rgba(255, 255, 255, 0.12)';
            cardLink.style.textDecoration = 'none';

            const img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = item.slug;
            img.loading = 'lazy';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.display = 'block';
            img.style.transition = 'transform 0.25s ease';

            cardLink.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.04)';
                cardLink.style.borderColor = '#edb049';
            });

            cardLink.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
                cardLink.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            });

            cardLink.appendChild(img);
            carousel.appendChild(cardLink);
        }

        if (!carousel.children.length) return;

        section.appendChild(heading);
        section.appendChild(carousel);

        if (mediaContainer && mediaContainer.nextSibling) {
            anchorParent.insertBefore(section, mediaContainer.nextSibling);
        } else {
            anchorParent.appendChild(section);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        addHomeButtonUnderSoftware();
        setFixedArrowPositions();

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

                addHomeButtonUnderSoftware();
                setFixedArrowPositions();
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
                        urls = lines[i].split(' // ').map(url => url.trim());
                    }

                    urls = urls.map(url => {
                        if (url.startsWith('http') || url.startsWith('/')) return url;
                        if (url.startsWith('Resources/')) return `../../${url}`;
                        return basePath + url;
                    });

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
                setFixedArrowPositions();
            } catch (error) {
                console.error('Error loading project media:', error);
                setFixedArrowPositions();
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

            if (/\.(jpeg|jpg|gif|png|webp)$/.test(cleanFirstUrl)) {
                mediaElement = createImageElement(urls);
            } else if (/\.(mp4|webm)$/.test(cleanFirstUrl)) {
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
                    const value = slider.value;
                    imgElement2.style.clipPath = `inset(0 0 0 ${value}%)`;
                    sliderLine.style.left = `calc(${value}% - 1px)`;
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

        const createYouTubeElement = (url) => {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item responsive-iframe-container';

            let videoId = '';
            try {
                const parsed = new URL(url);
                videoId = parsed.searchParams.get('v') || parsed.pathname.split('/').pop();
            } catch {
                videoId = '';
            }

            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.title = 'YouTube video';

            mediaElement.appendChild(iframe);
            return mediaElement;
        };

        const createSketchfabElement = (url) => {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item responsive-iframe-container';

            const sketchfabId = url.split('/').pop().split('-').pop();
            const iframe = document.createElement('iframe');
            iframe.src = `https://sketchfab.com/models/${sketchfabId}/embed`;
            iframe.allow = 'autoplay; fullscreen; vr';
            iframe.allowFullscreen = true;
            iframe.title = 'Sketchfab model';

            mediaElement.appendChild(iframe);
            return mediaElement;
        };

        const fetchStats = async () => {
            try {
                const response = await fetch('stats.txt');
                if (!response.ok) return;
                const text = await response.text();
                const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                const statsContainer = document.getElementById('project-stats');
                if (!statsContainer) return;

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
                    let [key, value] = line.split(':').map(part => part.trim());
                    if (!key || !value) return;
                    let info = '';

                    if (value.includes('(') && value.includes(')')) {
                        info = value.substring(value.indexOf('(') + 1, value.indexOf(')'));
                        value = value.substring(0, value.indexOf('(')).trim();
                    }

                    if (value) {
                        const statElement = document.createElement('div');
                        statElement.className = 'stat';

                        const icon = iconMap[key];
                        const iconClass = iconClassMap[key];
                        if (icon) {
                            const iconElement = document.createElement('span');
                            iconElement.className = `material-icons stat-icon ${iconClass}`;
                            iconElement.textContent = icon;
                            statElement.appendChild(iconElement);
                        }

                        const textElement = document.createElement('span');
                        textElement.innerHTML = `<strong>${key}:</strong> ${value}`;
                        statElement.appendChild(textElement);

                        if (info) {
                            const infoIcon = document.createElement('i');
                            infoIcon.className = 'fa-solid fa-circle-info stat-info-icon';
                            infoIcon.removeAttribute('title');

                            const tooltip = document.createElement('div');
                            tooltip.className = 'tooltip';
                            tooltip.textContent = info;

                            statElement.appendChild(infoIcon);
                            statElement.appendChild(tooltip);

                            infoIcon.addEventListener('mouseover', (event) => {
                                tooltip.style.display = 'block';
                                positionTooltip(event, tooltip);
                            });

                            infoIcon.addEventListener('mousemove', (event) => {
                                positionTooltip(event, tooltip);
                            });

                            infoIcon.addEventListener('mouseout', () => {
                                tooltip.style.display = 'none';
                            });
                        }

                        statsContainer.appendChild(statElement);
                    }
                });
            } catch (error) {
                console.error('Error loading project stats:', error);
            }
        };

        const positionTooltip = (event, tooltip) => {
            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            let top = event.clientY - tooltipRect.height - 10;
            let left = event.clientX;

            if (top < 0) {
                top = event.clientY + 10;
            }

            if (left + tooltipRect.width > viewportWidth) {
                left = viewportWidth - tooltipRect.width - 10;
            }

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        };

        const backToTopButton = document.getElementById('back-to-top');
        const mediaContainer = document.querySelector('.media-container');

        if (mediaContainer && backToTopButton) {
            mediaContainer.addEventListener('scroll', () => {
                backToTopButton.style.display = mediaContainer.scrollTop > 1000 ? 'block' : 'none';
            });

            backToTopButton.addEventListener('click', () => {
                mediaContainer.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        window.addEventListener('resize', setFixedArrowPositions);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                window.location.href = '../../index.html';
            } else if (event.key === 'ArrowLeft') {
                navigateMedia(-1);
            } else if (event.key === 'ArrowRight') {
                navigateMedia(1);
            } else if (event.key === 'ArrowUp' && mediaContainer) {
                mediaContainer.scrollBy({ top: -200, behavior: 'smooth' });
            } else if (event.key === 'ArrowDown' && mediaContainer) {
                mediaContainer.scrollBy({ top: 200, behavior: 'smooth' });
            }
        });

        const init = async () => {
            projects = await fetchProjects();
            const prevBtn = document.getElementById('prev-project');
            const nextBtn = document.getElementById('next-project');
            if (prevBtn) prevBtn.addEventListener('click', () => navigateMedia(-1));
            if (nextBtn) nextBtn.addEventListener('click', () => navigateMedia(1));
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
