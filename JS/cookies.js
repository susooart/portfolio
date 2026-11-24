(() => {
    const STORAGE_KEY = 'portfolio_cookie_consent';

    window.hasCookieConsent = () => localStorage.getItem(STORAGE_KEY) === 'accepted';

    const saveConsent = (value) => {
        localStorage.setItem(STORAGE_KEY, value);
        window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: { consent: value } }));
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) banner.remove();
    };

    const createBanner = () => {
        if (localStorage.getItem(STORAGE_KEY) || document.getElementById('cookie-consent-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.style.position = 'fixed';
        banner.style.bottom = '16px';
        banner.style.left = '16px';
        banner.style.right = '16px';
        banner.style.maxWidth = '560px';
        banner.style.margin = '0 auto';
        banner.style.padding = '16px 18px';
        banner.style.backgroundColor = '#1e1e1e';
        banner.style.color = '#d7d7d7';
        banner.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        banner.style.borderRadius = '8px';
        banner.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.55)';
        banner.style.zIndex = '10000';
        banner.style.fontFamily = 'Poppins, sans-serif';
        banner.style.fontSize = '13px';
        banner.style.lineHeight = '1.45';

        const text = document.createElement('p');
        text.style.margin = '0 0 12px 0';
        text.textContent = 'This portfolio uses third-party content (such as embedded YouTube videos) that may set cookies when loaded. You can accept or reject external media cookies.';

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '10px';
        actions.style.justifyContent = 'flex-end';

        const rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.textContent = 'Reject';
        rejectBtn.style.padding = '7px 14px';
        rejectBtn.style.borderRadius = '6px';
        rejectBtn.style.border = '1px solid rgba(255, 255, 255, 0.28)';
        rejectBtn.style.backgroundColor = '#272727';
        rejectBtn.style.color = '#d7d7d7';
        rejectBtn.style.cursor = 'pointer';
        rejectBtn.style.fontSize = '13px';

        const acceptBtn = document.createElement('button');
        acceptBtn.type = 'button';
        acceptBtn.textContent = 'Accept';
        acceptBtn.style.padding = '7px 14px';
        acceptBtn.style.borderRadius = '6px';
        acceptBtn.style.border = '1px solid #edb049';
        acceptBtn.style.backgroundColor = '#edb049';
        acceptBtn.style.color = '#141414';
        acceptBtn.style.fontWeight = '600';
        acceptBtn.style.cursor = 'pointer';
        acceptBtn.style.fontSize = '13px';

        rejectBtn.addEventListener('click', () => saveConsent('rejected'));
        acceptBtn.addEventListener('click', () => saveConsent('accepted'));

        actions.appendChild(rejectBtn);
        actions.appendChild(acceptBtn);
        banner.appendChild(text);
        banner.appendChild(actions);
        document.body.appendChild(banner);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBanner);
    } else {
        createBanner();
    }
})();