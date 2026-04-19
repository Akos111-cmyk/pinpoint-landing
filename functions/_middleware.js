export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const cookie = request.headers.get('Cookie') || '';

  const langMatch = cookie.match(/(?:^|;\s*)lang=(en|lv)/);
  const langPref = langMatch ? langMatch[1] : null;

  if (url.pathname === '/lv' || url.pathname.startsWith('/lv/')) {
    if (langPref === 'en') {
      return Response.redirect(url.origin + '/', 302);
    }
    return next();
  }

  if (url.pathname === '/') {
    if (langPref === 'lv') {
      return Response.redirect(url.origin + '/lv/', 302);
    }
    if (!langPref && request.cf?.country === 'LV') {
      return Response.redirect(url.origin + '/lv/', 302);
    }
  }

  return next();
}
