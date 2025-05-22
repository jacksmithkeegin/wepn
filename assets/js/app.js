// app.js
document.addEventListener('DOMContentLoaded', () => {
    // State variables
    let currentLanguage = 'en';
    let releases = [];
    let currentReleaseId = null;

    // Cache DOM elements
    const releasesGrid = document.getElementById('releases-grid');
    const bandcampPlayer = document.getElementById('bandcamp-player');
    const currentTrackElement = document.getElementById('current-track');
    const languageButtons = {
        en: document.getElementById('lang-en'),
        cy: document.getElementById('lang-cy')
    };
    const currentYearElement = document.getElementById('current-year');
    const playerBar = document.querySelector('.player-bar');
    const navLinks = document.querySelector('.nav-links');

    // Set current year in footer
    currentYearElement.textContent = new Date().getFullYear();    // Load releases data
    async function loadReleasesData() {
        try {
            // Use relative path for better compatibility with various deployment scenarios
            const response = await fetch('assets/js/releases-data.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const rawReleases = await response.json();
            // Map release_info.json structure to expected fields
            releases = rawReleases.map(r => ({
                id: r.release_code.en,
                title_en: r.title.en,
                title_cy: r.title.cy || r.title.en,
                artist: r.artists.en,
                artwork_url: r.artwork_url || '',                // Update to use new Jekyll path pattern
                artwork_small_url: r.artwork_small_url || `assets/images/releases/small/${r.release_code.en}_small.jpg`,
                bandcampEmbedUrl: r.bandcampEmbedUrl || '',
                buyUrl: (r.link && r.link.en) || '',
                description_en: r.description.en,
                description_cy: r.description.cy || r.description.en,
                release_date_en: r.release_date.en,
                release_date_cy: r.release_date.cy || r.release_date.en
            }));
            displayReleases();
            checkUrlFragment();
        } catch (error) {
            console.error('Error loading releases:', error);
            releasesGrid.innerHTML = '<p class="error">Failed to load releases. Please try again later.</p>';
        }
    }

    // Display releases in the grid
    function displayReleases() {
        releasesGrid.innerHTML = '';
        
        releases.forEach(release => {
            const releaseItem = document.createElement('div');
            releaseItem.className = 'release-item';
            releaseItem.id = release.id;
            releaseItem.setAttribute('tabindex', '0');
            
            if (release.id === currentReleaseId) {
                releaseItem.classList.add('active');
            }
            
            releaseItem.innerHTML = `
                <img 
                    src="${release.artwork_small_url}" 
                    alt="${release[`title_${currentLanguage}`]}" 
                    class="release-image"
                    loading="lazy"
                >
                <div class="release-overlay">
                    <h3 class="release-title">${release[`title_${currentLanguage}`]}</h3>
                    <p class="release-artist">${release.artist}</p>
                    <div class="release-buttons">
                        <button class="listen-btn" data-id="${release.id}" aria-label="${translations[currentLanguage]['releases.listenButton']} ${release[`title_${currentLanguage}`]}">
                            ${translations[currentLanguage]['releases.listenButton']}
                        </button>
                        <a href="${release.buyUrl}" class="buy-link" target="_blank" rel="noopener noreferrer">
                            ${translations[currentLanguage]['releases.buyOn']}
                        </a>
                    </div>
                </div>
            `;
            
            releasesGrid.appendChild(releaseItem);
        });
        
        // Add event listeners to listen buttons
        document.querySelectorAll('.listen-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const releaseId = e.target.dataset.id;
                loadReleaseInPlayer(releaseId);
                e.stopPropagation();
                // Prevent URL hash change
                history.replaceState(null, null, '#releases');
            });
        });

        // Add keyboard support for release items
        document.querySelectorAll('.release-item').forEach(item => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const releaseId = item.id;
                    loadReleaseInPlayer(releaseId);
                    e.preventDefault();
                }
            });
        });
    }

    // Load a release in the Bandcamp player
    function loadReleaseInPlayer(releaseId) {
        const release = releases.find(r => r.id === releaseId);
        if (!release) return;
        
        // Update player
        bandcampPlayer.src = release.bandcampEmbedUrl;
        currentTrackElement.textContent = release[`title_${currentLanguage}`];
        
        // Show player bar if hidden
        if (playerBar && !playerBar.classList.contains('visible')) {
            playerBar.classList.add('visible');
            document.body.classList.add('player-bar-visible');
        }
        
        // Update UI
        if (currentReleaseId) {
            const previousItem = document.getElementById(currentReleaseId);
            if (previousItem) previousItem.classList.remove('active');
        }
        
        const currentItem = document.getElementById(releaseId);
        if (currentItem) currentItem.classList.add('active');
        
        // Update state
        currentReleaseId = releaseId;
        
        // Remove hash update here so it doesn't change URL
        // history.replaceState(null, null, `#${releaseId}`);
    }

    // Check URL fragment for direct linking
    function checkUrlFragment() {
        const fragment = window.location.hash.substring(1);
        if (fragment && releases.some(r => r.id === fragment)) {
            loadReleaseInPlayer(fragment);
            
            // Scroll to the release
            setTimeout(() => {
                const element = document.getElementById(fragment);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }

    // Set up language toggle
    function setupLanguageToggle() {
        languageButtons.en.addEventListener('click', () => switchLanguage('en'));
        languageButtons.cy.addEventListener('click', () => switchLanguage('cy'));
    }

    // Switch language
    function switchLanguage(lang) {
        if (lang === currentLanguage) return;
        
        // Update buttons
        languageButtons[currentLanguage].classList.remove('active');
        languageButtons[currentLanguage].setAttribute('aria-pressed', 'false');
        languageButtons[lang].classList.add('active');
        languageButtons[lang].setAttribute('aria-pressed', 'true');
        
        // Update language
        currentLanguage = lang;
        document.documentElement.lang = lang;
        
        // Update UI with translations
        updateUILanguage();
        
        // Redisplay releases with new language
        displayReleases();
        
        // Update current track if one is playing
        if (currentReleaseId) {
            const release = releases.find(r => r.id === currentReleaseId);
            if (release) {
                currentTrackElement.textContent = release[`title_${currentLanguage}`];
            }
        }
    }

    // Update UI elements with translated text
    function updateUILanguage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[currentLanguage][key]) {
                element.textContent = translations[currentLanguage][key];
            }
        });
    }

    // Mobile nav toggle button
    const mobileNavToggle = document.createElement('button');
    mobileNavToggle.className = 'mobile-nav-toggle';
    mobileNavToggle.setAttribute('aria-label', 'Toggle navigation');
    mobileNavToggle.innerHTML = '&#9776;'; // Hamburger icon

    // Insert toggle button before nav links
    const navContainer = document.querySelector('.top-nav .container');
    navContainer.insertBefore(mobileNavToggle, navLinks);

    // Toggle nav links on mobile
    mobileNavToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileNavToggle.classList.toggle('active');
    });

    // Close nav on link click (for better UX)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                mobileNavToggle.classList.remove('active');
            }
        });
    });

    // Tab switching logic
    const tabSections = document.querySelectorAll('.tab-content');
    const navTabLinks = document.querySelectorAll('.nav-links a');

    function showTab(tabId) {
        tabSections.forEach(section => {
            if (section.id === tabId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        navTabLinks.forEach(link => {
            if (link.getAttribute('href') === `#${tabId}`) {
                link.classList.add('active');
                link.setAttribute('aria-selected', 'true');
                link.setAttribute('tabindex', '0');
            } else {
                link.classList.remove('active');
                link.setAttribute('aria-selected', 'false');
                link.setAttribute('tabindex', '-1');
            }
        });
    }

    // Intercept nav link clicks for tab switching
    navTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const tabId = link.getAttribute('href').replace('#', '');
            showTab(tabId);
            history.replaceState(null, null, `#${tabId}`);
            e.preventDefault();
        });
    });

    // On page load, show tab from hash or default
    function initTabs() {
        let initialTab = window.location.hash.replace('#', '') || 'releases';
        if (![...tabSections].some(s => s.id === initialTab)) {
            initialTab = 'releases';
        }
        showTab(initialTab);
    }

    // Initialize the application
    function init() {
        // Set initial language based on browser settings
        const browserLang = navigator.language.substring(0, 2);
        if (browserLang === 'cy') {
            switchLanguage('cy');
        } else {
            updateUILanguage();
        }
        
        setupLanguageToggle();
        loadReleasesData();
        initTabs();
        
        // Hide player bar and remove body class on load
        playerBar.classList.remove('visible');
        document.body.classList.remove('player-bar-visible');
        
        // Handle window resize for responsive layout adjustments
        window.addEventListener('resize', () => {
            // Any responsive adjustments can be added here
        });
    }

    // Start the application
    init();
});
