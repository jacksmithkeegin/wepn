// app.js
document.addEventListener('DOMContentLoaded', () => {    // State variables
    let currentLanguage = 'en';
    let releases = [];
    let displayConfig = null;
    let currentReleaseId = null;
    let featuredReleaseId = null;

    // Cache DOM elements
    const releasesGrid = document.getElementById('releases-grid');
    const bandcampPlayer = document.getElementById('bandcamp-player');
    // Patch: If currentTrackElement is null (because Now Playing was removed), create a dummy span to avoid errors
    let currentTrackElement = document.getElementById('current-track');
    if (!currentTrackElement) {
        currentTrackElement = document.createElement('span');
        currentTrackElement.id = 'current-track';
        // Optionally, keep it hidden
        currentTrackElement.style.display = 'none';
        // Insert into DOM for compatibility
        if (bandcampPlayer && bandcampPlayer.parentNode) {
            bandcampPlayer.parentNode.insertBefore(currentTrackElement, bandcampPlayer);
        }
    }
    const languageButtons = {
        en: document.getElementById('lang-en'),
        cy: document.getElementById('lang-cy')
    };
    const currentYearElement = document.getElementById('current-year');
    const playerBar = document.querySelector('.player-bar');
    const navLinks = document.querySelector('.nav-links');    // Get baseurl from a meta tag or data attribute
    const baseurl = document.documentElement.getAttribute('data-baseurl') || '';
    
    // Helper to determine environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isNetlify = !window.location.hostname.includes('github.io') && !isLocalhost;
    
    // Build proper asset paths for all environments
    function getAssetPath(path) {
        // Make sure path starts with /
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return isNetlify ? normalizedPath : `${baseurl}${normalizedPath}`;
    }    // Set current year in footer
    currentYearElement.textContent = new Date().getFullYear();    // Load display configuration
    async function loadDisplayConfig() {
        try {
            const response = await fetch(getAssetPath('/assets/js/display-config-data.json'));
            if (!response.ok) {
                throw new Error('Display config not found, using defaults');
            }
            displayConfig = await response.json();
            console.log('Loaded display config:', displayConfig); // Debug log
        } catch (error) {
            console.warn('Using default display configuration:', error.message);
            // Default configuration
            displayConfig = {
                upcomingRelease: {
                    show: true,
                    mode: 'nextUp',
                    manualReleaseCode: null
                },
                featuredRelease: {
                    mode: 'mostRecent',
                    manualReleaseCode: null
                }
            };
        }
    }

    // Load releases data
    async function loadReleasesData() {
        try {            // Use baseurl for compatibility with GitHub Pages and local builds
            const response = await fetch(getAssetPath('/assets/js/releases-data.json'));
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const rawReleases = await response.json();            // Map release_info.json structure to expected fields
            releases = rawReleases.map(r => ({
                id: r.release_code.en,
                title_en: r.title.en,
                title_cy: r.title.cy || r.title.en,
                artist: r.artists.en,                artwork_url: r.artwork_url || '',                // Update to use new Jekyll path pattern
                artwork_small_url: r.artwork_small_url || getAssetPath(`/assets/images/releases/small/${r.release_code.en}_small.jpg`),
                bandcampEmbedUrl: r.bandcampEmbedUrl || '',
                buyUrl: (r.link && r.link.en) || '',
                description_en: r.description.en,
                description_cy: r.description.cy || r.description.en,
                detailed_description_en: r.detailed_description ? r.detailed_description.en : null,
                detailed_description_cy: r.detailed_description ? (r.detailed_description.cy || r.detailed_description.en) : null,
                release_date_en: r.release_date.en,
                release_date_cy: r.release_date.cy || r.release_date.en            }));displayUpcomingRelease(); // Show upcoming release if any
            displayFeaturedRelease(); // Show hero featured
            displayMiniReleases(); // Show mini releases on home page
            displayReleases();
            checkUrlFragment();
        } catch (error) {
            console.error('Error loading releases:', error);
            releasesGrid.innerHTML = '<p class="error">Failed to load releases. Please try again later.</p>';
        }
    }    // Parse release date string to Date object
    function parseReleaseDate(releaseDateStr) {
        if (!releaseDateStr) return null;
        
        // Handle "Month Day, Year" format (e.g., "June 6, 2025")
        const fullDateMatch = releaseDateStr.match(/^([A-Z][a-z]+)\s+(\d+),\s+(\d{4})$/);
        if (fullDateMatch) {
            const [, month, day, year] = fullDateMatch;
            return new Date(`${month} ${day}, ${year}`);
        }
        
        // Handle "Month Year" format (e.g., "November 2021") - assume first day of month
        const monthYearMatch = releaseDateStr.match(/^([A-Z][a-z]+)\s+(\d{4})$/);
        if (monthYearMatch) {
            const [, month, year] = monthYearMatch;
            return new Date(`${month} 1, ${year}`);
        }
        
        return null;
    }    // Find the most recent release with a release date in the past
    function getMostRecentPastRelease() {
        const now = new Date();
        const pastReleases = releases.filter(release => {
            const releaseDate = parseReleaseDate(release.release_date_en);
            return releaseDate && releaseDate <= now;
        });
        
        if (pastReleases.length === 0) {
            // If no past releases, fall back to first release in array
            return releases[0];
        }
        
        // Sort by release date descending and return the most recent
        pastReleases.sort((a, b) => {
            const dateA = parseReleaseDate(a.release_date_en);
            const dateB = parseReleaseDate(b.release_date_en);
            return dateB - dateA;
        });
        
        return pastReleases[0];
    }

    // Find the earliest future release
    function getEarliestFutureRelease() {
        const now = new Date();
        const futureReleases = releases.filter(release => {
            const releaseDate = parseReleaseDate(release.release_date_en);
            return releaseDate && releaseDate > now;
        });
        
        if (futureReleases.length === 0) {
            return null;
        }
        
        // Sort by release date ascending and return the earliest
        futureReleases.sort((a, b) => {
            const dateA = parseReleaseDate(a.release_date_en);
            const dateB = parseReleaseDate(b.release_date_en);
            return dateA - dateB;
        });
        
        return futureReleases[0];
    }    // Render the upcoming release panel
    function displayUpcomingRelease() {
        const upcomingContainer = document.getElementById('upcoming-release');
        const upcomingPanel = document.getElementById('upcoming-release-panel');
        
        if (!upcomingContainer || !upcomingPanel || !displayConfig) return;
        
        console.log('displayUpcomingRelease - config:', displayConfig.upcomingRelease); // Debug log
        
        // Check if upcoming release should be shown
        if (!displayConfig.upcomingRelease.show) {
            console.log('Hiding upcoming release panel'); // Debug log
            upcomingPanel.style.display = 'none';
            return;
        }
        
        let upcoming = null;
        
        // Try to get upcoming release based on configuration
        if (displayConfig.upcomingRelease.mode === 'manual') {
            // Try manual release first
            const manualCode = displayConfig.upcomingRelease.manualReleaseCode;
            if (manualCode) {
                upcoming = releases.find(r => r.id === manualCode);
            }
            // If manual release not found, fall back to next upcoming
            if (!upcoming) {
                upcoming = getEarliestFutureRelease();
            }
        } else {
            // nextUp mode - show earliest future release
            upcoming = getEarliestFutureRelease();
        }
        
        if (!upcoming) {
            // No upcoming release found - hide panel
            upcomingPanel.style.display = 'none';
            return;
        }
        
        // Show the panel
        upcomingPanel.style.display = 'flex';
        
        // Build upcoming release HTML
        upcomingContainer.innerHTML = `
            <div class="upcoming-top-section">
                <img src="${upcoming.artwork_url}" alt="${upcoming[`title_${currentLanguage}`]}" class="upcoming-artwork" loading="eager">
                <div class="upcoming-info">
                    <div class="upcoming-release-title-main">${upcoming[`title_${currentLanguage}`]}</div>
                    <div class="upcoming-artist prominent">${upcoming.artist}</div>
                    <div class="upcoming-release-date">${translations[currentLanguage]['upcoming.releaseDate']} ${upcoming[`release_date_${currentLanguage}`]}</div>
                    <div class="upcoming-description">${upcoming[`description_${currentLanguage}`]}</div>
                    <div class="upcoming-buttons">
                        ${upcoming.buyUrl ? `<a href="${upcoming.buyUrl}" class="upcoming-preorder-btn" target="_blank" rel="noopener noreferrer">${translations[currentLanguage]['upcoming.preorderButton']}</a>` : ''}
                    </div>
                </div>
            </div>
            ${upcoming[`detailed_description_${currentLanguage}`] ? `<div class="upcoming-detailed-description">${upcoming[`detailed_description_${currentLanguage}`].replace(/\n/g, '<br>')}</div>` : ''}
        `;
    }    // Render the hero featured release
    function displayFeaturedRelease(featuredId) {
        const featuredContainer = document.getElementById('featured-release');
        const featuredPanel = document.getElementById('featured-release-panel');
        if (!featuredContainer || !featuredPanel || !displayConfig) return;
        
        let featured = null;
        
        // Check if upcoming release is showing - if so, hide featured
        if (displayConfig.upcomingRelease.show) {
            const upcoming = displayConfig.upcomingRelease.mode === 'manual' && displayConfig.upcomingRelease.manualReleaseCode
                ? releases.find(r => r.id === displayConfig.upcomingRelease.manualReleaseCode)
                : getEarliestFutureRelease();
            
            if (upcoming) {
                featuredPanel.style.display = 'none';
                return;
            }
        }
        
        // Get featured release based on configuration
        if (displayConfig.featuredRelease.mode === 'manual') {
            // Show specific release
            const manualCode = displayConfig.featuredRelease.manualReleaseCode;
            if (manualCode) {
                featured = releases.find(r => r.id === manualCode);
            }
            // If manual release not found, fall back to most recent
            if (!featured) {
                featured = getMostRecentPastRelease();
            }
        } else {
            // mostRecent mode - show most recent past release
            featured = featuredId ? releases.find(r => r.id === featuredId) : getMostRecentPastRelease();
        }
        
        if (!featured) {
            featuredPanel.style.display = 'none';
            return;
        }
        
        // Show featured release panel
        featuredPanel.style.display = 'flex';
        
        // Build featured release HTML
        featuredContainer.innerHTML = `
            <div class="featured-top-section">
                <img src="${featured.artwork_url}" alt="${featured[`title_${currentLanguage}`]}" class="featured-artwork" loading="eager">
                <div class="featured-info">
                    <div class="featured-release-title-main">${featured[`title_${currentLanguage}`]}</div>
                    <div class="featured-artist prominent">${featured.artist}</div>
                    <div class="featured-description">${featured[`description_${currentLanguage}`]}</div>
                    <div class="featured-buttons">
                        <button class="featured-listen-btn" data-id="${featured.id}">${translations[currentLanguage]['releases.listenButton']}</button>
                        <a href="${featured.buyUrl}" class="featured-bandcamp-btn" target="_blank" rel="noopener noreferrer">${translations[currentLanguage]['releases.buyOn']}</a>
                    </div>
                </div>
            </div>
            ${featured[`detailed_description_${currentLanguage}`] ? `<div class="featured-detailed-description">${featured[`detailed_description_${currentLanguage}`].replace(/\n/g, '<br>')}</div>` : ''}
        `;
        
        // Listen button event
        featuredContainer.querySelector('.featured-listen-btn').addEventListener('click', (e) => {
            loadReleaseInPlayer(featured.id);
            document.querySelector('.player-bar').scrollIntoView({behavior: 'smooth'});
        });
    }// Display releases in the grid
    function displayReleases() {
        releasesGrid.innerHTML = '';
        
        releases.forEach(release => {
            // No longer skip featured release
            
            const releaseItem = document.createElement('div');
            releaseItem.className = 'release-item';
            releaseItem.id = release.id;
            releaseItem.setAttribute('tabindex', '0');
            
            if (release.id === currentReleaseId) {
                releaseItem.classList.add('active');
            }
              // Check if this is a future release
            const releaseDate = parseReleaseDate(release.release_date_en);
            const now = new Date();
            const isFutureRelease = releaseDate && releaseDate > now;
            
            // Add upcoming badge and different button layout for future releases
            let upcomingBadge = '';
            let buttonsHtml = '';
              if (isFutureRelease) {
                releaseItem.classList.add('upcoming-release');
                upcomingBadge = `<div class="upcoming-badge">${translations[currentLanguage]['upcoming.badge']}</div>`;
                buttonsHtml = `
                    <a href="${release.buyUrl}" class="preorder-btn" target="_blank" rel="noopener noreferrer">
                        ${translations[currentLanguage]['upcoming.preorderButton']}
                    </a>
                `;
            } else {
                buttonsHtml = `
                    <button class="listen-btn" data-id="${release.id}" aria-label="${translations[currentLanguage]['releases.listenButton']} ${release[`title_${currentLanguage}`]}">
                        ${translations[currentLanguage]['releases.listenButton']}
                    </button>
                    <a href="${release.buyUrl}" class="buy-link" target="_blank" rel="noopener noreferrer">
                        ${translations[currentLanguage]['releases.buyOn']}
                    </a>
                `;
            }
            
            releaseItem.innerHTML = `
                <img 
                    src="${release.artwork_small_url}" 
                    alt="${release[`title_${currentLanguage}`]}" 
                    class="release-image"
                    loading="lazy"
                >
                ${upcomingBadge}
                <div class="release-overlay">
                    <h3 class="release-title">${release[`title_${currentLanguage}`]}</h3>
                    <p class="release-artist">${release.artist}</p>
                    <div class="release-buttons">
                        ${buttonsHtml}
                    </div>
                </div>
            `;
            
            releasesGrid.appendChild(releaseItem);
        });        
        // Add event listeners to listen buttons (only for available releases)
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
                    // Only load in player if it's not an upcoming release
                    if (!item.classList.contains('upcoming-release')) {
                        const releaseId = item.id;
                        loadReleaseInPlayer(releaseId);
                    }
                    e.preventDefault();
                }
            });
        });    }

    // Display mini releases grid on home page (excluding upcoming and featured releases)
    function displayMiniReleases() {
        const miniReleasesGrid = document.getElementById('mini-releases-grid');
        if (!miniReleasesGrid) return;

        // Get current featured release ID to exclude it
        const upcomingRelease = getEarliestFutureRelease();
        let featuredReleaseId = null;
        
        if (!upcomingRelease) {
            // If no upcoming release, get the featured release
            const featured = getMostRecentPastRelease();
            featuredReleaseId = featured?.id;
        }

        // Filter releases: exclude upcoming releases and featured release
        const filteredReleases = releases.filter(release => {
            const releaseDate = parseReleaseDate(release.release_date_en);
            const now = new Date();
            const isFutureRelease = releaseDate && releaseDate > now;
            
            // Exclude future releases and the currently featured release
            return !isFutureRelease && release.id !== featuredReleaseId;
        });

        // Clear existing content
        miniReleasesGrid.innerHTML = '';

        // Show only first 6-8 releases to keep it manageable
        const displayReleases = filteredReleases.slice(0, 8);

        displayReleases.forEach(release => {
            const miniReleaseItem = document.createElement('div');
            miniReleaseItem.className = 'mini-release-item';
            miniReleaseItem.id = `mini-${release.id}`;
            miniReleaseItem.setAttribute('tabindex', '0');
            
            if (release.id === currentReleaseId) {
                miniReleaseItem.classList.add('active');
            }
            miniReleaseItem.innerHTML = `
                <img 
                    src="${release.artwork_small_url}" 
                    alt="${release[`title_${currentLanguage}`]}" 
                    class="mini-release-image"
                    loading="lazy"
                >
                <div class="mini-release-overlay">
                    <button class="mini-listen-btn" data-id="${release.id}" aria-label="${translations[currentLanguage]['releases.listenButton']} ${release[`title_${currentLanguage}`]}">
                        ${translations[currentLanguage]['releases.listenButton']}
                    </button>
                </div>
            `;
            
            miniReleasesGrid.appendChild(miniReleaseItem);
        });        // Add event listeners to mini listen buttons
        document.querySelectorAll('.mini-listen-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const releaseId = e.target.dataset.id;
                loadReleaseInPlayer(releaseId);
                e.stopPropagation();
            });
        });

        // Add keyboard support for mini release items
        document.querySelectorAll('.mini-release-item').forEach(item => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const releaseId = item.id.replace('mini-', '');
                    loadReleaseInPlayer(releaseId);
                    e.preventDefault();
                }
            });

            // Click handler for the item itself (will play music when clicking on image)
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('mini-listen-btn')) {
                    const releaseId = item.id.replace('mini-', '');
                    loadReleaseInPlayer(releaseId);
                }
            });
        });
    }

    // Load a release in the Bandcamp player
    function loadReleaseInPlayer(releaseId) {
        // If cookie consent not given, show consent dialog first
        if (!window.bandcampConsent) {
            showBandcampConsentDialog(releaseId);
            return;
        }
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
            const previousMiniItem = document.getElementById(`mini-${currentReleaseId}`);
            if (previousMiniItem) previousMiniItem.classList.remove('active');
        }
        
        const currentItem = document.getElementById(releaseId);
        if (currentItem) currentItem.classList.add('active');
        const currentMiniItem = document.getElementById(`mini-${releaseId}`);
        if (currentMiniItem) currentMiniItem.classList.add('active');
        
        // Update state
        currentReleaseId = releaseId;
        
        // Remove hash update here so it doesn't change URL
        // history.replaceState(null, null, `#${releaseId}`);
    }

    // Show Bandcamp cookie consent dialog
    function showBandcampConsentDialog(releaseId) {
        // Prevent multiple dialogs
        if (document.getElementById('bandcamp-consent-dialog')) return;
        if (playerBar) {
            playerBar.classList.add('visible');
            document.body.classList.add('player-bar-visible');
            bandcampPlayer.style.display = 'none';
            const prevDialog = playerBar.querySelector('#bandcamp-consent-dialog');
            if (prevDialog) prevDialog.remove();
            const dialog = document.createElement('div');
            dialog.id = 'bandcamp-consent-dialog';
            dialog.className = 'bandcamp-consent-dialog-inline';
            // Add privacy link to the dialog text (no extra text, no full stop)
            const privacyLink = `<a href="#privacy" class="bandcamp-privacy-link" tabindex="0">${translations[currentLanguage]['bandcamp.privacyLink'] || 'Privacy Policy'}</a>`;
            dialog.innerHTML = `
                <div class="bandcamp-consent-content">
                    <p><span class="bandcamp-cookie-text">${translations[currentLanguage]['bandcamp.cookies'] || 'The Bandcamp player uses cookies'}</span> ${privacyLink}</p>
                    <div class="bandcamp-consent-buttons">
                        <button class="bandcamp-accept-btn">${translations[currentLanguage]['bandcamp.accept'] || 'Accept'}</button>
                        <button class="bandcamp-decline-btn">${translations[currentLanguage]['bandcamp.decline'] || 'Decline'}</button>
                    </div>
                </div>
            `;
            playerBar.querySelector('.player-wrapper').appendChild(dialog);
            dialog.querySelector('.bandcamp-accept-btn').focus();
            // Accept
            dialog.querySelector('.bandcamp-accept-btn').addEventListener('click', () => {
                window.bandcampConsent = true;
                dialog.remove();
                bandcampPlayer.style.display = '';
                loadReleaseInPlayer(releaseId);
            });
            // Decline
            dialog.querySelector('.bandcamp-decline-btn').addEventListener('click', () => {
                window.bandcampConsent = false;
                dialog.remove();
                bandcampPlayer.style.display = '';
                playerBar.classList.remove('visible');
                document.body.classList.remove('player-bar-visible');
                bandcampPlayer.src = '';
                currentReleaseId = null;
            });
            // Privacy link click handler
            dialog.querySelector('.bandcamp-privacy-link').addEventListener('click', (e) => {
                e.preventDefault();
                showTab('privacy');
                history.replaceState(null, null, '#privacy');
            });
        }
    }

    // Update consent dialog text on language switch
    function updateConsentDialogLanguage() {
        const dialog = document.getElementById('bandcamp-consent-dialog');
        if (dialog) {
            const privacyLink = `<a href=\"#privacy\" class=\"bandcamp-privacy-link\" tabindex=\"0\">${translations[currentLanguage]['bandcamp.privacyLink'] || 'Privacy Policy'}</a>`;
            dialog.querySelector('.bandcamp-cookie-text').innerHTML = translations[currentLanguage]['bandcamp.cookies'] || 'The Bandcamp player uses cookies';
            dialog.querySelector('.bandcamp-privacy-link').outerHTML = privacyLink;
        }
    }

    function updateArtistBioLanguage() {
        document.querySelectorAll('.bio-text').forEach(el => {
            el.style.display = el.dataset.lang === currentLanguage ? 'block' : 'none';
        });
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
        
        // Update only text content for releases and featured release
        updateReleaseTexts();
        
        // Update consent dialog if open
        updateConsentDialogLanguage();

        // Update artist bio if open
        updateArtistBioLanguage();
        
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
        // Hero section translations
        const heroHeading = document.querySelector('.hero-heading');
        if (heroHeading) heroHeading.textContent = translations[currentLanguage]['hero.heading'];
        const heroTagline = document.querySelector('.hero-tagline');
        if (heroTagline) heroTagline.textContent = translations[currentLanguage]['hero.tagline'];
        const heroCta = document.querySelector('.hero-cta-btn');
        if (heroCta) heroCta.textContent = translations[currentLanguage]['hero.cta'];
        // Featured release title
        const featuredTitle = document.querySelector('.featured-release-title');
        if (featuredTitle) featuredTitle.textContent = translations[currentLanguage]['hero.featured'];
    }    // Update only text content for releases and featured release when switching language
    function updateReleaseTexts() {
        // Update upcoming release texts
        const upcomingContainer = document.getElementById('upcoming-release');
        if (upcomingContainer) {
            const upcoming = getEarliestFutureRelease();
            if (upcoming) {
                // Update upcoming release text fields only
                const titleMain = upcomingContainer.querySelector('.upcoming-release-title-main');
                if (titleMain) titleMain.textContent = upcoming[`title_${currentLanguage}`];
                const artist = upcomingContainer.querySelector('.upcoming-artist.prominent');
                if (artist) artist.textContent = upcoming.artist;                const desc = upcomingContainer.querySelector('.upcoming-description');
                if (desc) desc.textContent = upcoming[`description_${currentLanguage}`];
                const detailedDesc = upcomingContainer.querySelector('.upcoming-detailed-description');
                if (detailedDesc && upcoming[`detailed_description_${currentLanguage}`]) {
                    detailedDesc.innerHTML = upcoming[`detailed_description_${currentLanguage}`].replace(/\n/g, '<br>');
                }
                const releaseDate = upcomingContainer.querySelector('.upcoming-release-date');
                if (releaseDate) releaseDate.textContent = `${translations[currentLanguage]['upcoming.releaseDate']} ${upcoming[`release_date_${currentLanguage}`]}`;
                const preorderBtn = upcomingContainer.querySelector('.upcoming-preorder-btn');
                if (preorderBtn) preorderBtn.textContent = translations[currentLanguage]['upcoming.preorderButton'];
            }
        }
        
        // Update featured release texts
        const featuredContainer = document.getElementById('featured-release');
        if (featuredContainer) {
            const featured = releases.find(r => r.id === (featuredReleaseId || getMostRecentPastRelease()?.id));
            if (featured) {
                // Update featured release text fields only
                const titleMain = featuredContainer.querySelector('.featured-release-title-main');
                if (titleMain) titleMain.textContent = featured[`title_${currentLanguage}`];
                const artist = featuredContainer.querySelector('.featured-artist.prominent');
                if (artist) artist.textContent = featured.artist;                const desc = featuredContainer.querySelector('.featured-description');
                if (desc) desc.textContent = featured[`description_${currentLanguage}`];
                const detailedDesc = featuredContainer.querySelector('.featured-detailed-description');
                if (detailedDesc && featured[`detailed_description_${currentLanguage}`]) {
                    detailedDesc.innerHTML = featured[`detailed_description_${currentLanguage}`].replace(/\n/g, '<br>');
                }
                const listenBtn = featuredContainer.querySelector('.featured-listen-btn');
                if (listenBtn) listenBtn.textContent = translations[currentLanguage]['releases.listenButton'];
                const buyBtn = featuredContainer.querySelector('.featured-bandcamp-btn');
                if (buyBtn) buyBtn.textContent = translations[currentLanguage]['releases.buyOn'];
            }
        }        // Update releases grid texts
        document.querySelectorAll('.release-item').forEach(item => {
            const release = releases.find(r => r.id === item.id);
            if (!release) return;
            const title = item.querySelector('.release-title');
            if (title) title.textContent = release[`title_${currentLanguage}`];
            const artist = item.querySelector('.release-artist');
            if (artist) artist.textContent = release.artist;            const listenBtn = item.querySelector('.listen-btn');
            if (listenBtn) listenBtn.textContent = translations[currentLanguage]['releases.listenButton'];
            const buyBtn = item.querySelector('.buy-link');
            if (buyBtn) buyBtn.textContent = translations[currentLanguage]['releases.buyOn'];
            const preorderBtn = item.querySelector('.preorder-btn');
            if (preorderBtn) preorderBtn.textContent = translations[currentLanguage]['upcoming.preorderButton'];
            const upcomingBadge = item.querySelector('.upcoming-badge');
            if (upcomingBadge) upcomingBadge.textContent = translations[currentLanguage]['upcoming.badge'];            // Update alt attribute for image
            const img = item.querySelector('.release-image');
            if (img) img.alt = release[`title_${currentLanguage}`];
        });

        // Update mini releases grid texts
        document.querySelectorAll('.mini-release-item').forEach(item => {
            const releaseId = item.id.replace('mini-', '');
            const release = releases.find(r => r.id === releaseId);
            if (!release) return;
            
            const title = item.querySelector('.mini-release-title');
            if (title) title.textContent = release[`title_${currentLanguage}`];
            
            const artist = item.querySelector('.mini-release-artist');
            if (artist) artist.textContent = release.artist;
            
            const listenBtn = item.querySelector('.mini-listen-btn');
            if (listenBtn) {
                listenBtn.textContent = translations[currentLanguage]['releases.listenButton'];
                listenBtn.setAttribute('aria-label', `${translations[currentLanguage]['releases.listenButton']} ${release[`title_${currentLanguage}`]}`);
            }
            
            // Update alt attribute for image
            const img = item.querySelector('.mini-release-image');
            if (img) img.alt = release[`title_${currentLanguage}`];
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

    // Overlay for mobile nav
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

    // Toggle nav links on mobile
    mobileNavToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileNavToggle.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            mobileNavOverlay.classList.add('active');
        } else {
            mobileNavOverlay.classList.remove('active');
        }
    });

    // Close nav and overlay on overlay click
    mobileNavOverlay.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileNavToggle.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
    });

    // Close nav on link click (for better UX)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                mobileNavToggle.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
            }
        });
    });

    // Tab switching logic
    const tabSections = document.querySelectorAll('.tab-content');
    const navTabLinks = document.querySelectorAll('.nav-links a');    function showTab(tabId) {
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
        
        // Clear all release selections when switching tabs
        clearAllReleaseSelections();
        
        // Instantly scroll to top when switching tabs
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    // Clear all release selections (remove active states and hide overlays)
    function clearAllReleaseSelections() {
        // Clear main release selections
        document.querySelectorAll('.release-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        // Clear mini release selections
        document.querySelectorAll('.mini-release-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        // Reset current release ID
        currentReleaseId = null;
    }

    // Add document-level click handler to clear selections when clicking outside releases
    document.addEventListener('click', (e) => {
        // Check if click is outside any release item or its children
        const isReleaseClick = e.target.closest('.release-item') || 
                              e.target.closest('.mini-release-item') || 
                              e.target.closest('.player-bar') ||
                              e.target.closest('.featured-listen-btn') ||
                              e.target.closest('.upcoming-preorder-btn');
        
        // If click is outside all release-related elements, clear selections
        if (!isReleaseClick && currentReleaseId) {
            clearAllReleaseSelections();
        }
    });

    // Intercept nav link clicks for tab switching
    // Intercept nav link clicks for tab switching
    navTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Ignore links without hashes or marked as no-tab
            if (!href || !href.includes('#') || link.hasAttribute('data-no-tab')) return;

            const [path, hash] = href.split('#');

            // If not on index.html, redirect to it with the correct hash
            const isIndex = window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/wepn/') || window.location.pathname.endsWith('/wepn');
            if (!isIndex) {
                e.preventDefault();
                window.location.href = `${baseurl}/#${hash}`;
                return;
            }

            // If already on index.html, handle tab switch
            e.preventDefault();
            showTab(hash);
            history.replaceState(null, null, `#${hash}`);
        });
    });

    // Add logo click handler to switch to home tab
    const logoLink = document.querySelector('.logo a');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = 'home';
            showTab(tabId);
            history.replaceState(null, null, `#${tabId}`);
        });
    }

    // On page load, show tab from hash or default
    function initTabs() {
        let initialTab = window.location.hash.replace('#', '') || 'home';
        if (![...tabSections].some(s => s.id === initialTab)) {
            initialTab = 'home';
        }
        // Redirect old #releases hash to #music for backward compatibility
        if (initialTab === 'releases') {
            initialTab = 'music';
            history.replaceState(null, null, '#music');
        }
        showTab(initialTab);
    }

    // Hero CTA button tab switch
    const heroCtaBtn = document.querySelector('.hero-cta-btn');
    if (heroCtaBtn) {
        heroCtaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showTab('music');
            history.replaceState(null, null, '#music');
        });
    }

    // Mini releases title link handler for tab switching
    const miniReleasesTitle = document.querySelector('.mini-releases-title a');
    if (miniReleasesTitle) {
        miniReleasesTitle.addEventListener('click', function(e) {
            e.preventDefault();
            showTab('music');
            history.replaceState(null, null, '#music');
        });
    }

    // Close player bar logic
    const closePlayerBtn = document.querySelector('.close-player-bar');
    if (closePlayerBtn) {
        closePlayerBtn.addEventListener('click', () => {
            playerBar.classList.remove('visible');
            document.body.classList.remove('player-bar-visible');
            // Optionally pause/clear the player
            bandcampPlayer.src = '';
            currentReleaseId = null;
        });
    }

    // Footer privacy link tab switch
    const footerPrivacyLink = document.querySelector('.footer-privacy-link');
    if (footerPrivacyLink) {
        footerPrivacyLink.addEventListener('click', function(e) {
            e.preventDefault();
            showTab('privacy');
            history.replaceState(null, null, '#privacy');
        });
    }

    // Initialize the application
    function init() {
        // Always run setup first
        setupLanguageToggle();

        // Detect browser language
        const browserLang = navigator.language.substring(0, 2);
        const preferredLang = (browserLang === 'cy') ? 'cy' : 'en';

        // Set language (this updates UI and internal state)
        switchLanguage(preferredLang);

        // Load config and releases if present (safe for /artists too)
        loadDisplayConfig()
            .then(loadReleasesData)
            .catch(loadReleasesData);

        // Only init tabs if we’re on the homepage (tabs exist)
        if (document.querySelectorAll('.tab-content').length) {
            initTabs();
        }

        // Hide player bar on load
        playerBar.classList.remove('visible');
        document.body.classList.remove('player-bar-visible');
    }

    // Start the application
    init();
});
