// Core domain types used by atomic components.
// Full request/response types will be expanded in Prompt 3.

import type { HttpMethod, BodyType, AuthType } from '@/constants';

export type { HttpMethod, BodyType, AuthType };

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface ApiRequest {
  id: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: RequestAuth;
  testScript: string;
  name?: string;
  description?: string;
}

export interface RequestBody {
  type: BodyType;
  raw: string;
  language: 'json' | 'xml' | 'text' | 'html' | 'javascript';
  formData: KeyValuePair[];
  urlEncoded: KeyValuePair[];
}

export interface RequestAuth {
  type: AuthType;
  bearer?: { token: string };
  basic?: { username: string; password: string };
  apiKey?: { key: string; value: string; placement: 'header' | 'query' };
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  bodyParsed?: unknown;
  responseTimeMs: number;
  sizeBytes: number;
  timestamp: number;
}

// Helper: derive a human-readable status string from a code
export function getStatusText(code: number): string {
  const map: Record<number, string> = {
    200: 'OK', 201: 'Created', 204: 'No Content',
    301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
    404: 'Not Found', 405: 'Method Not Allowed', 409: 'Conflict',
    422: 'Unprocessable Entity', 429: 'Too Many Requests',
    500: 'Internal Server Error', 502: 'Bad Gateway',
    503: 'Service Unavailable', 504: 'Gateway Timeout',
  };
  return map[code] ?? 'Unknown';
}

// Helper: which color bucket does a status code fall into?
export function getStatusCategory(code: number): '2xx' | '3xx' | '4xx' | '5xx' | 'unknown' {
  if (code >= 200 && code < 300) { return '2xx'; }
  if (code >= 300 && code < 400) { return '3xx'; }
  if (code >= 400 && code < 500) { return '4xx'; }
  if (code >= 500) { return '5xx'; }
  return 'unknown';
}
