// =============================================================
//  AMOPH Cloudflare Worker
//  Responsibilities:
//    1. Redirect amoph.pages.dev → amoph.org
//    2. Inject shared <nav> and <footer> into every HTML page
//    3. Set the correct active nav link per page
//    4. Inject OG / Twitter / title meta tags per page
//    5. Handle dynamic blog post meta from GitHub frontmatter
// =============================================================

// ─── SHARED COMPONENTS ───────────────────────────────────────

const NAV_HTML = `
<!-- ═══ NAVIGATION ═══ -->
<nav id="navbar">
  <a class="nav-logo" href="/index.html">AMO · Philippines</a>
  <ul class="nav-links">
    <li><a href="/index.html" data-nav="home">Home</a></li>
    <li><a href="/about.html" data-nav="about">About Us</a></li>
    <li><a href="/history.html" data-nav="history">History &amp; Lineage</a></li>
    <li><a href="/membership.html" data-nav="membership">Membership</a></li>
    <li><a href="/blog.html" data-nav="blog">Blog</a></li>
    <li><a href="/contact.html" data-nav="contact">Contact</a></li>
  </ul>
  <div class="hamburger" id="hamburger" role="button" aria-label="Toggle navigation" aria-expanded="false">
    <span></span><span></span><span></span>
  </div>
</nav>

<!-- ═══ MOBILE NAV ═══ -->
<div class="mobile-nav" id="mobile-nav">
  <a href="/index.html" onclick="closeMobileNav()" data-nav="home">Home</a>
  <a href="/about.html" onclick="closeMobileNav()" data-nav="about">About Us</a>
  <a href="/history.html" onclick="closeMobileNav()" data-nav="history">History &amp; Lineage</a>
  <a href="/membership.html" onclick="closeMobileNav()" data-nav="membership">Membership</a>
  <a href="/blog.html" onclick="closeMobileNav()" data-nav="blog">Blog</a>
  <a href="/contact.html" onclick="closeMobileNav()" data-nav="contact">Contact</a>
</div>`;

const FOOTER_HTML = `
<!-- ═══ FOOTER ═══ -->
<footer>
  <img class="footer-emblem" src="/images/logos/logo-footer.png" alt="Ancient Martinist Order Emblem">
  <span class="footer-name">Ancient Martinist Order — Philippines</span>
  <span class="footer-tagline">Pax ✦ Lux ✦ Veritas</span>
  <ul class="footer-links">
    <li><a href="/index.html">Home</a></li>
    <li><a href="/about.html">About</a></li>
    <li><a href="/history.html">History &amp; Lineage</a></li>
    <li><a href="/membership.html">Membership</a></li>
    <li><a href="/blog.html">Blog</a></li>
    <li><a href="/contact.html">Contact</a></li>
  </ul>
  <p class="footer-copy">© <span id="year"></span> Ancient Martinist Order – Philippines · All rights reserved.</p>
</footer>`;

// ─── NAV KEY → PATH MAPPING ───────────────────────────────────
// Maps a nav key to the path segment used to detect the active page.
const NAV_KEYS = {
  home:       '/',
  about:      '/about',
  history:    '/history',
  membership: '/membership',
  blog:       '/blog',
  contact:    '/contact',
};

// ─── PAGE META ────────────────────────────────────────────────
const PAGE_META = {
  '/':           {
    title:       'AMOPH | Ancient Martinist Order Philippines',
    description: 'The Ancient Martinist Order Philippines (AMOPH) is an authentic initiatic fraternity transmitting the living Martinist tradition. Free initiation in Manila.',
    image:       'https://amoph.org/images/og-images/amoph-homepage-og-image.jpg',
  },
  '/about':      {
    title:       'Who We Are | Ancient Martinist Order Philippines',
    description: 'The AMO Philippines: A community dedicated to the Way of the Heart and Divine Reintegration.',
    image:       'https://amoph.org/images/og-images/amoph-about-us-og-image.jpg',
  },
  '/history':    {
    title:       'History & Lineage | Ancient Martinist Order Philippines',
    description: 'From 18th-century France to the Philippines. Explore our lineage and the Unknown Philosopher.',
    image:       'https://amoph.org/images/og-images/amoph-history-og-image.jpg',
  },
  '/membership': {
    title:       'Membership & Initiation | Ancient Martinist Order Philippines',
    description: 'Join the inner journey. Learn about affiliation and the sincere calling to the Martinist path.',
    image:       'https://amoph.org/images/og-images/amoph-membership-og-image.jpg',
  },
  '/blog':       {
    title:       'The Martinist Journal | Ancient Martinist Order Philippines',
    description: 'Illuminated writings from the Ancient Martinist Order Philippines.',
    image:       'https://amoph.org/images/og-images/amoph-blog-og-image.jpg',
  },
  '/contact':    {
    title:       'Connect With Us | Ancient Martinist Order Philippines',
    description: 'Answer the calling. Contact the AMO Philippines for inquiries regarding initiation.',
    image:       'https://amoph.org/images/og-images/amoph-contact-us-og-image.jpg',
  },
};

