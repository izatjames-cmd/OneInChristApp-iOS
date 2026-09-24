// Paste using one of the generated HTML blocks, after the existing navbar.
(function () {
    const language = document.currentScript.dataset.memberLanguage;
    const labels = {
        en: ['Member Login', 'Member Area'],
        da: ['Medlemslogin', 'Medlemsområde'],
        ur: ['رکن لاگ اِن', 'اراکین کا حصہ']
    }[language];
    if (!labels || window.parent === window) return;

    function start() {
        const dropdown = document.querySelector('.mobile-dropdown');
        if (!dropdown || dropdown.querySelector('[data-oneinchrist-members]')) return;
        const group = document.createElement('div');
        group.dataset.oneinchristMembers = 'true';
        group.hidden = true;
        group.style.setProperty('display', 'none', 'important');
        group.style.borderTop = '1px solid rgba(0,0,0,.12)';
        group.lang = language;
        group.dir = language === 'ur' ? 'rtl' : 'ltr';
        let appOrigin = null;
        const links = labels.map(function (label, index) {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = label;
            link.style.textAlign = language === 'ur' ? 'right' : 'left';
            link.addEventListener('click', function (event) {
                event.preventDefault();
                if (!appOrigin) return;
                window.parent.postMessage({
                    type: 'oneinchrist:member-menu-action', version: 1,
                    action: index === 0 ? 'login' : 'area'
                }, appOrigin);
                dropdown.classList.remove('show');
                const toggle = document.querySelector('[aria-controls="' + dropdown.id + '"]');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
            group.appendChild(link);
            return link;
        });
        dropdown.appendChild(group);
        // Only the local app shell may enable these links. A public website
        // visit never receives this handshake and keeps them hidden.
        const allowed = function (origin) {
            return origin === 'capacitor://localhost' || origin === 'https://localhost' ||
                /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        };
        window.addEventListener('message', function (event) {
            if (event.source !== window.parent || !allowed(event.origin)) return;
            const data = event.data;
            if (!data || data.version !== 1) return;
            if (data.type === 'oneinchrist:member-menu-probe') {
                window.parent.postMessage({ type: 'oneinchrist:member-menu-ready', version: 1 }, event.origin);
            } else if (data.type === 'oneinchrist:member-menu-state') {
                appOrigin = event.origin;
                group.hidden = false;
                group.style.setProperty('display', 'block', 'important');
                links[1].style.setProperty('display', data.memberAreaAvailable ? 'block' : 'none', 'important');
            }
        });
        // No user information is included in the initial readiness message.
        window.parent.postMessage({ type: 'oneinchrist:member-menu-ready', version: 1 }, '*');
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
