/* Hamilton Care Dental Centre - main.js
   Handles: mobile nav, services submenu toggle, smooth UX touches,
   and the service-hero image slider (manual prev/next/dots + 7-second
   auto-advance with pause on interaction). No external dependencies. */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    /* ---------- Mobile nav toggle ---------- */
    var burger = document.querySelector('.nav-burger');
    var nav = document.querySelector('.nav');
    if (burger && nav) {
      burger.addEventListener('click', function () {
        var isOpen = nav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(isOpen));
      });
    }

    /* ---------- Services submenu on mobile ---------- */
    var servicesToggle = document.querySelector('.nav-services > a');
    if (servicesToggle) {
      servicesToggle.addEventListener('click', function (e) {
        if (window.matchMedia('(max-width: 992px)').matches) {
          e.preventDefault();
          servicesToggle.parentElement.classList.toggle('is-open');
        }
      });
    }

    /* ---------- Smooth-scroll for in-page anchors ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id.length > 1) {
          var target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (nav && nav.classList.contains('is-open')) nav.classList.remove('is-open');
          }
        }
      });
    });

    /* ---------- Set minimum date on appointment form to today ---------- */
    var dateInput = document.getElementById('preferred-date');
    if (dateInput) {
      var today = new Date();
      var iso = today.toISOString().split('T')[0];
      dateInput.min = iso;
    }

    /* ---------- Appointment form: disable submit button on send ----------
       Lets the real form POST through to /api/send (Vercel) or /send.php
       (cPanel fallback). The handler does the redirect to /thank-you/. */
    document.querySelectorAll('form#appointment-form, form#referral-form').forEach(function (form) {
      /* Anti-spam timing trap: stamp when the form became available to a real
         visitor. The server drops submissions that arrive < 2.5s after this.
         If JS is disabled the field stays empty and the server lets it through. */
      var tField = form.querySelector('input[name="_t"]');
      if (tField) tField.value = String(Date.now());

      form.addEventListener('submit', function () {
        if (!form.checkValidity()) return; // browser will show validation errors
        var btn = form.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.dataset.label = btn.textContent;
          btn.textContent = 'Sending...';
        }
      });
    });

    /* ---------- Service hero image slider ----------
       Targets every .service-hero-slider on the page. Each slider has
       data-count = total slides and data-autoplay = ms between auto-advances.
       Manual controls: .slider-prev, .slider-next, .slider-dot[data-slide-index]
       Auto-advance is paused on any user interaction (click, keyboard, hover)
       and resumes 7 seconds after the last interaction. Respects
       prefers-reduced-motion (no auto-advance, manual controls still work). */
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.service-hero-slider').forEach(function (slider) {
      var slides = slider.querySelectorAll('.slide');
      var dots = slider.querySelectorAll('.slider-dot');
      var prevBtn = slider.querySelector('.slider-prev');
      var nextBtn = slider.querySelector('.slider-next');
      var count = slides.length;
      if (count < 2) return; // single image, nothing to do

      var autoplayMs = parseInt(slider.getAttribute('data-autoplay') || '7000', 10);
      var current = 0;
      var timerId = null;

      function show(idx) {
        idx = ((idx % count) + count) % count;  // wrap both directions
        current = idx;
        for (var i = 0; i < count; i++) {
          slides[i].classList.toggle('is-active', i === idx);
        }
        for (var j = 0; j < dots.length; j++) {
          var active = j === idx;
          dots[j].classList.toggle('is-active', active);
          dots[j].setAttribute('aria-current', active ? 'true' : 'false');
        }
      }

      function next() { show(current + 1); }
      function prev() { show(current - 1); }

      function start() {
        if (prefersReduced) return;
        stop();
        timerId = window.setInterval(next, autoplayMs);
      }
      function stop() {
        if (timerId) { window.clearInterval(timerId); timerId = null; }
      }
      function bump() { start(); }   // reset the auto-advance timer

      if (prevBtn) {
        prevBtn.addEventListener('click', function () { prev(); bump(); });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () { next(); bump(); });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          var idx = parseInt(dot.getAttribute('data-slide-index') || '0', 10);
          show(idx); bump();
        });
      });

      // Keyboard support when the slider has focus
      slider.setAttribute('tabindex', '0');
      slider.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { prev(); bump(); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { next(); bump(); e.preventDefault(); }
      });

      // Pause on hover (desktop) so users can read the controls
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);

      // Pause when the tab is hidden to save cycles
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
      });

      // Optional: touch swipe support (left/right)
      var touchStartX = null;
      slider.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
        stop();
      }, { passive: true });
      slider.addEventListener('touchend', function (e) {
        if (touchStartX === null) { start(); return; }
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) { (dx < 0 ? next : prev)(); }
        touchStartX = null;
        start();
      }, { passive: true });

      // Hydrate (apply initial active state, mark slider as JS-controlled)
      show(0);
      slider.classList.add('is-hydrated');
      start();
    });
  });
})();
