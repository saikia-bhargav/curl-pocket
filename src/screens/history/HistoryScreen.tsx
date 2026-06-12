import React, {
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { Chip } from '@/components/atoms/Chip';
import { EmptyState } from '@/components/atoms/EmptyState';
import { HistoryRowItem } from '@/components/history/HistoryRowItem';
import { HistorySectionHeader } from '@/components/history/HistorySectionHeader';
import { ClearHistorySheet } from '@/components/history/ClearHistorySheet';
import type { ClearHistorySheetHandle } from '@/components/history/ClearHistorySheet';
import { useHistoryStore, selectAllEntries } from '@/store/historySlice';
import { useTabsStore } from '@/store/tabsSlice';
import { useHistoryFilter } from '@/hooks/useHistoryFilter';
import { DUMMY_HISTORY_ENTRIES } from '@/constants/dummyHistory';
import type { HistoryEntry, HistoryFilter } from '@/types/history';
import type { HistoryScreenProps } from '@/navigation/types';

const FILTER_OPTIONS: { label: string; value: HistoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: '2xx', value: '2xx' },
  { label: '3xx', value: '3xx' },
  { label: '4xx', value: '4xx' },
  { label: '5xx', value: '5xx' },
];



export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const rawEntries     = useHistoryStore(selectAllEntries);
  const addTabWithData = useTabsStore(s => s.addTabWithData);

  // Show dummy data when the store is empty so the screen doesn't look blank
  const entries = rawEntries.length > 0 ? rawEntries : DUMMY_HISTORY_ENTRIES;

  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');

  const clearSheetRef = useRef<ClearHistorySheetHandle>(null);

  const { sections, totalCount, filteredCount } = useHistoryFilter({
    entries,
    filter: activeFilter,
    searchQuery,
  });

  // ── Handlers ────────────────────────────────────────────────

  const handlePress = useCallback((entry: HistoryEntry) => {
    navigation.navigate('HistoryDetail', { entryId: entry.id });
  }, [navigation]);

  // Opens the request in a fresh Builder tab without actually firing it
  const handleRerun = useCallback((entry: HistoryEntry) => {
    addTabWithData({
      method: entry.request.method,
      url:    entry.request.url,
      title:  entry.request.name ?? entry.request.url,
    });
    navigation.navigate('RequestTab', { screen: 'RequestBuilder' });
  }, [addTabWithData, navigation]);

  const handleClearPress = useCallback(() => {
    clearSheetRef.current?.open();
  }, []);

  // ── Render helpers ───────────────────────────────────────────

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: HistoryEntry[] } }) => (
      <HistorySectionHeader title={section.title} count={section.data.length} />
    ), []);

  const renderItem = useCallback(
    ({ item }: { item: HistoryEntry }) => (
      <HistoryRowItem
        entry={item}
        onPress={handlePress}
        onRerun={handleRerun}
      />
    ),
    [handlePress, handleRerun]);

  const renderSeparator = useCallback(
    () => <View style={styles.itemDivider} />, []);

  const renderEmpty = useCallback(() => (
    <EmptyState
      icon={totalCount === 0 ? 'clock-outline' : 'magnify'}
      title={totalCount === 0 ? 'No history yet' : 'No results'}
      subtitle={
        totalCount === 0
          ? 'Send a request to see it appear here'
          : 'Try a different search or filter'
      }
      style={styles.emptyState}
    />
  ), [totalCount]);

  const renderFooter = useCallback(() =>
    totalCount > 0 ? (
      <TouchableOpacity onPress={handleClearPress} activeOpacity={0.7} style={styles.clearBtn}>
        <Icon name="delete-sweep-outline" size={16} color={Colors.status.error} />
        <Text style={styles.clearBtnText}>Clear history</Text>
      </TouchableOpacity>
    ) : null,
    [totalCount, handleClearPress]);

  const keyExtractor = useCallback((item: HistoryEntry) => item.id, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Search bar ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={18} color={Colors.text.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search URL or method…"
            placeholderTextColor={Colors.text.muted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close-circle" size={16} color={Colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter chips ── */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          keyboardShouldPersistTaps="handled">
          {FILTER_OPTIONS.map(opt => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={activeFilter === opt.value}
              onPress={() => setActiveFilter(opt.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Result count ── */}
      {(searchQuery.length > 0 || activeFilter !== 'all') && totalCount > 0 && (
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>
            {filteredCount} of {totalCount} requests
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* ── List ── */}
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
      />



      {/* ── Clear sheet ── */}
      <ClearHistorySheet ref={clearSheetRef} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },
  searchRow: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    height: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  searchInput: {
    ...Typography.monoSm,
    flex: 1,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  filtersWrapper: {
    height: 40,
    flexGrow: 0,
    flexShrink: 0,
  },
  filtersRow: {
    height: 40,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resultCount: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xs },
  resultCountText: { ...Typography.caption, color: Colors.text.muted },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border.subtle },
  listContent: { flexGrow: 1, paddingBottom: Spacing.xxxl },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: Spacing.lg,
  },
  emptyState: { marginTop: Spacing.xxxl },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  clearBtnText: { ...Typography.bodySm, color: Colors.status.error },
});
