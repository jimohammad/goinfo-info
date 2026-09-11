/**
 * AdmissionEU — Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initStickyHeader();
    initScrollReveal();
    initDropdowns();
    initSearchAutocomplete();
});

/* ── Mobile Navigation ─────────────────────────────────────── */
function initMobileNav() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function openNav() {
        nav.classList.add('open');
        toggle.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
        nav.classList.contains('open') ? closeNav() : openNav();
    });

    overlay.addEventListener('click', closeNav);

    // Close on link click
    nav.querySelectorAll('a:not(.dropdown-trigger)').forEach(link => {
        link.addEventListener('click', closeNav);
    });
}

/* ── Sticky Header Shadow ──────────────────────────────────── */
function initStickyHeader() {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        header.classList.toggle('scrolled', scrollY > 10);
        lastScroll = scrollY;
    }, { passive: true });
}

/* ── Scroll Reveal ─────────────────────────────────────────── */
function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger animation
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

/* ── Dropdowns ─────────────────────────────────────────────── */
function initDropdowns() {
    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = trigger.closest('.nav-dropdown');
            parent.classList.toggle('open');
        });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
        }
    });
}

/* ── Search Autocomplete ───────────────────────────────────── */
function initSearchAutocomplete() {
    const searchInput = document.getElementById('heroSearch');
    if (!searchInput) return;

    let debounceTimer;
    let resultsContainer = searchInput.closest('.hero-search')?.querySelector('.search-results');

    // Create results container if it doesn't exist
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        resultsContainer.style.cssText = `
            position: absolute; top: 100%; left: 0; right: 0; 
            background: #fff; border-radius: 0 0 10px 10px; 
            box-shadow: 0 8px 32px rgba(27,79,114,0.12); 
            max-height: 300px; overflow-y: auto; z-index: 50; display: none;
        `;
        searchInput.closest('.hero-search').style.position = 'relative';
        searchInput.closest('.hero-search').appendChild(resultsContainer);
    }

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();

        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchSearchResults(query, resultsContainer);
        }, 300);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hero-search')) {
            resultsContainer.style.display = 'none';
        }
    });
}

async function fetchSearchResults(query, container) {
    try {
        const response = await fetch(`api/search.php?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            container.innerHTML = '<div style="padding: 1rem; color: #9B9687; font-size: 0.9rem;">No results found</div>';
            container.style.display = 'block';
            return;
        }

        container.innerHTML = data.results.map(item => `
            <a href="${item.url}" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.15rem; text-decoration: none; color: #2D2B26; font-size: 0.9rem; border-bottom: 1px solid #F0EDE6; transition: background 0.15s;">
                <span style="font-size: 1.3rem;">${item.icon || '🏛️'}</span>
                <div>
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="font-size: 0.78rem; color: #9B9687;">${item.subtitle || ''}</div>
                </div>
            </a>
        `).join('');
        container.style.display = 'block';

        // Add hover effect
        container.querySelectorAll('a').forEach(a => {
            a.addEventListener('mouseenter', () => a.style.background = '#FAF8F2');
            a.addEventListener('mouseleave', () => a.style.background = 'transparent');
        });
    } catch (err) {
        console.error('Search error:', err);
    }
}

/* ── Hero Search Form Submit ───────────────────────────────── */
function submitHeroSearch() {
    const input = document.getElementById('heroSearch');
    if (input && input.value.trim()) {
        window.location.href = `pages/universities.php?search=${encodeURIComponent(input.value.trim())}`;
    }
}

/* ── Counter Animation ─────────────────────────────────────── */
function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        const duration = 1500;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = target.toLocaleString() + (el.dataset.suffix || '');
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '');
            }
        }, 16);
    });
}
