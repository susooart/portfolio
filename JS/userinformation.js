function addUserInformation() {
    let configPath = 'Config/userinformation.txt';
    let assetPrefix = '';

    if (window.location.pathname.includes('/Projects/')) {
        configPath = '../../Config/userinformation.txt';
        assetPrefix = '../../';
    } else if (window.location.pathname.includes('/HTML/')) {
        configPath = '../Config/userinformation.txt';
        assetPrefix = '../';
    }

    fetch(configPath)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(data => {
            const lines = data.split('\n').map(line => line.trim()).filter(line => line);
            const [profilePicUrl, profileName, profileRole, location, ...socials] = lines;

            const container = document.querySelector('.top-container');
            if (!container) return;

            const fragment = document.createDocumentFragment();

            const userInfoPanel = document.createElement("div");
            userInfoPanel.className = "user-info-panel";

            if (profilePicUrl) {
                const img = document.createElement("img");
                const isExternalOrRoot =
                    profilePicUrl.startsWith('http') ||
                    profilePicUrl.startsWith('/') ||
                    profilePicUrl.startsWith('../');
                img.src = isExternalOrRoot ? profilePicUrl : `${assetPrefix}${profilePicUrl}`;
                img.alt = "Profile Picture";
                img.className = "profile-pic";
                img.addEventListener('error', () => {
                    img.style.display = 'none';
                });
                userInfoPanel.appendChild(img);
            }

            const userNameLink = document.createElement("a");
            userNameLink.href = window.location.pathname.includes('/Projects/') ? "../../index.html" : "index.html";
            userNameLink.className = "user-name-link";

            const userName = document.createElement("h1");
            userName.className = "user-name";
            userName.textContent = profileName;
            userNameLink.appendChild(userName);
            userInfoPanel.appendChild(userNameLink);

            const userRole = document.createElement("h2");
            userRole.textContent = profileRole;
            userInfoPanel.appendChild(userRole);

            const userLocationContainer = document.createElement("div");
            userLocationContainer.className = "user-location-container";

            const locationIcon = document.createElement("span");
            locationIcon.className = "material-symbols-outlined";
            locationIcon.textContent = "near_me";
            userLocationContainer.appendChild(locationIcon);

            const userLocation = document.createElement("h2");
            userLocation.textContent = location;
            userLocationContainer.appendChild(userLocation);

            userInfoPanel.appendChild(userLocationContainer);

            const socialIcons = document.createElement("div");
            socialIcons.className = "social-icons";
            userInfoPanel.appendChild(socialIcons);

            const socialIconMap = {
                'x.com': "fa-brands fa-x-twitter",
                'facebook.com': "fa-brands fa-square-facebook",
                'discord.com': "fa-brands fa-discord",
                'discord.gg': "fa-brands fa-discord",
                'dsc.gg': "fa-brands fa-discord",
                'instagram.com': "fa-brands fa-instagram",
                'youtube.com': "fa-brands fa-youtube",
                'linkedin.com': "fab fa-linkedin",
                'artstation.com': "fa-brands fa-artstation",
                'github.com': "fab fa-github",
                'wordpress.com': "fab fa-wordpress",
                'vimeo.com': "fab fa-vimeo",
                'behance.net': "fab fa-behance",
                'playstation.com': "fab fa-playstation",
                'xbox.com': "fab fa-xbox",
                'vk.com': "fab fa-vk",
                'steamcommunity.com': "fab fa-steam",
                'tumblr.com': "fab fa-tumblr",
                'threads.net': "fab fa-threads",
                'patreon.com': "fab fa-patreon",
                'twitch.tv': "fab fa-twitch",
                'mixer.com': "fab fa-mixer",
                'mastodon.social': "fab fa-mastodon",
                'mailchimp.com': "fab fa-mailchimp",
                'email': "fas fa-envelope"
            };

            socials.forEach(social => {
                let iconClass;
                let url = social;

                const socialType = Object.keys(socialIconMap).find(key => social.includes(key)) || 'email';
                iconClass = socialIconMap[socialType];
                if (socialType === 'email') {
                    url = `mailto:${social}`;
                }

                if (iconClass) {
                    const a = document.createElement("a");
                    a.href = url;
                    a.target = "_blank";
                    const icon = document.createElement("i");
                    icon.className = iconClass;
                    a.appendChild(icon);
                    socialIcons.appendChild(a);
                }
            });

            fragment.appendChild(userInfoPanel);
            container.appendChild(fragment);
        })
        .catch(error => console.error('Error loading user information:', error));
}

document.addEventListener("DOMContentLoaded", addUserInformation);
