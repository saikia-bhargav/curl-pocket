// Pure filter + search + grouping hook.
// No side effects — safe to call from any component.

import { useMemo } from 'react';
import type { HistoryEntry, HistoryFilter, HistorySection } from '@/types/history';
import { getStatusCategory } from '@/types/request';

interface UseHistoryFilterParams {
  entries: HistoryEntry[];
  filter: HistoryFilter;
  searchQuery: string;
}

interface UseHistoryFilterResult {
  sections: HistorySection[];
  totalCount: number;
  filteredCount: number;
}

// ── Date helpers ───────────────────────────────────────────────

function getDateLabel(timestamp: number): string {
  const entryDate = new Date(timestamp);
  const today     = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();

  if (isSameDay(entryDate, today))     { return 'Today'; }
  if (isSameDay(entryDate, yesterday)) { return 'Yesterday'; }

  const isCurrentYear = entryDate.getFullYear() === today.getFullYear();
  return entryDate.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  });
}

function getDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Filters ───────────────────────────────────────────────────

function matchesStatusFilter(entry: HistoryEntry, filter: HistoryFilter): boolean {
  switch (filter) {
    case 'all':       return true;
    case 'favorites': return entry.isFavorite;
    case '2xx':
    case '3xx':
    case '4xx':
    case '5xx':       return getStatusCategory(entry.response.status) === filter;
    default:          return true;
  }
}

function matchesSearch(entry: HistoryEntry, query: string): boolean {
  if (query.trim() === '') { return true; }
  const q      = query.toLowerCase().trim();
  const url    = entry.request.url.toLowerCase();
  const method = entry.request.method.toLowerCase();
  const name   = (entry.name ?? '').toLowerCase();
  return url.includes(q) || method.includes(q) || name.includes(q);
}

// ── Grouping ──────────────────────────────────────────────────

function groupIntoSections(entries: HistoryEntry[]): HistorySection[] {
  const sectionMap = new Map<string, HistorySection>();

  for (const entry of entries) {
    const key = getDateKey(entry.timestamp);

    if (!sectionMap.has(key)) {
      sectionMap.set(key, {
        title:   getDateLabel(entry.timestamp),
        dateKey: key,
        data:    [],
      });
    }

    sectionMap.get(key)!.data.push(entry);
  }

  return Array.from(sectionMap.values());
}

// ── Hook ──────────────────────────────────────────────────────

export function useHistoryFilter({
  entries,
  filter,
  searchQuery,
}: UseHistoryFilterParams): UseHistoryFilterResult {
  const sections = useMemo(() => {
    const filtered = entries.filter(
      entry =>
        matchesStatusFilter(entry, filter) &&
        matchesSearch(entry, searchQuery),
    );
    return groupIntoSections(filtered);
  }, [entries, filter, searchQuery]);

  const filteredCount = useMemo(
    () => sections.reduce((sum, s) => sum + s.data.length, 0),
    [sections],
  );

  return { sections, totalCount: entries.length, filteredCount };
}
