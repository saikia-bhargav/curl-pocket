// Parses a cURL command string into a partial ApiRequest.
// Handles all common cURL flags used in real-world API workflows.

import { generateId } from '@/utils';
import type { ApiRequest, KeyValuePair, RequestBody, RequestAuth } from '@/types/request';
import type { HttpMethod } from '@/types/request';

export interface ParseResult {
  valid: boolean;
  error?: string;
  request?: Partial<ApiRequest>;
  notes?: string[];   // non-fatal observations e.g. "--compressed stripped"
}

// ── Token splitter ─────────────────────────────────────────────
// Splits a cURL string into tokens respecting single/double quotes
// and backslash line continuations.

function tokenize(input: string): string[] {
  // Normalise line continuations: backslash + newline → space
  const normalised = input
    .replace(/\\\r\n/g, ' ')
    .replace(/\\\n/g, ' ')
    .replace(/\\\r/g, ' ')
    .trim();

  const tokens: string[] = [];
  let current = '';
  let i = 0;
  let inSingle = false;
  let inDouble = false;

  while (i < normalised.length) {
    const ch = normalised[i];

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      i++;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      i++;
      continue;
    }

    if (ch === '\\' && inDouble && i + 1 < normalised.length) {
      // Handle escape sequences inside double quotes
      i++;
      const next = normalised[i];
      current += next === 'n' ? '\n'
        : next === 't' ? '\t'
        : next === '"' ? '"'
        : next === '\\' ? '\\'
        : `\\${next}`;
      i++;
      continue;
    }

    if ((ch === ' ' || ch === '\t') && !inSingle && !inDouble) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  if (current.length > 0) { tokens.push(current); }
  return tokens;
}

// ── Header parser ──────────────────────────────────────────────

function parseHeader(raw: string): KeyValuePair | null {
  const colonIdx = raw.indexOf(':');
  if (colonIdx === -1) { return null; }
  const key = raw.slice(0, colonIdx).trim();
  const value = raw.slice(colonIdx + 1).trim();
  if (key === '') { return null; }
  return { id: generateId(), key, value, enabled: true };
}

// ── URL param extractor ────────────────────────────────────────

function extractUrlParams(rawUrl: string): {
  baseUrl: string;
  params: KeyValuePair[];
} {
  try {
    const qIdx = rawUrl.indexOf('?');
    if (qIdx === -1) { return { baseUrl: rawUrl, params: [] }; }

    const baseUrl = rawUrl.slice(0, qIdx);
    const queryString = rawUrl.slice(qIdx + 1);
    const params: KeyValuePair[] = [];

    for (const part of queryString.split('&')) {
      const eqIdx = part.indexOf('=');
      if (eqIdx === -1) {
        params.push({
          id: generateId(),
          key: decodeURIComponent(part),
          value: '',
          enabled: true,
        });
      } else {
        params.push({
          id: generateId(),
          key: decodeURIComponent(part.slice(0, eqIdx)),
          value: decodeURIComponent(part.slice(eqIdx + 1)),
          enabled: true,
        });
      }
    }

    return { baseUrl, params };
  } catch {
    return { baseUrl: rawUrl, params: [] };
  }
}

// ── Body content-type detector ─────────────────────────────────

function detectBodyLanguage(
  body: string,
  contentType: string,
): RequestBody['language'] {
  const ct = contentType.toLowerCase();
  if (ct.includes('json')) { return 'json'; }
  if (ct.includes('xml'))  { return 'xml'; }
  if (ct.includes('html')) { return 'html'; }

  // Try auto-detecting JSON even without content-type header
  const trimmed = body.trim();
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    return 'json';
  }
  return 'text';
}

// ── Main parser ────────────────────────────────────────────────

