/**
 * Photography Portfolio - Main JavaScript
 * Handles scroll animations, lightbox, and interactions
 */

(function() {
    'use strict';

    // ========================
    // Scroll-triggered Animations
    // ========================

    const initScrollAnimations = () => {
        const sections = document.querySelectorAll('.collection-section');

        if (!sections.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    };

    // ========================
    // Theme Toggle (Dark/Light Mode)
    // ========================

    let updateHeaderCallback = null;

    const initThemeToggle = () => {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Check for saved theme preference or default to dark
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');

            // Save preference
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            // Immediately update header colors
            if (updateHeaderCallback) {
                updateHeaderCallback();
            }
        });
    };

    // ========================
    // Mobile Menu Toggle
    // ========================

    const initMobileMenu = () => {
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        const navOverlay = document.getElementById('navOverlay');

        if (!menuToggle || !navLinks) return;

        const openMenu = () => {
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
            navLinks.classList.add('open');
            if (navOverlay) navOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        };

        const closeMenu = () => {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('open');
            if (navOverlay) navOverlay.classList.remove('visible');
            document.body.style.overflow = '';
        };

        const toggleMenu = () => {
            if (navLinks.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        menuToggle.addEventListener('click', toggleMenu);

        if (navOverlay) {
            navOverlay.addEventListener('click', closeMenu);
        }

        // Close menu on nav link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                closeMenu();
            }
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
                closeMenu();
            }
        });
    };

    // ========================
    // Header Scroll Behavior
    // ========================

    const initHeaderScroll = () => {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastScroll = 0;
        let ticking = false;

        const updateHeader = () => {
            const scrollY = window.scrollY;
            const isLight = document.body.classList.contains('light-mode');
            const bgColor = isLight ? 'rgba(248, 248, 248, 0.95)' : 'rgba(10, 10, 10, 0.95)';
            const gradientBg = isLight
                ? 'linear-gradient(to bottom, rgba(248, 248, 248, 0.95), transparent)'
                : 'linear-gradient(to bottom, rgba(10, 10, 10, 0.95), transparent)';

            if (scrollY > 100) {
                header.style.background = bgColor;
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = gradientBg;
                header.style.backdropFilter = 'none';
            }

            lastScroll = scrollY;
            ticking = false;
        };

        // Store callback for theme toggle to use
        updateHeaderCallback = updateHeader;

        // Initial call to set correct colors on page load
        updateHeader();

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    };

    // ========================
    // Lightbox
    // ========================

    const initLightbox = () => {
        const lightbox = document.getElementById('lightbox');
        const galleryItems = document.querySelectorAll('.gallery-item');

        if (!lightbox || !galleryItems.length) return;

        const lightboxImage = lightbox.querySelector('.lightbox-image');
        const lightboxTitle = lightbox.querySelector('.lightbox-title');
        const lightboxLocation = lightbox.querySelector('.lightbox-location');
        const lightboxCounter = lightbox.querySelector('.lightbox-counter');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        let currentIndex = 0;
        const totalImages = galleryItems.length;

        const openLightbox = (index) => {
            currentIndex = index;
            updateLightboxContent();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        const updateLightboxContent = () => {
            const item = galleryItems[currentIndex];
            const img = item.querySelector('img');
            const title = item.querySelector('.photo-title');
            const location = item.querySelector('.photo-location');

            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
            lightboxTitle.textContent = title ? title.textContent : '';
            lightboxLocation.textContent = location ? location.textContent : '';
            lightboxCounter.textContent = `${currentIndex + 1} / ${totalImages}`;
        };

        const showPrev = () => {
            currentIndex = (currentIndex - 1 + totalImages) % totalImages;
            updateLightboxContent();
        };

        const showNext = () => {
            currentIndex = (currentIndex + 1) % totalImages;
            updateLightboxContent();
        };

        // Event Listeners
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(index));
        });

        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);

        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    showPrev();
                    break;
                case 'ArrowRight':
                    showNext();
                    break;
            }
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const threshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    showNext();
                } else {
                    showPrev();
                }
            }
        };
    };

    // ========================
    // Smooth Scroll for Anchor Links
    // ========================

    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    };

    // ========================
    // Image Lazy Loading
    // ========================

    const initLazyLoad = () => {
        const images = document.querySelectorAll('img[data-src]');

        if (!images.length) return;

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        images.forEach(img => imageObserver.observe(img));
    };

    // ========================
    // Parallax Effect for Hero
    // ========================

    const initParallax = () => {
        const heroImage = document.querySelector('.hero-image img');
        if (!heroImage) return;

        let ticking = false;

        const updateParallax = () => {
            const scrollY = window.scrollY;
            const speed = 0.3;

            if (scrollY < window.innerHeight) {
                heroImage.style.transform = `translateY(${scrollY * speed}px)`;
            }

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    };

    // ========================
    // Collection Image Hover Effect
    // ========================

    const initImageHoverEffects = () => {
        const collectionImages = document.querySelectorAll('.collection-image');

        collectionImages.forEach(container => {
            const img = container.querySelector('img');
            if (!img) return;

            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                img.style.transform = `scale(1.03) translate(${x * -10}px, ${y * -10}px)`;
            });

            container.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1) translate(0, 0)';
            });
        });
    };

    // ========================
    // Page Transition Animation
    // ========================

    const initPageTransitions = () => {
        // Fade in on page load
        document.body.style.opacity = '0';

        window.addEventListener('load', () => {
            document.body.style.transition = 'opacity 0.6s ease';
            document.body.style.opacity = '1';
        });

        // Fade out on navigation
        document.querySelectorAll('a:not([target="_blank"])').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip for anchor links, javascript:, and mailto:
                if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
                    return;
                }

                e.preventDefault();
                document.body.style.opacity = '0';

                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        });
    };

    // ========================
    // Scroll Progress Indicator (optional)
    // ========================

    const initScrollProgress = () => {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 2px;
            background: linear-gradient(90deg, #888, #fff);
            z-index: 9999;
            transition: width 0.1s ease-out;
        `;

        // Only add to blog posts
        if (!document.querySelector('.blog-post-page')) return;

        document.body.appendChild(progressBar);

        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${progress}%`;
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
    };

    // ========================
    // Initialize Everything
    // ========================

    const init = () => {
        initThemeToggle();
        initMobileMenu();
        initScrollAnimations();
        initHeaderScroll();
        initLightbox();
        initSmoothScroll();
        initLazyLoad();
        initParallax();
        initImageHoverEffects();
        initPageTransitions();
        initScrollProgress();
    };

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
