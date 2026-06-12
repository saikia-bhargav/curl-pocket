// Generates code snippets from an ApiRequest.
// Each function returns a complete, copy-pasteable string.

import type { ApiRequest, KeyValuePair } from '@/types/request';

// ── Shared helpers ─────────────────────────────────────────────

function buildQueryString(params: KeyValuePair[]): string {
  const active = params.filter(p => p.enabled && p.key.trim() !== '');
  if (active.length === 0) { return ''; }
  return '?' + active
    .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&');
}

function fullUrl(request: ApiRequest): string {
  return request.url + buildQueryString(request.params);
}

function activeHeaders(request: ApiRequest): KeyValuePair[] {
  return request.headers.filter(h => h.enabled && h.key.trim() !== '');
}

function bodyHeaders(request: ApiRequest): KeyValuePair[] {
  const existing = activeHeaders(request).map(h => h.key.toLowerCase());
  const extra: KeyValuePair[] = [];

  if (request.body.type === 'raw' && !existing.includes('content-type')) {
    const ctMap: Record<string, string> = {
      json:       'application/json',
      xml:        'application/xml',
      html:       'text/html',
      javascript: 'application/javascript',
      text:       'text/plain',
    };
    extra.push({
      id: 'auto-ct',
      key: 'Content-Type',
      value: ctMap[request.body.language] ?? 'text/plain',
      enabled: true,
    });
  }

  if (request.body.type === 'urlencoded' && !existing.includes('content-type')) {
    extra.push({
      id: 'auto-ct',
      key: 'Content-Type',
      value: 'application/x-www-form-urlencoded',
      enabled: true,
    });
  }

  return [...extra, ...activeHeaders(request)];
}

function authHeaders(request: ApiRequest): KeyValuePair[] {
  if (request.auth.type === 'bearer' && request.auth.bearer !== undefined) {
    return [{
      id: 'auth',
      key: 'Authorization',
      value: `Bearer ${request.auth.bearer.token}`,
      enabled: true,
    }];
  }
  if (request.auth.type === 'api-key' && request.auth.apiKey !== undefined) {
    if (request.auth.apiKey.placement === 'header') {
      return [{
        id: 'auth',
        key: request.auth.apiKey.key,
        value: request.auth.apiKey.value,
        enabled: true,
      }];
    }
  }
  return [];
}

function allHeadersList(request: ApiRequest): KeyValuePair[] {
  return [...authHeaders(request), ...bodyHeaders(request)];
}

function buildBody(request: ApiRequest): string {
  if (request.body.type === 'none') { return ''; }
  if (request.body.type === 'raw')  { return request.body.raw; }
  if (request.body.type === 'urlencoded') {
    return request.body.urlEncoded
      .filter(f => f.enabled)
      .map(f => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value)}`)
      .join('&');
  }
  if (request.body.type === 'form-data') {
    // form-data can't be easily inlined — return JSON summary
    return JSON.stringify(
      Object.fromEntries(
        request.body.formData
          .filter(f => f.enabled)
          .map(f => [f.key, f.value]),
      ),
      null,
      2,
    );
  }
  return '';
}

// ── cURL generator ─────────────────────────────────────────────

export function toCurl(request: ApiRequest): string {
  const lines: string[] = [`curl --location --request ${request.method} '${fullUrl(request)}'`];

  const headers = allHeadersList(request);
  for (const h of headers) {
    lines.push(`  --header '${h.key}: ${h.value}'`);
  }

  if (request.auth.type === 'basic' && request.auth.basic !== undefined) {
    const { username, password } = request.auth.basic;
    lines.push(`  --user '${username}:${password}'`);
  }

  const body = buildBody(request);
  if (body !== '') {
    if (request.body.type === 'form-data') {
      for (const f of request.body.formData.filter(x => x.enabled)) {
        lines.push(`  --form '${f.key}=${f.value}'`);
      }
    } else if (request.body.type === 'urlencoded') {
      lines.push(`  --data-urlencode '${body}'`);
    } else {
      // Escape single quotes in body for shell safety
      const escaped = body.replace(/'/g, "'\\''");
      lines.push(`  --data-raw '${escaped}'`);
    }
  }

  return lines.join(' \\\n');
}

// ── fetch (JS) generator ───────────────────────────────────────

export function toFetch(request: ApiRequest): string {
  const headers = allHeadersList(request);
  const headersObj = Object.fromEntries(
    headers.map(h => [h.key, h.value]),
  );

  const body = buildBody(request);
  const hasBody = body !== '';

  const options: Record<string, unknown> = {
    method: request.method,
  };

  if (headers.length > 0) {
    options['headers'] = headersObj;
  }

  if (hasBody) {
    options['body'] = request.body.type === 'raw'
      ? request.body.raw
      : body;
  }

  if (request.auth.type === 'basic' && request.auth.basic !== undefined) {
    const { username, password } = request.auth.basic;
    const authStr = `${username}:${password}`;
    let encoded = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (let block = 0, charCode, i = 0, map = chars;
         authStr.charAt(i | 0) || (map = '=', i % 1);
         encoded += map.charAt(63 & block >> 8 - i % 1 * 8)) {
      charCode = authStr.charCodeAt(i += 3/4);
      block = block << 8 | charCode;
    }
    if (options['headers'] === undefined) {
      options['headers'] = {};
    }
    (options['headers'] as Record<string, string>)['Authorization'] =
      `Basic ${encoded}`;
  }

  const optionsJson = JSON.stringify(options, null, 2)
    // Replace JSON-quoted body string with template literal style
    .replace(/"body": "(.*)"/, (_, b) => `"body": \`${b}\``);

  return [
    `const response = await fetch('${fullUrl(request)}', ${optionsJson});`,
    '',
    'const data = await response.json();',
    'console.log(data);',
  ].join('\n');
}

