/* ════════════════════════════════════════════════════════════════════════════════
   PREMIUM CINEMATIC MOTION SYSTEM - JAVASCRIPT
   Handles scroll reveals, parallax, and interactive animations
   ════════════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── CONFIGURATION ──────────────────────────────────────────────────────────────
  const MOTION_CONFIG = {
    scrollReveal: {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    },
    parallax: {
      intensity: 0.5, // 0-1, lower = more subtle
    },
    performance: {
      throttleDelay: 16, // ~60fps
    },
  };

  // ── SCROLL REVEAL INTERSECTION OBSERVER ─────────────────────────────────────── */
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add revealed class with a small delay for smooth effect
          requestAnimationFrame(() => {
            entry.target.classList.add('revealed');
          });
          // Stop observing once revealed (performance optimization)
          observer.unobserve(entry.target);
        }
      });
    }, MOTION_CONFIG.scrollReveal);

    // Observe all scroll reveal elements
    const scrollElements = document.querySelectorAll(
      '[data-scroll-reveal], [data-scroll-stagger], section'
    );
    scrollElements.forEach((el) => observer.observe(el));
  }

  // ── PARALLAX SCROLL EFFECT ────────────────────────────────────────────────────── */
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    let ticking = false;
    let lastScrollY = 0;

    function updateParallax() {
      parallaxElements.forEach((container) => {
        const img = container.querySelector('img, video');
        if (!img) return;

        // Get element's position relative to viewport
        const rect = container.getBoundingClientRect();
        const elementY = rect.top;
        const windowHeight = window.innerHeight;

        // Only update if element is in viewport
        if (elementY < windowHeight && elementY + rect.height > 0) {
          // Calculate parallax offset (subtle movement)
          const offset = (elementY / windowHeight) * MOTION_CONFIG.parallax.intensity * 30;
          img.style.transform = `translateY(${offset}px)`;
        }
      });
      ticking = false;
    }

    function onScroll() {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    // Throttle scroll events for performance
    let lastTime = 0;
    window.addEventListener('scroll', () => {
      const now = Date.now();
      if (now - lastTime >= MOTION_CONFIG.performance.throttleDelay) {
        onScroll();
        lastTime = now;
      }
    }, { passive: true });

    // Initial update
    updateParallax();
  }

  // ── HERO VIDEO PARALLAX ────────────────────────────────────────────────────────── */
  function initHeroParallax() {
    const heroVideo = document.querySelector('.hero-video');
    if (!heroVideo) return;

    let ticking = false;

    function updateHeroParallax() {
      const scrollY = window.scrollY;
      const parallaxOffset = scrollY * MOTION_CONFIG.parallax.intensity * 0.3;
      heroVideo.style.transform = `translateY(${parallaxOffset}px)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeroParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ── SMOOTH SCROLL ANCHOR LINKS ────────────────────────────────────────────────── */
  function initSmoothScrollAnchors() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // Update URL without page jump
        window.history.pushState(null, null, href);
      });
    });
  }

  // ── CARD HOVER ELEVATION ───────────────────────────────────────────────────────– */
  function initCardHovers() {
    const cards = document.querySelectorAll(
      '.destination-card, .experience-card, .activity-card, [class*="card"]'
    );

    cards.forEach((card) => {
      // Skip if already has hover handler
      if (card.dataset.hoverInit) return;
      card.dataset.hoverInit = 'true';

      // Add shadow classes on hover for enhanced effect
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
    });
  }

  // ── BUTTON RIPPLE EFFECT (OPTIONAL ENHANCEMENT) ────────────────────────────────– */
  function initButtonRipple() {
    const buttons = document.querySelectorAll('button, .btn, [role="button"]');

    buttons.forEach((button) => {
      if (button.dataset.rippleInit) return;
      button.dataset.rippleInit = 'true';

      button.addEventListener('click', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create ripple element
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.pointerEvents = 'none';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'rippleExpand 0.6s ease-out';

        // Ensure button has relative positioning
        if (getComputedStyle(button).position === 'static') {
          button.style.position = 'relative';
          button.style.overflow = 'hidden';
        }

        button.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ── SCROLL PROGRESS INDICATOR ──────────────────────────────────────────────────– */
  function initScrollProgress() {
    const progressBar = document.querySelector('[data-scroll-progress]');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      progressBar.style.width = `${scrolled}%`;
      progressBar.style.transition = 'width 0.1s ease';
    }, { passive: true });
  }

  // ── CHARACTER-BY-CHARACTER TEXT ANIMATION ──────────────────────────────────────– */
  function initCharAnimation() {
    const charElements = document.querySelectorAll('[data-char-animate]');

    charElements.forEach((element) => {
      if (element.dataset.charAnimated) return;
      element.dataset.charAnimated = 'true';

      const text = element.textContent;
      element.innerHTML = '';

      // Split text into characters and wrap in spans
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.animationDelay = `${index * 0.05}s`;
        element.appendChild(span);
      });
    });
  }

  // ── FLOATING ELEMENT ANIMATION ────────────────────────────────────────────────– */
  function initFloatingElements() {
    const floatingElements = document.querySelectorAll('[data-float], [data-float-slow]');

    floatingElements.forEach((el, index) => {
      // Add slight random delay to prevent synchronized movement
      const delay = (index % 4) * 0.5;
      el.style.animationDelay = `${delay}s`;
    });
  }

  // ── RESPONSIVE PARALLAX TOGGLE ────────────────────────────────────────────────– */
  function updateMotionForDevice() {
    // Disable parallax on mobile for better performance
    if (window.innerWidth < 768) {
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const img = el.querySelector('img, video');
        if (img) img.style.transform = 'none';
      });
      return;
    }

    // Re-enable parallax on larger screens
    initParallax();
  }

  // ── SCROLL REVEAL WITH STAGGER ────────────────────────────────────────────────– */
  function initAdvancedScrollStagger() {
    const staggerContainers = document.querySelectorAll('[data-scroll-stagger]');

    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Trigger all children to animate
          entry.target.classList.add('revealed');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    });

    staggerContainers.forEach((container) => {
      staggerObserver.observe(container);
    });
  }

  // ── INTERSECTION OBSERVER FOR GRADIENT ANIMATIONS ───────────────────────────── */
  function initGradientAnimations() {
    const gradientElements = document.querySelectorAll('[data-gradient-animate]');
    
    const gradientObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        } else {
          entry.target.style.animationPlayState = 'paused';
        }
      });
    }, { threshold: 0.1 });

    gradientElements.forEach((el) => {
      gradientObserver.observe(el);
    });
  }

  // ── REDUCED MOTION SUPPORT ────────────────────────────────────────────────────– */
  function checkReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = 'auto';
      // Could add more adjustments for users with motion sensitivity
    }
  }

  // ── MAIN INITIALIZATION ────────────────────────────────────────────────────────– */
  function init() {
    // Check for reduced motion preference
    checkReducedMotion();

    // Initialize all motion features
    initScrollReveal();
    initAdvancedScrollStagger();
    initParallax();
    initHeroParallax();
    initSmoothScrollAnchors();
    initCardHovers();
    initButtonRipple();
    initScrollProgress();
    initCharAnimation();
    initFloatingElements();
    initGradientAnimations();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateMotionForDevice();
      }, 250);
    });

    // Initial device check
    updateMotionForDevice();

    console.log('✨ Premium Motion System Initialized');
  }

  // ── DOM READY CHECK ────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── DYNAMIC ELEMENT SUPPORT ────────────────────────────────────────────────── */
  // Re-initialize motion for dynamically added elements
  const observer = new MutationObserver(() => {
    initScrollReveal();
    initCardHovers();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

})();

/* ════════════════════════════════════════════════════════════════════════════════
   RIPPLE ANIMATION KEYFRAME (Added via CSS-in-JS to avoid duplicate)
   ════════════════════════════════════════════════════════════════════════════════ */

(function() {
  if (!document.querySelector('style[data-ripple-keyframes]')) {
    const style = document.createElement('style');
    style.setAttribute('data-ripple-keyframes', 'true');
    style.textContent = `
      @keyframes rippleExpand {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
