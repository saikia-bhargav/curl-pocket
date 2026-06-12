// A single row in the history list.
//
// Two-line layout:
//   [MethodBadge]  /path/and?query                       200 OK  (▶)
//                  142ms  ·  3m ago

import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing } from '@/theme';
import { MethodBadge } from '@/components/atoms/MethodBadge';
import { useRelativeTime } from '@/hooks/useRelativeTime';
import { formatDuration } from '@/utils';
import type { HistoryEntry } from '@/types/history';

function getStatusColor(code: number) {
  if (code >= 200 && code < 300) return Colors.status.success;
  if (code >= 300 && code < 400) return Colors.status.warning;
  if (code >= 400 && code < 500) return Colors.status.error;
  if (code >= 500) return '#FF3B3B'; // Same red used across the app
  return Colors.text.muted;
}

interface Props {
  entry: HistoryEntry;
  onPress: (entry: HistoryEntry) => void;
  onRerun: (entry: HistoryEntry) => void;
}

export const HistoryRowItem: React.FC<Props> = memo(({ entry, onPress, onRerun }) => {
  const relativeTime = useRelativeTime(entry.timestamp);
  const handlePress = useCallback(() => onPress(entry), [entry, onPress]);
  const handleRerun = useCallback(() => onRerun(entry), [entry, onRerun]);

  // Show path + query instead of full origin to keep rows compact
  const displayUrl = (() => {
    try {
      const u = new URL(entry.request.url);
      return (u.pathname + u.search) || entry.request.url;
    } catch {
      return entry.request.url;
    }
  })();

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.6} style={styles.row}>
      {/* Left — method badge */}
      <MethodBadge method={entry.request.method} size="sm" />

      {/* Center — two lines */}
      <View style={styles.body}>
        {/* Line 1: URL */}
        <Text style={styles.url} numberOfLines={1} ellipsizeMode="middle">
          {displayUrl}
        </Text>

        {/* Line 2: duration · time */}
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {formatDuration(entry.response.responseTimeMs)}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>{relativeTime}</Text>
        </View>
      </View>

      <View style={styles.ctaContainer}>
        <TouchableOpacity
          onPress={handleRerun}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
          style={styles.rerunBtn}
          accessibilityLabel="Open in Request Builder">
          <Icon name="play" size={12} color={Colors.accent.primary} />
        </TouchableOpacity>
        <Text style={[styles.statusText, { color: getStatusColor(entry.response.status) }]}>
          {entry.response.status} {entry.response.statusText}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

HistoryRowItem.displayName = 'HistoryRowItem';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    gap: Spacing.md,
  },
  body: {
    flex: 1,
    gap: 4,
    overflow: 'hidden',
    marginTop: 1
  },
  url: {
    ...Typography.monoSm,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    ...Typography.caption,
    color: Colors.text.muted,
    lineHeight: 16,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.text.muted,
    lineHeight: 16,
  },
  ctaContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: -Spacing.xs,
    gap: Spacing.xs,
  },
  statusText: {
    ...Typography.monoSm,
    fontSize: 11,
    fontWeight: '600',
  },
  rerunBtn: {
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: Colors.accent.dim,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.accent.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