// ─── HELPERS ─────────────────────────────────────────────────

/**
 * Resolve which nav key is active for the current path.
 * Blog post pages inherit the "blog" active state.
 */
function getActiveNavKey(pathname) {
  const p = pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  if (p === '') return 'home';
  for (const [key, segment] of Object.entries(NAV_KEYS)) {
    if (segment === '/' && p === '/') return key;
    if (segment !== '/' && p.startsWith(segment)) return key;
  }
  return '';
}

/**
 * Inject class="active" into nav/mobile-nav links for the current page.
 */
function injectActiveNav(navHtml, activeKey) {
  if (!activeKey) return navHtml;
  return navHtml.replace(
    new RegExp(`data-nav="${activeKey}"`, 'g'),
    `data-nav="${activeKey}" class="active"`
  );
}

/**
 * Build the <head> meta tag block for a given page.
 */
function buildMetaTags(meta, canonicalUrl, ogType = 'website') {
  return `
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:site_name" content="Ancient Martinist Order Philippines" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:locale" content="en_PH" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.description}" />
  <meta name="twitter:image" content="${meta.image}" />`;
}

/**
 * Parse YAML-style frontmatter from a markdown string.
 * Returns a flat object of key → string value.
 */
function parseFrontmatter(mdText) {
  const fm = {};
  const match = mdText.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return fm;
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) fm[key] = val;
  });
  return fm;
}

// ─── MAIN HANDLER ─────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Redirect staging domain → production
    if (url.hostname === 'amoph.pages.dev') {
      return Response.redirect(
        'https://amoph.org' + url.pathname + url.search,
        301
      );
    }

    // 2. Only process HTML responses — pass everything else through
    const response = await fetch(request);
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    let html = await response.text();

    // 3. Resolve active nav key from path
    const pathname = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const activeKey = getActiveNavKey(url.pathname);
    const navWithActive = injectActiveNav(NAV_HTML, activeKey);

    // 4. Resolve meta: start with page-level defaults
    const metaKey = pathname === '' ? '/' : pathname;
    let meta = PAGE_META[metaKey] || PAGE_META['/'];
    let ogType = 'website';

    // 5. Override meta for dynamic blog posts
    if (url.pathname.startsWith('/blog-post')) {
      const postParam = url.searchParams.get('post');
      // Default blog meta as fallback
      meta = { ...PAGE_META['/blog'] };
      ogType = 'article';

      if (postParam) {
        const mdUrl = `https://raw.githubusercontent.com/codealpha-afk/amoph/refs/heads/main/_posts/${postParam}`;
        try {
          const mdResponse = await fetch(mdUrl);
          if (mdResponse.ok) {
            const fm = parseFrontmatter(await mdResponse.text());
            if (fm.title)       meta.title       = fm.title;
            if (fm.description) meta.description = fm.description.replace(/\n\s*/g, ' ');
            if (fm.thumbnail)   meta.image       = fm.thumbnail;
          }
        } catch (_) { /* fall through to blog defaults */ }
      }
    }

    // 6. Build meta tag block
    const canonicalUrl = `https://amoph.org${url.pathname}${url.search}`;
    const metaTags = buildMetaTags(meta, canonicalUrl, ogType);

    // 7. Inject meta tags — replace everything between <!-- META_START -->
    //    and <!-- META_END --> if markers exist, otherwise prepend to <head>.
    //    This removes all the old per-page title/og/twitter tags at once.
    if (html.includes('<!-- META_START -->') && html.includes('<!-- META_END -->')) {
      html = html.replace(
        /<!-- META_START -->[\s\S]*?<!-- META_END -->/,
        `<!-- META_START -->${metaTags}\n  <!-- META_END -->`
      );
    } else {
      html = html.replace('<head>', `<head>\n  <!-- META_START -->${metaTags}\n  <!-- META_END -->`);
    }

    // 8. Inject nav — replace <!-- NAV --> placeholder or inject after <body>
    if (html.includes('<!-- NAV -->')) {
      html = html.replace('<!-- NAV -->', navWithActive);
    } else {
      html = html.replace('<body>', `<body>\n${navWithActive}`);
    }

    // 9. Inject footer — replace <!-- FOOTER --> placeholder or inject before </body>
    if (html.includes('<!-- FOOTER -->')) {
      html = html.replace('<!-- FOOTER -->', FOOTER_HTML);
    } else {
      html = html.replace('</body>', `${FOOTER_HTML}\n</body>`);
    }

    return new Response(html, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        // Preserve any existing headers from the origin response
        ...Object.fromEntries(response.headers),
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  }
};
