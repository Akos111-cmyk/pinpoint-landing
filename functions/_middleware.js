export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|applebot|google-inspectiontool/i.test(userAgent);
  const cookie = request.headers.get('Cookie') || '';

  const langMatch = cookie.match(/(?:^|;\s*)lang=(en|lv|ru)/);
  const langPref = langMatch ? langMatch[1] : null;

  if (url.pathname === '/lv' || url.pathname.startsWith('/lv/')) {
    if (!isBot && langPref === 'en') {
      return Response.redirect(url.origin + '/', 302);
    }
    if (!isBot && langPref === 'ru') {
      return Response.redirect(url.origin + '/ru/', 302);
    }
    if (url.pathname === '/lv') {
      return Response.redirect(url.origin + '/lv/', 301);
    }
    return next();
  }

  if (url.pathname === '/ru' || url.pathname.startsWith('/ru/')) {
    if (!isBot && langPref === 'en') {
      return Response.redirect(url.origin + '/', 302);
    }
    if (!isBot && langPref === 'lv') {
      return Response.redirect(url.origin + '/lv/', 302);
    }
    if (url.pathname === '/ru') {
      return Response.redirect(url.origin + '/ru/', 301);
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
    if (langPref === 'ru') {
      return Response.redirect(url.origin + '/ru/', 302);
    }
    if (!langPref && request.cf?.country === 'LV') {
      return Response.redirect(url.origin + '/lv/', 302);
    }
  }

  return next();
}
