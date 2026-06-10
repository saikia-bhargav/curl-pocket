import axios from 'axios';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';
import { REQUEST_TIMEOUT_MS, MAX_RESPONSE_BODY_SIZE } from '@/constants';
import { getStatusText } from '@/types/request';
import { useHistoryStore } from '@/store/historySlice';
import type { ApiRequest, ApiResponse } from '@/types/request';

export async function sendRequest(request: ApiRequest): Promise<ApiResponse> {
  const startTime = Date.now();

  // ── Query params ────────────────────────────────────────────
  const params: Record<string, string> = {};
  for (const p of request.params) {
    if (p.enabled && p.key.trim()) {
      params[p.key.trim()] = p.value;
    }
  }

  // ── Headers ─────────────────────────────────────────────────
  const headers: Record<string, string> = {};
  for (const h of request.headers) {
    if (h.enabled && h.key.trim()) {
      headers[h.key.trim()] = h.value;
    }
  }

  // ── Auth injection ───────────────────────────────────────────
  switch (request.auth.type) {
    case 'bearer':
      if (request.auth.bearer?.token) {
        headers['Authorization'] = `Bearer ${request.auth.bearer.token}`;
      }
      break;
    case 'basic':
      if (request.auth.basic) {
        const { username, password } = request.auth.basic;
        // btoa is a global in Hermes/RN; cast needed for strict TS lib
        const encoded = (globalThis as unknown as { btoa: (s: string) => string }).btoa(`${username}:${password}`);
        headers['Authorization'] = `Basic ${encoded}`;
      }
      break;
    case 'api-key':
      if (request.auth.apiKey) {
        const { key, value, placement } = request.auth.apiKey;
        if (placement === 'header') {
          headers[key] = value;
        } else {
          params[key] = value;
        }
      }
      break;
    default:
      break;
  }

  // ── Request body ─────────────────────────────────────────────
  let data: unknown;
  if (request.body.type === 'raw' && request.body.raw.trim()) {
    data = request.body.raw;
    if (!headers['Content-Type']) {
      const ctMap: Record<string, string> = {
        json:       'application/json',
        xml:        'application/xml',
        html:       'text/html',
        text:       'text/plain',
        javascript: 'application/javascript',
      };
      headers['Content-Type'] = ctMap[request.body.language] ?? 'text/plain';
    }
  } else if (request.body.type === 'urlencoded') {
    data = request.body.urlEncoded
      .filter(p => p.enabled && p.key)
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  // ── Axios request ─────────────────────────────────────────────
  const config: AxiosRequestConfig = {
    method: request.method.toLowerCase(),
    url: request.url,
    params,
    headers,
    data,
    timeout: REQUEST_TIMEOUT_MS,
    validateStatus: () => true,   // never throw on HTTP error codes
    transformResponse: [d => d],  // keep body as raw string
  };

  let axiosRes: AxiosResponse<string>;
  try {
    axiosRes = (await axios.request<string>(config)) as AxiosResponse<string>;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network request failed';
    throw new Error(msg);
  }

  const responseTimeMs = Date.now() - startTime;

  // ── Body ──────────────────────────────────────────────────────
  const rawBody =
    typeof axiosRes.data === 'string'
      ? axiosRes.data
      : JSON.stringify(axiosRes.data);
  const body = rawBody.slice(0, MAX_RESPONSE_BODY_SIZE);

  let bodyParsed: unknown;
  try { bodyParsed = JSON.parse(body); } catch { /* not JSON */ }

  // Byte size — TextEncoder is a Hermes global on RN ≥ 0.71; cast for TS lib
  let sizeBytes = body.length;
  try {
    const enc = (globalThis as unknown as { TextEncoder: new() => { encode: (s: string) => Uint8Array } }).TextEncoder;
    sizeBytes = new enc().encode(body).length;
  } catch { /* fall back to char count */ }

  // ── Response headers ──────────────────────────────────────────
  const responseHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(axiosRes.headers)) {
    if (typeof v === 'string') {
      responseHeaders[k] = v;
    } else if (Array.isArray(v)) {
      responseHeaders[k] = (v as string[]).join(', ');
    }
  }

  const response: ApiResponse = {
    status: axiosRes.status,
    statusText: axiosRes.statusText || getStatusText(axiosRes.status),
    headers: responseHeaders,
    body,
    bodyParsed,
    responseTimeMs,
    sizeBytes,
    timestamp: Date.now(),
  };

  // Persist to history synchronously (zustand getState)
  useHistoryStore.getState().addEntry(request, response);

  return response;
}
