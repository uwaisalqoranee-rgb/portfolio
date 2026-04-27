/* ---------------------------------------------------------------
   main.js
   Portfolio interactions:
     1. Sticky navigation state on scroll
     2. Mobile menu drawer toggle
     3. Reveal-on-scroll via IntersectionObserver
     4. Subtle parallax on hero portrait
     5. Smooth in-page anchor scrolling
   No build step. Vanilla ES2020. Respects prefers-reduced-motion.
   --------------------------------------------------------------- */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* -------------------------------------------------------------
     1. Sticky nav state
     Adds `is-stuck` class once the user scrolls past the top so the
     navigation gains its solid background and rule.
     ------------------------------------------------------------- */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const STUCK_THRESHOLD = 24;
    let lastStuck = false;

    const updateNavState = () => {
      const isStuck = window.scrollY > STUCK_THRESHOLD;
      if (isStuck !== lastStuck) {
        nav.classList.toggle('is-stuck', isStuck);
        lastStuck = isStuck;
      }
    };

    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
  }

  /* -------------------------------------------------------------
     2. Mobile drawer toggle
     ------------------------------------------------------------- */
  const toggle = document.querySelector('[data-nav-toggle]');
  const drawer = document.querySelector('[data-nav-drawer]');

  if (toggle && drawer) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!open);
    });

    // Close drawer when any link inside is followed
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    // Close on Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' &&
          toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* -------------------------------------------------------------
     3. Reveal-on-scroll
     Adds `is-visible` to elements with .reveal once they enter the
     viewport. Falls back to immediate visibility if IO is missing
     or reduced motion is requested.
     ------------------------------------------------------------- */
  const revealNodes = document.querySelectorAll('.reveal');

  if (!revealNodes.length) {
    // nothing to do
  } else if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      }
    );
    revealNodes.forEach((node) => observer.observe(node));
  }

  /* -------------------------------------------------------------
     4. Hero portrait parallax
     Tiny translateY offset (max ~24px) tied to scroll. Skipped on
     touch devices and when reduced motion is preferred.
     ------------------------------------------------------------- */
  const portrait = document.querySelector('[data-parallax]');
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (portrait && !prefersReducedMotion && !isCoarsePointer) {
    let ticking = false;

    const update = () => {
      const offset = Math.min(window.scrollY * 0.08, 24);
      portrait.style.transform = `translate3d(0, ${offset}px, 0)`;
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* -------------------------------------------------------------
     5. Smooth anchor scrolling
     Native CSS `scroll-behavior: smooth` already handles most of
     this. We additionally compensate for the fixed nav by adjusting
     the scroll target offset.
     ------------------------------------------------------------- */
  const NAV_OFFSET = 56;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET + 1;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });

      // Move focus for screen readers
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* -------------------------------------------------------------
     Tag year of build into the document title once
     (kept simple — a quietly professional detail)
     ------------------------------------------------------------- */
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
