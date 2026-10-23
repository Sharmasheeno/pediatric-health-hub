const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
const PROXY_PATHS = ['/api', '/socket.io'];

function isProxyPath(pathname) {
  return PROXY_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function corsHeaders(origin, allowedOrigins) {
  const headers = new Headers({ Vary: 'Origin' });
  if (origin && allowedOrigins.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
    headers.set('Access-Control-Max-Age', '86400');
  }
  return headers;
}

export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigins = new Set(
      (env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    );

    if (!isProxyPath(incomingUrl.pathname)) {
      return new Response('Not found', { status: 404 });
    }

    if (!ALLOWED_METHODS.has(request.method)) {
      return new Response('Method not allowed', { status: 405, headers: { Allow: [...ALLOWED_METHODS].join(', ') } });
    }

    if (origin && !allowedOrigins.has(origin)) {
      return new Response('Origin not allowed', { status: 403, headers: { Vary: 'Origin' } });
    }

    const headers = corsHeaders(origin, allowedOrigins);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    let backendOrigin;
    try {
      backendOrigin = new URL(env.BACKEND_ORIGIN);
      if (backendOrigin.protocol !== 'https:') throw new Error('HTTPS is required');
    } catch (error) {
      console.error(JSON.stringify({ event: 'invalid_backend_origin', message: error instanceof Error ? error.message : 'Invalid origin' }));
      return Response.json({ error: 'Proxy is not configured' }, { status: 500, headers });
    }

    const target = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, backendOrigin);
    try {
      const upstream = await fetch(new Request(target, request));
      if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
        return upstream;
      }

      const responseHeaders = new Headers(upstream.headers);
      for (const [name, value] of headers) responseHeaders.set(name, value);
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error(JSON.stringify({
        event: 'backend_proxy_failed',
        path: incomingUrl.pathname,
        message: error instanceof Error ? error.message : 'Unknown upstream error',
      }));
      return Response.json({ error: 'API service is temporarily unavailable' }, { status: 502, headers });
    }
  },
};
