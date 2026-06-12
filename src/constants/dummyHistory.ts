// Shared dummy history entries — used by both HistoryScreen (preview)
// and HistoryDetailScreen (navigation target).
// Auto-removed once the user sends a real request.

import type { HistoryEntry } from '@/types/history';

const now = Date.now();

export const DUMMY_HISTORY_ENTRIES: HistoryEntry[] = [
  {
    id: 'demo-1', isFavorite: false, timestamp: now - 60_000 * 2,
    request: {
      id: 'demo-1', method: 'GET', url: 'https://api.github.com/users/octocat',
      params: [], headers: [],
      body: { type: 'none', raw: '', language: 'json', formData: [], urlEncoded: [] },
      auth: { type: 'none' }, testScript: '', name: 'GitHub User',
    },
    response: {
      status: 200, statusText: 'OK',
      headers: { 'content-type': 'application/json', 'x-ratelimit-remaining': '59' },
      body: '{"login":"octocat","id":1,"name":"The Octocat"}',
      responseTimeMs: 142, sizeBytes: 1280, timestamp: now - 60_000 * 2,
    },
  },
  {
    id: 'demo-2', isFavorite: false, timestamp: now - 60_000 * 15,
    request: {
      id: 'demo-2', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts',
      params: [], headers: [],
      body: { type: 'raw', raw: '{"title":"foo","body":"bar","userId":1}', language: 'json', formData: [], urlEncoded: [] },
      auth: { type: 'none' }, testScript: '', name: 'Create Post',
    },
    response: {
      status: 201, statusText: 'Created',
      headers: { 'content-type': 'application/json' },
      body: '{"id":101,"title":"foo"}',
      responseTimeMs: 310, sizeBytes: 256, timestamp: now - 60_000 * 15,
    },
  },
  {
    id: 'demo-3', isFavorite: false, timestamp: now - 60_000 * 40,
    request: {
      id: 'demo-3', method: 'DELETE', url: 'https://jsonplaceholder.typicode.com/posts/1',
      params: [], headers: [],
      body: { type: 'none', raw: '', language: 'json', formData: [], urlEncoded: [] },
      auth: { type: 'bearer', bearer: { token: 'my-secret-token' } }, testScript: '',
    },
    response: {
      status: 404, statusText: 'Not Found',
      headers: { 'content-type': 'text/plain' },
      body: 'Not Found',
      responseTimeMs: 89, sizeBytes: 64, timestamp: now - 60_000 * 40,
    },
  },
  {
    id: 'demo-4', isFavorite: false, timestamp: now - 60_000 * 60 * 3,
    request: {
      id: 'demo-4', method: 'GET', url: 'https://api.stripe.com/v1/charges?limit=10',
      params: [{ id: 'p1', key: 'limit', value: '10', enabled: true }],
      headers: [],
      body: { type: 'none', raw: '', language: 'json', formData: [], urlEncoded: [] },
      auth: { type: 'bearer', bearer: { token: 'sk_live_xxxx' } }, testScript: '', name: 'Stripe Charges',
    },
    response: {
      status: 401, statusText: 'Unauthorized',
      headers: { 'content-type': 'application/json' },
      body: '{"error":{"message":"No such API key","type":"invalid_request_error"}}',
      responseTimeMs: 203, sizeBytes: 512, timestamp: now - 60_000 * 60 * 3,
    },
  },
  {
    id: 'demo-5', isFavorite: false, timestamp: now - 60_000 * 60 * 26,
    request: {
      id: 'demo-5', method: 'PUT', url: 'https://api.example.com/v2/users/42',
      params: [],
      headers: [{ id: 'h1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: { type: 'raw', raw: '{"name":"Jane Doe","email":"jane@example.com"}', language: 'json', formData: [], urlEncoded: [] },
      auth: { type: 'none' }, testScript: '',
    },
    response: {
      status: 200, statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: '{"updated":true,"user":{"id":42,"name":"Jane Doe"}}',
      responseTimeMs: 188, sizeBytes: 384, timestamp: now - 60_000 * 60 * 26,
    },
  },
  {
    id: 'demo-6', isFavorite: false, timestamp: now - 60_000 * 60 * 27,
    request: {
      id: 'demo-6', method: 'GET', url: 'https://api.openai.com/v1/models',
      params: [], headers: [],
      body: { type: 'none', raw: '', language: 'json', formData: [], urlEncoded: [] },
      auth: { type: 'bearer', bearer: { token: 'sk-proj-xxx' } }, testScript: '', name: 'List Models',
    },
    response: {
      status: 500, statusText: 'Internal Server Error',
      headers: { 'content-type': 'application/json' },
      body: '{"error":{"message":"That model is currently overloaded","type":"server_error"}}',
      responseTimeMs: 4200, sizeBytes: 128, timestamp: now - 60_000 * 60 * 27,
    },
  },
];
