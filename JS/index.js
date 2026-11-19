// Function to create a thumbnail with overlay icons
function createThumbnail(src, alt, galleryPageUrl, hasMultipleImages, hasVideo, hasYouTube, hasSketchfab) {
    const thumbnailLink = document.createElement("a");
    thumbnailLink.href = galleryPageUrl;

    const thumbnailDiv = document.createElement("div");
    thumbnailDiv.classList.add("thumbnail");

    const thumbnailImg = document.createElement("img");
    thumbnailImg.src = src;
    thumbnailImg.alt = alt;

    const thumbnailTitle = document.createElement("div");
    thumbnailTitle.classList.add("thumbnail-title");
    thumbnailTitle.innerText = alt;

    let iconIndex = 0;

    if (hasMultipleImages) {
        const multipleImagesIcon = document.createElement("i");
        multipleImagesIcon.className = "fa-solid fa-layer-group overlay-icon";
        multipleImagesIcon.style.left = `${10 + iconIndex * 30}px`;
        thumbnailDiv.appendChild(multipleImagesIcon);
        iconIndex++;
    }

    if (hasVideo) {
        const videoIcon = document.createElement("i");
        videoIcon.className = "fa-solid fa-video overlay-icon";
        videoIcon.style.left = `${10 + iconIndex * 30}px`;
        thumbnailDiv.appendChild(videoIcon);
        iconIndex++;
    }

    if (hasYouTube) {
        const youtubeIcon = document.createElement("i");
        youtubeIcon.className = "fa-brands fa-youtube overlay-icon";
        youtubeIcon.style.left = `${10 + iconIndex * 30}px`;
        thumbnailDiv.appendChild(youtubeIcon);
        iconIndex++;
    }

    if (hasSketchfab) {
        const sketchfabIcon = document.createElement("i");
        sketchfabIcon.className = "fa-solid fa-cube overlay-icon";
        sketchfabIcon.style.left = `${10 + iconIndex * 30}px`;
        thumbnailDiv.appendChild(sketchfabIcon);
        iconIndex++;
    }

    thumbnailDiv.appendChild(thumbnailImg);
    thumbnailDiv.appendChild(thumbnailTitle);
    thumbnailLink.appendChild(thumbnailDiv);

    return thumbnailLink;
}

const thumbnailContainer = document.getElementById("thumbnail-container");

function fetchProjectData(projectName) {
    const descriptionPath = `Projects/${projectName}/description.txt`;
    const mediaPath = `Projects/${projectName}/media.txt`;

    return Promise.all([
        fetch(descriptionPath).then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status} on ${descriptionPath}`);
            return response.text();
        }),
        fetch(mediaPath).then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status} on ${mediaPath}`);
            return response.text();
        })
    ])
    .then(([descriptionText, mediaText]) => {
        const [title, description, tags, thumbnailUrl, htmlFileName] = descriptionText.split('---').map(line => line.trim());
        const resolvedHtmlFile = htmlFileName || `${projectName}.html`;
        const galleryPageUrl = `Projects/${projectName}/${resolvedHtmlFile}`;

        const mediaLines = mediaText.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
        const hasMultipleImages = mediaLines.filter(line => line.split('?')[0].match(/\.(jpeg|jpg|gif|png|webp)$/i)).length > 1;
        const hasVideo = mediaLines.some(line => line.split('?')[0].match(/\.(mp4|webm)$/i));
        const hasYouTube = mediaLines.some(line => line.includes('youtube.com') || line.includes('youtu.be'));
        const hasSketchfab = mediaLines.some(line => line.includes('sketchfab.com'));

        const bannerImageLine = mediaLines.find(line => line.endsWith('*'));
        const bannerImageUrl = bannerImageLine ? bannerImageLine.slice(0, -1).trim() : null;

        return {
            src: thumbnailUrl,
            alt: title || projectName,
            galleryPageUrl,
            hasMultipleImages,
            hasVideo,
            hasYouTube,
            hasSketchfab,
            bannerImageUrl
        };
    });
}

function fetchProjects() {
    return fetch('Config/projects.txt')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status} on Config/projects.txt`);
            return response.text();
        })
        .then(text => text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#')))
        .catch(error => {
            console.error('Error loading projects:', error);
            return [];
        });
}

fetchProjects().then(projects => {
    if (!thumbnailContainer || !projects.length) return;

    let bannerImageSet = false;
    const fragment = document.createDocumentFragment();

    const fetchProjectDataPromises = projects.map(projectName => {
        return fetchProjectData(projectName).then(artwork => {
            const thumbnail = createThumbnail(
                artwork.src,
                artwork.alt,
                artwork.galleryPageUrl,
                artwork.hasMultipleImages,
                artwork.hasVideo,
                artwork.hasYouTube,
                artwork.hasSketchfab
            );
            fragment.appendChild(thumbnail);

            if (!bannerImageSet && artwork.bannerImageUrl) {
                const topContainer = document.querySelector('.top-container');
                if (topContainer) {
                    topContainer.style.backgroundImage = `url(${artwork.bannerImageUrl})`;
                    bannerImageSet = true;
                }
            }
        }).catch(error => console.error(`Error loading data for project: ${projectName}`, error));
    });

    Promise.all(fetchProjectDataPromises).then(() => {
        thumbnailContainer.appendChild(fragment);
    });
});