export function parseCurl(curlString: string): ParseResult {
  const trimmed = curlString.trim();

  if (trimmed === '') {
    return { valid: false, error: 'Input is empty' };
  }

  const tokens = tokenize(trimmed);

  if (tokens.length === 0) {
    return { valid: false, error: 'No tokens found after parsing' };
  }

  // Must start with "curl"
  if (tokens[0]?.toLowerCase() !== 'curl') {
    return {
      valid: false,
      error: `Command must start with "curl" (got "${tokens[0]}")`,
    };
  }

  let url = '';
  let method: HttpMethod | null = null;
  const headers: KeyValuePair[] = [];
  let rawBody = '';
  let bodyType: 'none' | 'raw' | 'urlencoded' | 'form-data' = 'none';
  const formFields: KeyValuePair[] = [];
  const notes: string[] = [];
  let basicUser = '';
  let basicPass = '';

  let i = 1;

  while (i < tokens.length) {
    const token = tokens[i] ?? '';

    // ── Method ───────────────────────────────────────────────
    if (token === '-X' || token === '--request') {
      const val = tokens[i + 1] ?? '';
      method = val.toUpperCase() as HttpMethod;
      i += 2;
      continue;
    }

    // ── Headers ──────────────────────────────────────────────
    if (token === '-H' || token === '--header') {
      const raw = tokens[i + 1] ?? '';
      const parsed = parseHeader(raw);
      if (parsed !== null) { headers.push(parsed); }
      i += 2;
      continue;
    }

    // ── Basic auth ───────────────────────────────────────────
    if (token === '-u' || token === '--user') {
      const val = tokens[i + 1] ?? '';
      const colonIdx = val.indexOf(':');
      if (colonIdx !== -1) {
        basicUser = val.slice(0, colonIdx);
        basicPass = val.slice(colonIdx + 1);
      } else {
        basicUser = val;
      }
      i += 2;
      continue;
    }

    // ── Body: -d / --data / --data-raw ───────────────────────
    if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-ascii'
    ) {
      rawBody = tokens[i + 1] ?? '';
      bodyType = 'raw';
      i += 2;
      continue;
    }

    // ── Body: --data-binary ──────────────────────────────────
    if (token === '--data-binary') {
      rawBody = tokens[i + 1] ?? '';
      // Strip leading @ (file reference) if present
      if (rawBody.startsWith('@')) {
        rawBody = rawBody.slice(1);
        notes.push('--data-binary with @file reference — file path stripped');
      }
      bodyType = 'raw';
      i += 2;
      continue;
    }

    // ── Body: --data-urlencode ───────────────────────────────
    if (token === '--data-urlencode') {
      const val = tokens[i + 1] ?? '';
      const eqIdx = val.indexOf('=');
      if (eqIdx !== -1) {
        formFields.push({
          id: generateId(),
          key: val.slice(0, eqIdx),
          value: decodeURIComponent(val.slice(eqIdx + 1)),
          enabled: true,
        });
        bodyType = 'urlencoded';
      } else {
        rawBody = val;
        bodyType = 'raw';
      }
      i += 2;
      continue;
    }

    // ── Form data: -F / --form ───────────────────────────────
    if (token === '-F' || token === '--form') {
      const val = tokens[i + 1] ?? '';
      const eqIdx = val.indexOf('=');
      if (eqIdx !== -1) {
        formFields.push({
          id: generateId(),
          key: val.slice(0, eqIdx),
          value: val.slice(eqIdx + 1),
          enabled: true,
        });
        bodyType = 'form-data';
      }
      i += 2;
      continue;
    }

    // ── Ignored flags (strip cleanly) ────────────────────────
    if (
      token === '--compressed' ||
      token === '-k' ||
      token === '--insecure' ||
      token === '--no-keepalive' ||
      token === '-s' ||
      token === '--silent' ||
      token === '-S' ||
      token === '--show-error' ||
      token === '-v' ||
      token === '--verbose'
    ) {
      if (token === '--compressed') {
        notes.push('--compressed flag stripped (handled automatically)');
      }
      if (token === '-k' || token === '--insecure') {
        notes.push('--insecure flag stripped (SSL verification enforced)');
      }
      i++;
      continue;
    }

    // ── Flags that consume the next token (skip both) ────────
    if (
      token === '--max-time' ||
      token === '-m' ||
      token === '--connect-timeout' ||
      token === '--retry' ||
      token === '-o' ||
      token === '--output' ||
      token === '--proxy' ||
      token === '-x' ||
      token === '--user-agent' ||
      token === '-A' ||
      token === '--referer' ||
      token === '-e' ||
      token === '--cacert' ||
      token === '--cert' ||
      token === '--key'
    ) {
      notes.push(`Flag "${token}" stripped (not supported in app)`);
      i += 2;
      continue;
    }

    // ── Follow redirects (ignored — app handles automatically) ─
    if (token === '-L' || token === '--location') {
      i++;
      continue;
    }

    // ── URL — bare argument (no flag prefix) ─────────────────
    if (!token.startsWith('-') && url === '') {
      url = token;
      i++;
      continue;
    }

    // ── URL with --url flag ──────────────────────────────────
    if (token === '--url') {
      url = tokens[i + 1] ?? '';
      i += 2;
      continue;
    }

    // Unknown flag — skip
    i++;
  }

  // ── Validate URL ──────────────────────────────────────────
  if (url === '') {
    return { valid: false, error: 'No URL found in cURL command' };
  }

  // Basic URL sanity check
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') || url.startsWith('localhost')) {
      url = `https://${url}`;
      notes.push('Protocol not specified — defaulted to https://');
    } else {
      return {
        valid: false,
        error: `Invalid URL "${url}" — must start with http:// or https://`,
      };
    }
  }

  // ── Extract URL params ────────────────────────────────────
  const { baseUrl, params } = extractUrlParams(url);

  // ── Infer method if not explicitly set ────────────────────
  if (method === null) {
    if (rawBody !== '' || formFields.length > 0) {
      method = 'POST';
      notes.push('Method inferred as POST (body present, no -X flag)');
    } else {
      method = 'GET';
    }
  }

  // ── Build auth ────────────────────────────────────────────
  let auth: RequestAuth = { type: 'none' };

  if (basicUser !== '') {
    auth = {
      type: 'basic',
      basic: { username: basicUser, password: basicPass },
    };
  } else {
    // Check for Authorization header → extract bearer token
    const authHeader = headers.find(
      h => h.key.toLowerCase() === 'authorization',
    );
    if (authHeader !== undefined) {
      const val = authHeader.value;
      if (val.toLowerCase().startsWith('bearer ')) {
        auth = { type: 'bearer', bearer: { token: val.slice(7) } };
        // Remove from headers — it's captured in auth
        const idx = headers.indexOf(authHeader);
        headers.splice(idx, 1);
      }
    }
  }

  // ── Build body ────────────────────────────────────────────
  const contentTypeHeader = headers.find(
    h => h.key.toLowerCase() === 'content-type',
  );
  const contentType = contentTypeHeader?.value ?? '';

  let body: RequestBody = {
    type: 'none',
    raw: '',
    language: 'text',
    formData: [],
    urlEncoded: [],
  };

  if (bodyType === 'urlencoded' || contentType.toLowerCase().includes('urlencoded')) {
    // Parse raw body as urlencoded if it's a string
    let urlEncodedFields = [...formFields];
    if (rawBody !== '' && formFields.length === 0) {
      for (const part of rawBody.split('&')) {
        const eqIdx = part.indexOf('=');
        urlEncodedFields.push({
          id: generateId(),
          key: eqIdx !== -1 ? decodeURIComponent(part.slice(0, eqIdx)) : part,
          value: eqIdx !== -1 ? decodeURIComponent(part.slice(eqIdx + 1)) : '',
          enabled: true,
        });
      }
    }
    body = {
      type: 'urlencoded',
      raw: '',
      language: 'text',
      formData: [],
      urlEncoded: urlEncodedFields,
    };
  } else if (bodyType === 'form-data') {
    body = {
      type: 'form-data',
      raw: '',
      language: 'text',
      formData: formFields,
      urlEncoded: [],
    };
  } else if (bodyType === 'raw' && rawBody !== '') {
    body = {
      type: 'raw',
      raw: rawBody,
      language: detectBodyLanguage(rawBody, contentType),
      formData: [],
      urlEncoded: [],
    };
  }

  // ── Assemble result ───────────────────────────────────────
  const request: Partial<ApiRequest> = {
    id: generateId(),
    method,
    url: baseUrl,
    params,
    headers,
    body,
    auth,
    testScript: '',
  };

  return { valid: true, request, notes: notes.length > 0 ? notes : undefined };
}
