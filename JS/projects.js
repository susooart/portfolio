const createHomeButton = () => {
    if (document.querySelector('.home-floating-btn')) return;

    const homeBtn = document.createElement('a');
    homeBtn.href = '../../index.html';
    homeBtn.className = 'home-floating-btn';
    homeBtn.setAttribute('aria-label', 'Back to main menu');
    homeBtn.title = 'Main menu';
    homeBtn.innerHTML = '<i class="fa-solid fa-house"></i>';

    homeBtn.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: #1e1e1e;
        color: #d7d7d7;
        border: 1px solid rgba(255, 255, 255, 0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        font-size: 18px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);
        z-index: 9999;
        cursor: pointer;
    `;

    homeBtn.addEventListener('mouseenter', () => {
        homeBtn.style.color = '#edb049';
        homeBtn.style.borderColor = '#edb049';
        homeBtn.style.backgroundColor = '#272727';
    });

    homeBtn.addEventListener('mouseleave', () => {
        homeBtn.style.color = '#d7d7d7';
        homeBtn.style.borderColor = 'rgba(255, 255, 255, 0.18)';
        homeBtn.style.backgroundColor = '#1e1e1e';
    });

    document.body.appendChild(homeBtn);
};
    init();
});
