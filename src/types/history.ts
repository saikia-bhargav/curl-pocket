import type { ApiRequest, ApiResponse } from './request';

export interface HistoryEntry {
  id: string;
  request: ApiRequest;
  response: ApiResponse;
  timestamp: number;       // Unix ms — when the request was sent
  isFavorite: boolean;
  collectionId?: string;   // set if saved to a collection
  name?: string;           // optional user-given name
}

// Filter options for HistoryScreen
export type HistoryFilter =
  | 'all'
  | '2xx'
  | '3xx'
  | '4xx'
  | '5xx'
  | 'favorites';

// A date-grouped section for SectionList rendering
export interface HistorySection {
  title: string;    // "Today" | "Yesterday" | "Jun 8" etc.
  dateKey: string;  // YYYY-MM-DD for stable keying
  data: HistoryEntry[];
}
