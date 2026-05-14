/* Hamilton Care Dental Centre — main.js
   Handles: mobile nav, services submenu toggle, smooth UX touches.
   No external dependencies. */

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

    /* ---------- Appointment form: client-side validation feedback ---------- */
    var form = document.getElementById('appointment-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        if (!form.checkValidity()) return;
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var notice = form.querySelector('.form-note');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        // Replace with real submission endpoint when wired up.
        setTimeout(function () {
          if (notice) notice.textContent = 'Thanks! We will contact you within 24 hours to confirm your appointment.';
          form.reset();
          if (btn) { btn.disabled = false; btn.textContent = 'Request Appointment'; }
        }, 700);
      });
    }
  });
})();
