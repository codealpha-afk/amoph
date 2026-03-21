export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Redirect staging domain to production
    if (url.hostname === 'test.amoph.org') {
      return Response.redirect(
        'https://amoph.org' + url.pathname + url.search,
        301
      );
    }

    // Only process HTML responses
    const response = await fetch(request);
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    let html = await response.text();

    // Fetch the navbar and footer content
    const navResponse = await fetch('https://your-domain.com/nav.html');
    const footerResponse = await fetch('https://your-domain.com/footer.html');
    const navHtml = await navResponse.text();
    const footerHtml = await footerResponse.text();

    // Resolve active nav key from path
    const pathname = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const activeKey = getActiveNavKey(url.pathname);
    const navWithActive = injectActiveNav(navHtml, activeKey);

    // Resolve meta tags
    const metaKey = pathname === '' ? '/' : pathname;
    let meta = PAGE_META[metaKey] || PAGE_META['/'];
    let ogType = 'website';

    // Override meta for dynamic blog posts
    if (url.pathname.startsWith('/blog-post')) {
      const postParam = url.searchParams.get('post');
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

    // Build meta tag block
    const canonicalUrl = `https://amoph.org${url.pathname}${url.search}`;
    const metaTags = buildMetaTags(meta, canonicalUrl, ogType);

    // Inject meta tags
    if (html.includes('<!-- META_START -->') && html.includes('<!-- META_END -->')) {
      html = html.replace(
        /<!-- META_START -->[\s\S]*?<!-- META_END -->/,
        `<!-- META_START -->${metaTags}\n  <!-- META_END -->`
      );
    } else {
      html = html.replace('<head>', `<head>\n  <!-- META_START -->${metaTags}\n  <!-- META_END -->`);
    }

    // Inject nav
    if (html.includes('<!-- NAV -->')) {
      html = html.replace('<!-- NAV -->', navWithActive);
    } else {
      html = html.replace('<body>', `<body>\n${navWithActive}`);
    }

    // Inject footer
    if (html.includes('<!-- FOOTER -->')) {
      html = html.replace('<!-- FOOTER -->', footerHtml);
    } else {
      html = html.replace('</body>', `${footerHtml}\n</body>`);
    }

    return new Response(html, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        ...Object.fromEntries(response.headers)
      },
    });
  }
};