// ── Axios generator ────────────────────────────────────────────

export function toAxios(request: ApiRequest): string {
  const headers = allHeadersList(request);

  const config: Record<string, unknown> = {
    method: request.method.toLowerCase(),
    url: fullUrl(request),
  };

  if (headers.length > 0) {
    config['headers'] = Object.fromEntries(headers.map(h => [h.key, h.value]));
  }

  if (request.auth.type === 'basic' && request.auth.basic !== undefined) {
    config['auth'] = {
      username: request.auth.basic.username,
      password: request.auth.basic.password,
    };
  }

  const body = buildBody(request);
  if (body !== '') {
    if (request.body.type === 'raw' && request.body.language === 'json') {
      try {
        config['data'] = JSON.parse(body);
      } catch {
        config['data'] = body;
      }
    } else {
      config['data'] = body;
    }
  }

  const params = request.params.filter(p => p.enabled && p.key !== '');
  if (params.length > 0) {
    config['params'] = Object.fromEntries(params.map(p => [p.key, p.value]));
    // Remove params from URL since Axios handles them separately
    config['url'] = request.url;
  }

  return [
    "import axios from 'axios';",
    '',
    `const response = await axios(${JSON.stringify(config, null, 2)});`,
    '',
    'console.log(response.data);',
  ].join('\n');
}

// ── HTTPie generator ───────────────────────────────────────────

export function toHttpie(request: ApiRequest): string {
  const parts: string[] = ['http'];

  // Method (HTTPie defaults to GET, so only add if different)
  if (request.method !== 'GET' || buildBody(request) !== '') {
    parts.push(request.method);
  }

  parts.push(`'${fullUrl(request)}'`);

  // Auth
  if (request.auth.type === 'bearer' && request.auth.bearer !== undefined) {
    parts.push(`'Authorization:Bearer ${request.auth.bearer.token}'`);
  }
  if (request.auth.type === 'basic' && request.auth.basic !== undefined) {
    parts.push(`--auth '${request.auth.basic.username}:${request.auth.basic.password}'`);
  }

  // Headers
  for (const h of activeHeaders(request)) {
    parts.push(`'${h.key}:${h.value}'`);
  }

  // Body
  const body = buildBody(request);
  if (body !== '' && request.body.type === 'raw') {
    if (request.body.language === 'json') {
      // HTTPie can accept JSON key=value pairs but raw is cleaner
      parts.push(`<<<'${body.replace(/'/g, "'\\''")}'`);
    } else {
      parts.push(`<<<'${body}'`);
    }
  }

  if (request.body.type === 'urlencoded') {
    for (const f of request.body.urlEncoded.filter(x => x.enabled)) {
      parts.push(`${f.key}==${f.value}`);
    }
  }

  if (request.body.type === 'form-data') {
    parts.push('--multipart');
    for (const f of request.body.formData.filter(x => x.enabled)) {
      parts.push(`${f.key}='${f.value}'`);
    }
  }

  return parts.join(' \\\n  ');
}
