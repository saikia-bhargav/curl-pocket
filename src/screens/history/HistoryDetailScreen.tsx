import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { MonoText } from '@/components/atoms/MonoText';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { IconButton } from '@/components/atoms/IconButton';
import { EmptyState } from '@/components/atoms/EmptyState';
import { RequestReadOnlyView } from '@/components/history/RequestReadOnlyView';
import { useHistoryStore, selectEntryById } from '@/store/historySlice';
import { useTabsStore } from '@/store/tabsSlice';
import { formatBytes, formatDuration } from '@/utils';
import { DUMMY_HISTORY_ENTRIES } from '@/constants/dummyHistory';
import type { HistoryDetailScreenProps } from '@/navigation/types';

export const HistoryDetailScreen: React.FC<HistoryDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { entryId }    = route.params;
  const storeEntry     = useHistoryStore(selectEntryById(entryId));
  const entry          = storeEntry ?? DUMMY_HISTORY_ENTRIES.find(e => e.id === entryId);
  const toggleFavorite = useHistoryStore(s => s.toggleFavorite);
  const deleteEntry    = useHistoryStore(s => s.deleteEntry);
  const addTabWithData = useTabsStore(s => s.addTabWithData);

  // ── Load into Request Builder ──────────────────────────────
  const handleLoadIntoBuilder = useCallback(() => {
    if (entry === undefined) { return; }

    // Prefer adding a fresh tab so we don't clobber the current one
    addTabWithData({
      method: entry.request.method,
      url:    entry.request.url,
      title:  entry.request.name ?? entry.request.url,
    });

    navigation.navigate('RequestTab', { screen: 'RequestBuilder' });
  }, [entry, addTabWithData, navigation]);

  // ── Share ──────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    if (entry === undefined) { return; }
    const text = [
      `${entry.request.method} ${entry.request.url}`,
      `Status: ${entry.response.status}`,
      `Time: ${formatDuration(entry.response.responseTimeMs)}`,
      `Size: ${formatBytes(entry.response.sizeBytes)}`,
    ].join('\n');

    Share.share({ message: text }).catch(() => {});
  }, [entry]);

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (entry === undefined) { return; }
    Alert.alert('Delete entry', 'Remove this request from history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deleteEntry(entry.id);
        navigation.goBack();
      }},
    ]);
  }, [entry, deleteEntry, navigation]);

  // ── Response body preview ──────────────────────────────────
  const responseBodyPreview = useMemo(() => {
    if (entry === undefined) { return ''; }
    const body = entry.response.body;
    return typeof body === 'string' ? body.slice(0, 4000) : '';
  }, [entry]);

  if (entry === undefined) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <EmptyState icon="alert-circle-outline" title="Entry not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {entry.request.name ?? entry.request.method}
        </Text>
        <View style={styles.headerActions}>
          <IconButton
            icon={entry.isFavorite ? 'star' : 'star-outline'}
            onPress={() => toggleFavorite(entryId)}
            color={entry.isFavorite ? Colors.status.warning : Colors.text.muted}
            accessibilityLabel={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          />
          <IconButton
            icon="share-variant-outline"
            onPress={handleShare}
            color={Colors.text.secondary}
            accessibilityLabel="Share request details"
          />
          <IconButton
            icon="delete"
            onPress={handleDelete}
            color={Colors.status.error}
            accessibilityLabel="Delete this entry"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Response summary card ── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <StatusBadge code={entry.response.status} />
            <Text style={styles.summaryTime}>
              {new Date(entry.timestamp).toLocaleString('en-US', {
                month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Time</Text>
              <MonoText size="sm" color={Colors.accent.primary}>
                {formatDuration(entry.response.responseTimeMs)}
              </MonoText>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Size</Text>
              <MonoText size="sm" color={Colors.text.primary}>
                {formatBytes(entry.response.sizeBytes)}
              </MonoText>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Status</Text>
              <MonoText size="sm" color={Colors.text.primary}>
                {entry.response.statusText}
              </MonoText>
            </View>
          </View>
        </View>

        {/* ── Load into builder CTA ── */}
        <TouchableOpacity style={styles.loadBtn} onPress={handleLoadIntoBuilder} activeOpacity={0.8}>
          <Icon name="play" size={18} color={Colors.text.inverse} />
          <Text style={styles.loadBtnText}>Open in Request Builder</Text>
        </TouchableOpacity>

        {/* ── Request read-only view ── */}
        <Text style={styles.sectionTitle}>Request</Text>
        <RequestReadOnlyView request={entry.request} />

        {/* ── Response body ── */}
        <Text style={styles.sectionTitle}>Response Body</Text>
        <View style={styles.bodyCard}>
          {responseBodyPreview.length === 0 ? (
            <Text style={styles.emptyBody}>No response body</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator style={styles.bodyScroll}>
              <MonoText size="sm" style={styles.bodyText}>{responseBodyPreview}</MonoText>
            </ScrollView>
          )}
        </View>

        {/* ── Response headers ── */}
        <Text style={styles.sectionTitle}>Response Headers</Text>
        <View style={styles.headersCard}>
          {Object.entries(entry.response.headers).map(([k, v]) => (
            <View key={k} style={styles.headerRow}>
              <MonoText size="sm" color={Colors.text.accent} style={styles.hKey} numberOfLines={1}>
                {k}
              </MonoText>
              <MonoText size="sm" color={Colors.text.primary} style={styles.hVal} numberOfLines={1}>
                {String(v)}
              </MonoText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { ...Typography.heading, flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },

  // Scroll
  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxxl },

  // Summary
  summaryCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTime: { ...Typography.caption, color: Colors.text.muted },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metric: { alignItems: 'center', gap: 4 },
  metricLabel: { ...Typography.caption, color: Colors.text.muted },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: Colors.border.subtle,
  },

  // Load button
  loadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  loadBtnText: {
    ...Typography.bodyMd,
    color: Colors.text.inverse,
    fontWeight: '600',
  },

  // Section titles
  sectionTitle: {
    ...Typography.label,
    marginBottom: -Spacing.xs,
  },

  // Body card
  bodyCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
  },
  bodyScroll: {
    padding: Spacing.md,
    maxHeight: 300,
  },
  bodyText: { lineHeight: 20 },
  emptyBody: {
    ...Typography.bodySm,
    color: Colors.text.muted,
    textAlign: 'center',
    padding: Spacing.xl,
  },

  // Headers card
  headersCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  hKey: { flex: 1, minWidth: 80 },
  hVal: { flex: 2 },
});
