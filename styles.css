// =============================================================
//  AMOPH · script.js (FINAL CLEAN VERSION)
// =============================================================

// ─── MOBILE NAV ──────────────────────────────────────────────

function toggleMobileNav() {
  var nav = document.getElementById('mobile-nav');
  var hamburger = document.getElementById('hamburger');
  if (!nav || !hamburger) return;

  var isOpen = nav.classList.contains('open');

  document.body.classList.toggle('nav-open');

  if (isOpen) {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  } else {
    nav.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }
}

function closeMobileNav() {
  var nav = document.getElementById('mobile-nav');
  var hamburger = document.getElementById('hamburger');

  if (nav) nav.classList.remove('open');

  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  document.body.classList.remove('nav-open');
}

// Close on Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeMobileNav();
});

// ─── DOM READY ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

  // ─── LOAD HEADER ─────────────────────────────
  fetch('/header.html')
    .then(res => res.text())
    .then(data => {
      var header = document.getElementById('site-header');
      if (header) header.innerHTML = data;

      // HAMBURGER (after injection)
      var hamburger = document.getElementById('hamburger');

      if (hamburger) {
        hamburger.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleMobileNav();
        });

        hamburger.addEventListener('touchend', function (e) {
          e.preventDefault();
          e.stopPropagation();
          toggleMobileNav();
        });
      }

      // ACTIVE NAV
      var path = window.location.pathname;

      document.querySelectorAll('.site-header__links a').forEach(function(link) {
        if (link.getAttribute('href') === path) {
          link.classList.add('active');
        }
      });

      // CLOSE MENU ON LINK CLICK
      document.querySelectorAll('#mobile-nav a').forEach(function(link) {
        link.addEventListener('click', closeMobileNav);
      });

    })
    .catch(err => console.error('Header error:', err));

  // ─── LOAD FOOTER ─────────────────────────────
  fetch('/footer.html')
    .then(res => res.text())
    .then(data => {
      var footer = document.getElementById('site-footer');
      if (footer) footer.innerHTML = data;

      var yearEl = document.getElementById('footer-year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    })
    .catch(err => console.error('Footer error:', err));

  // CLOSE NAV OUTSIDE CLICK
  document.addEventListener('click', function (e) {
    var nav = document.getElementById('mobile-nav');
    var hb  = document.getElementById('hamburger');

    if (nav && nav.classList.contains('open')) {
      if (!nav.contains(e.target) && hb && !hb.contains(e.target)) {
        closeMobileNav();
      }
    }
  });

  // NAVBAR SCROLL EFFECT
  window.addEventListener('scroll', function () {
    var navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  });

});
