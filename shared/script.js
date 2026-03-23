// =============================================================
//  AMOPH · shared/script.js
//  ─────────────────────────────────────────────────────────────
//  PURPOSE:
//    Handles header/footer injection, mobile nav, active link
//    detection, and scroll effects. Shared across both sites.
//
//  HOW EACH SITE USES IT:
//
//    • amoph.org:
//        <script src="/shared/script.js"></script>
//        Place just before </body> on every page.
//        It fetches /shared/header.html and /shared/footer.html
//        and injects them into #site-header and #site-footer.
//
//    • blog.amoph.org:
//        Header and footer are already in the DOM (Eleventy
//        renders them from Nunjucks partials at build time),
//        so the fetch/inject block is SKIPPED automatically.
//        The script detects this via the BLOG_MODE flag below.
//        Mobile nav, hamburger, scroll effect, and active link
//        all still work — they just attach to existing DOM nodes.
//
//  BLOG_MODE FLAG:
//    In blog.amoph.org's base.njk, set this before loading
//    this script:
//        <script>window.AMOPH_BLOG_MODE = true;</script>
//        <script src="https://cdn.jsdelivr.net/gh/codealpha-afk/amoph@main/shared/script.js"></script>
//    When AMOPH_BLOG_MODE is true, fetch injection is skipped.
//
//  ACTIVE NAV LINK:
//    On amoph.org: matched against window.location.pathname.
//    On blog.amoph.org: matched against full href since all
//    nav links use absolute URLs (https://amoph.org/...).
//    Blog links (https://blog.amoph.org/) are highlighted when
//    window.location.hostname === 'blog.amoph.org'.
// =============================================================


// ─── MOBILE NAV ──────────────────────────────────────────────

/**
 * Toggle the mobile nav overlay open/closed.
 * Called by the hamburger button click handler.
 */
function toggleMobileNav() {
  var nav       = document.getElementById('mobile-nav');
  var hamburger = document.getElementById('hamburger');
  if (!nav || !hamburger) return;

  var isOpen = nav.classList.contains('open');

  // Lock/unlock body scroll
  document.body.classList.toggle('nav-open');

  if (isOpen) {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
  } else {
    nav.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    nav.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Close the mobile nav.
 * Called on: link click inside nav, outside click, Escape key.
 */
function closeMobileNav() {
  var nav       = document.getElementById('mobile-nav');
  var hamburger = document.getElementById('hamburger');

  if (nav) {
    nav.classList.remove('open');
    nav.setAttribute('aria-hidden', 'true');
  }

  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  document.body.classList.remove('nav-open');
}

// Close on Escape key (accessibility)
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeMobileNav();
});


// ─── ACTIVE NAV LINK ─────────────────────────────────────────

/**
 * Highlights the correct nav link for the current page.
 * Works for both absolute URLs (cross-site) and relative paths.
 */
function setActiveNavLink() {
  var currentHost = window.location.hostname;
  var currentPath = window.location.pathname;

  // If on blog.amoph.org, highlight the Blog link
  if (currentHost === 'blog.amoph.org') {
    var blogLinks = document.querySelectorAll('#nav-blog, #mnav-blog');
    blogLinks.forEach(function (link) {
      link.classList.add('active');
    });
    return;
  }

  // On amoph.org: match by pathname
  document.querySelectorAll('.site-header__links a').forEach(function (link) {
    var href = link.getAttribute('href');

    // Handle absolute URLs — extract pathname for comparison
    if (href && href.startsWith('http')) {
      try {
        var linkPath = new URL(href).pathname;
        if (linkPath === currentPath) link.classList.add('active');
      } catch (e) { /* ignore malformed URLs */ }
    } else {
      // Relative URL — direct pathname match
      if (href === currentPath) link.classList.add('active');
    }
  });
}


// ─── NAV ATTACH ──────────────────────────────────────────────

/**
 * Attaches hamburger click handler, outside-click-to-close,
 * and mobile link close handlers to the DOM.
 * Called after header is in the DOM (injected or static).
 */
function attachNavHandlers() {
  var hamburger = document.getElementById('hamburger');

  if (hamburger) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileNav();
    });

    // touchend for snappier response on iOS
    hamburger.addEventListener('touchend', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileNav();
    });
  }

  // Close nav when any mobile link is clicked
  document.querySelectorAll('#mobile-nav a').forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  // Close nav on outside click
  document.addEventListener('click', function (e) {
    var nav = document.getElementById('mobile-nav');
    var hb  = document.getElementById('hamburger');

    if (nav && nav.classList.contains('open')) {
      if (!nav.contains(e.target) && hb && !hb.contains(e.target)) {
        closeMobileNav();
      }
    }
  });
}


// ─── SCROLL EFFECT ───────────────────────────────────────────

/**
 * Adds .scrolled to #navbar when user scrolls past 50px.
 * brand.css uses .scrolled to solidify the header background.
 */
function attachScrollEffect() {
  window.addEventListener('scroll', function () {
    var navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  });
}


// ─── DOM READY ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

  var isBlogMode = window.AMOPH_BLOG_MODE === true;

  if (isBlogMode) {
    // ── BLOG MODE ─────────────────────────────────────────────
    // Header and footer already in DOM from Eleventy build.
    // Just attach handlers and set active link.
    attachNavHandlers();
    setActiveNavLink();
    attachScrollEffect();

  } else {
    // ── MAIN SITE MODE ────────────────────────────────────────
    // Fetch and inject header, then footer.

    // HEADER
    fetch('/shared/header.html')
      .then(function (res) { return res.text(); })
      .then(function (data) {
        var el = document.getElementById('site-header');
        if (el) el.innerHTML = data;

        // Handlers must be attached AFTER injection
        attachNavHandlers();
        setActiveNavLink();
      })
      .catch(function (err) {
        console.error('[AMOPH] Header load error:', err);
      });

    // FOOTER
    fetch('/shared/footer.html')
      .then(function (res) { return res.text(); })
      .then(function (data) {
        var el = document.getElementById('site-footer');
        if (el) {
          el.innerHTML = data;

          // Set copyright year after injection
          var yearEl = document.getElementById('footer-year');
          if (yearEl) yearEl.textContent = new Date().getFullYear();
        }
      })
      .catch(function (err) {
        console.error('[AMOPH] Footer load error:', err);
      });

    // Scroll effect (doesn't depend on injection)
    attachScrollEffect();
  }

});
