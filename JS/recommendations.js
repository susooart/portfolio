document.addEventListener("DOMContentLoaded", async () => {
    const recommendationContent = document.querySelector('.recommendation-content');
    const dotsContainer = document.getElementById('recommendation-dots');

    if (!recommendationContent) {
        console.error('Recommendation content container not found');
        return;
    }

    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        dotsContainer.style.display = 'none';
    }

    try {
        const response = await fetch('Config/recommendations.txt');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const text = await response.text();
        const recommendations = text.split('---').map(rec => rec.trim()).filter(rec => rec);

        recommendationContent.innerHTML = '';
        recommendationContent.style.minHeight = 'auto';
        recommendationContent.style.height = 'auto';
        recommendationContent.style.overflow = 'visible';

        const recommendationFragment = document.createDocumentFragment();

        recommendations.forEach((rec) => {
            const lines = rec.split('\n').map(line => line.trim()).filter(line => line);
            if (lines.length === 0) return;

            const hasAvatar = Boolean(lines[1] && lines[1].startsWith('http'));
            const name = lines[0] || '';
            const avatar = hasAvatar ? lines[1] : '';
            const position = hasAvatar ? (lines[2] || '') : (lines[1] || '');
            const date = hasAvatar ? (lines[3] || '') : (lines[2] || '');
            const quote = hasAvatar ? (lines[4] || '') : (lines[3] || '');

            const recommendation = document.createElement("div");
            recommendation.className = "recommendation active";
            recommendation.style.display = "block";
            recommendation.style.opacity = "1";
            recommendation.style.position = "static";
            recommendation.style.transform = "none";
            recommendation.style.marginBottom = "24px";

            recommendation.innerHTML = `
                <div class="recommendation-header">
                    ${avatar ? `<img src="${avatar}" alt="${name}" class="recommendation-avatar">` : ''}
                    <div class="recommendation-details">
                        ${name ? `<h2>${name}</h2>` : ''}
                        ${position ? `<h3>${position}</h3>` : ''}
                        ${date ? `<p class="recommendation-date">${date}</p>` : ''}
                    </div>
                </div>
                ${quote ? `<p class="recommendation-quote">${quote}</p>` : ''}
            `;

            recommendationFragment.appendChild(recommendation);
        });

        recommendationContent.appendChild(recommendationFragment);
    } catch (error) {
        console.error('Failed to load recommendations:', error);
    }
});
