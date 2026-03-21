// =============================================================
//  AMOPH · script.js
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

// Close on Escape key
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

    // ✅ NOW hamburger exists
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
  })
  .catch(err => console.error('Header error:', err));
  
  // ─── LOAD FOOTER ─────────────────────────────
  fetch('/footer.html')
    .then(res => res.text())
    .then(data => {
      var footer = document.getElementById('site-footer');
      if (footer) footer.innerHTML = data;

      // Fix footer year AFTER injection
      var yearEl = document.getElementById('footer-year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    })
    .catch(err => console.error('Footer error:', err));

fetch('/header.html')
  .then(res => res.text())
  .then(data => {
    var header = document.getElementById('site-header');
    if (header) header.innerHTML = data;

    // ✅ NOW hamburger exists
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
  })
  .catch(err => console.error('Header error:', err));

  // ─── CLOSE NAV OUTSIDE CLICK ─────────────────
  document.addEventListener('click', function (e) {
    var nav = document.getElementById('mobile-nav');
    var hb  = document.getElementById('hamburger');

    if (nav && nav.classList.contains('open')) {
      if (!nav.contains(e.target) && hb && !hb.contains(e.target)) {
        closeMobileNav();
      }
    }
  });

  // ─── NAVBAR SCROLL EFFECT ────────────────────
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ─── EMAIL OBFUSCATION ───────────────────────
  (function () {
    var u = 'contact';
    var d = 'amoph.org';
    var e = u + '@' + d;

    var href =
      'mailto:' + e +
      '?subject=Petition%20for%20Admission%2FInquiry%3A%20%5BYour%20Full%20Name%5D' +
      '&body=Name%3A%20%0ALocation%3A%20%0A%0AMessage%3A%20Share%20a%20little%20about%20yourself%20and%20what%20draws%20you%20to%20the%20Martinist%20Path%E2%80%A6';

    for (var i = 1; i <= 3; i++) {
      var el = document.getElementById('em' + i);
      if (el) {
        var a = document.createElement('a');
        a.href = 'mailto:' + e;
        a.textContent = e;
        a.style.color = 'inherit';
        el.appendChild(a);
      }
    }

    var btn1 = document.getElementById('embtn1');
    if (btn1) btn1.href = href;

    var btn2 = document.getElementById('embtn2');
    if (btn2) btn2.href = href;
  })();

});
