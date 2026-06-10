export const APP_VERSION = '1.0.0';

export const REQUEST_TIMEOUT_MS = 30_000;

export const MAX_HISTORY_ENTRIES = 200;

export const MAX_RESPONSE_BODY_SIZE = 5 * 1024 * 1024; // 5MB

export const HTTP_METHODS = [
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
] as const;

export type HttpMethod = typeof HTTP_METHODS[number];

export const SUPPORTED_BODY_TYPES = [
  'none', 'raw', 'form-data', 'urlencoded', 'graphql',
] as const;

export type BodyType = typeof SUPPORTED_BODY_TYPES[number];

export const SUPPORTED_AUTH_TYPES = [
  'none', 'bearer', 'basic', 'api-key', 'oauth2',
] as const;

export type AuthType = typeof SUPPORTED_AUTH_TYPES[number];

export const SUPPORTED_LANGUAGES = [
  'json', 'xml', 'text', 'html', 'javascript',
] as const;

export type ContentLanguage = typeof SUPPORTED_LANGUAGES[number];