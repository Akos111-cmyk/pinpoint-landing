export async function onRequestPost({ request, env }) {
  // CORS headers for same-origin POST from the static site
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400, headers });
  }

  const email   = (body.email   || '').trim();
  const phone   = (body.phone   || '').trim();
  const message = (body.message || '').trim();
  const source  = body.source === 'LV' ? 'LV' : 'EN';

  if (!email || !phone || !message) {
    return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400, headers });
  }

  // --- Get Google access token ---
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  });

  if (!tokenRes.ok) {
    return new Response(JSON.stringify({ error: 'Auth failed. Please try again.' }), { status: 500, headers });
  }

  const { access_token } = await tokenRes.json();
  const timestamp = new Date().toISOString();

  // --- Append to Google Sheets ---
  const sheetsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.LEADS_SHEET_ID}/values/Sheet1!A1:E1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [[timestamp, email, phone, message, source]] }),
    }
  );

  if (!sheetsRes.ok) {
    return new Response(JSON.stringify({ error: 'Could not save your message. Please try again.' }), { status: 500, headers });
  }

  // --- Send Gmail notification ---
  const emailBody = [
    `New inquiry from the Pinpoint AI website (${source})`,
    '',
    `Email:   ${email}`,
    `Phone:   ${phone}`,
    `Message: ${message}`,
    '',
    `Time: ${timestamp}`,
  ].join('\n');

  const rawEmail = [
    `To: aleks@pinpointagents.com`,
    `From: aleks@pinpointagents.com`,
    `Subject: New inquiry — ${email}`,
    `Content-Type: text/plain; charset=utf-8`,
    '',
    emailBody,
  ].join('\r\n');

  const encoded = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
