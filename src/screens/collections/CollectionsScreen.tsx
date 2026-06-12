import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FlashList } from '@shopify/flash-list';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { useCollectionsStore } from '@/store/collectionsSlice';
import { useTabsStore } from '@/store/tabsSlice';
import { buildCollectionTree, countCollectionItems } from '@/utils/collectionTree';
import {
  CollectionCard,
  NewCollectionSheet,
} from '@/components/collections';
import type { NewCollectionSheetHandle } from '@/components/collections';
import type { CollectionsScreenProps } from '@/navigation/types';

export const CollectionsScreen: React.FC<CollectionsScreenProps> = ({ navigation }) => {
  const collections = useCollectionsStore(s => s.collections);
  const folders = useCollectionsStore(s => s.folders);
  const requests = useCollectionsStore(s => s.requests);
  const addCollection = useCollectionsStore(s => s.addCollection);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const sheetRef = useRef<NewCollectionSheetHandle>(null);

  // Compute collections list
  const collectionList = useMemo(() => {
    let list = Object.values(collections);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    // Sort alphabetically for now
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [collections, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateCollection = (name: string, color: string) => {
    const newId = addCollection(name, color);
    navigation.navigate('CollectionDetail', { collectionId: newId });
  };

  const handleNodePress = (node: any) => {
    if (node.type === 'request') {
      navigation.navigate('CollectionRequest', {
        collectionId: node.node.collectionId,
        requestId: node.id,
      });
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={Colors.text.muted} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search collections..."
            placeholderTextColor={Colors.text.muted}
            style={styles.searchInput}
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          onPress={() => sheetRef.current?.open()}
          style={styles.newBtn}>
          <Icon name="plus" size={20} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* ── Filters ── */}
      <View style={styles.filters}>
        {(['all', 'favorites', 'recent'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ── */}
      <View style={{ flex: 1 }}>
        <FlashList
          data={collectionList}
          keyExtractor={item => item.id}
          // @ts-expect-error FlashList types are broken in this environment
          estimatedItemSize={80}
          contentContainerStyle={{ paddingVertical: Spacing.md }}
          renderItem={({ item }) => {
            const isExpanded = expandedIds.has(item.id);
            const nodes = isExpanded ? buildCollectionTree(item.id, folders, requests) : [];
            const count = countCollectionItems(item.id, folders, requests);

            return (
              <CollectionCard
                collection={item}
                itemCount={count}
                isExpanded={isExpanded}
                onToggle={() => toggleExpand(item.id)}
                onPress={() => navigation.navigate('CollectionDetail', { collectionId: item.id })}
                treeNodes={nodes}
                onNodePress={handleNodePress}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="folder-multiple-outline" size={48} color={Colors.text.muted} />
              <Text style={styles.emptyTitle}>No collections found</Text>
              <Text style={styles.emptySubtitle}>Create a new collection to group your requests.</Text>
            </View>
          }
        />
      </View>

      {/* ── Modal ── */}
      <NewCollectionSheet ref={sheetRef} onSubmit={handleCreateCollection} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.sm,
    height: 44,
    paddingHorizontal: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  searchIcon: { marginRight: Spacing.xs },
  searchInput: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.text.primary,
  },
  newBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  filterChipActive: {
    backgroundColor: Colors.accent.dim,
    borderColor: Colors.accent.border,
  },
  filterText: {
    ...Typography.bodySm,
    color: Colors.text.muted,
  },
  filterTextActive: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    ...Typography.bodyLg,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    ...Typography.bodySm,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
