export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|applebot|google-inspectiontool/i.test(userAgent);
  const cookie = request.headers.get('Cookie') || '';

  const langMatch = cookie.match(/(?:^|;\s*)lang=(en|lv)/);
  const langPref = langMatch ? langMatch[1] : null;

  if (url.pathname === '/lv' || url.pathname.startsWith('/lv/')) {
    if (!isBot && langPref === 'en') {
      return Response.redirect(url.origin + '/', 302);
    }
    if (url.pathname === '/lv') {
      return Response.redirect(url.origin + '/lv/', 301);
    }
    return next();
  }

  if (url.pathname === '/') {
    if (isBot) {
      return next();
    }
    if (langPref === 'lv') {
      return Response.redirect(url.origin + '/lv/', 302);
    }
    if (!langPref && request.cf?.country === 'LV') {
      return Response.redirect(url.origin + '/lv/', 302);
    }
  }

  return next();
}
