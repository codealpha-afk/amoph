// =============================================================
//  AMOPH · script.js
//  Responsibilities:
//    - Mobile nav toggle / close
//    - Navbar scroll effect
//    - Footer year (dynamic)
//    - Email obfuscation (anti-scraping)
// =============================================================

// ─── MOBILE NAV ──────────────────────────────────────────────

function toggleMobileNav() {
  var nav = document.getElementById('mobile-nav');
  var hamburger = document.getElementById('hamburger');
  if (!nav || !hamburger) return;
  var isOpen = nav.classList.contains('open');
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
}

// Close on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeMobileNav();
});

// ─── DOM READY ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

  // Hamburger button
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

  // Close nav when clicking outside
  document.addEventListener('click', function (e) {
    var nav = document.getElementById('mobile-nav');
    var hb  = document.getElementById('hamburger');
    if (nav && nav.classList.contains('open')) {
      if (!nav.contains(e.target) && hb && !hb.contains(e.target)) {
        closeMobileNav();
      }
    }
  });

  // Navbar scroll effect
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ─── FOOTER YEAR ─────────────────────────────────────────
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ─── EMAIL OBFUSCATION ───────────────────────────────────
  // Builds the contact email at runtime to prevent server-side scraping.
  (function () {
    var u = 'contact';
    var d = 'amoph.org';
    var e = u + '@' + d;
    var href =
      'mailto:' + e +
      '?subject=Petition%20for%20Admission%2FInquiry%3A%20%5BYour%20Full%20Name%5D' +
      '&body=Name%3A%20%0ALocation%3A%20%0A%0AMessage%3A%20Share%20a%20little%20about%20yourself%20and%20what%20draws%20you%20to%20the%20Martinist%20Path%E2%80%A6';

    // Inline email display spans: id="em1", "em2", "em3"
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

    // Email CTA buttons: id="embtn1", "embtn2"
    var btn1 = document.getElementById('embtn1');
    if (btn1) btn1.href = href;

    var btn2 = document.getElementById('embtn2');
    if (btn2) btn2.href = href;
  })();

});
