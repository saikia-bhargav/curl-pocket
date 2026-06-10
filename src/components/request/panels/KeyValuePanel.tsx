// Reusable key-value panel — used for both Params and Headers.

import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing } from '@/theme';
import { KeyValueRow } from '@/components/atoms/KeyValueRow';
import { EmptyState } from '@/components/atoms/EmptyState';
import { generateId } from '@/utils';
import type { KeyValuePair } from '@/types/request';

interface Props {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  emptyIcon?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const KeyValuePanel: React.FC<Props> = ({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  emptyIcon = 'plus-circle-outline',
  emptyTitle = 'No items',
  emptySubtitle = 'Tap + to add',
}) => {
  const handleToggle = useCallback(
    (id: string, enabled: boolean) =>
      onChange(items.map(p => (p.id === id ? { ...p, enabled } : p))),
    [items, onChange],
  );

  const handleKeyChange = useCallback(
    (id: string, key: string) =>
      onChange(items.map(p => (p.id === id ? { ...p, key } : p))),
    [items, onChange],
  );

  const handleValueChange = useCallback(
    (id: string, value: string) =>
      onChange(items.map(p => (p.id === id ? { ...p, value } : p))),
    [items, onChange],
  );

  const handleDelete = useCallback(
    (id: string) => onChange(items.filter(p => p.id !== id)),
    [items, onChange],
  );

  const handleAdd = useCallback(() => {
    onChange([
      ...items,
      { id: generateId(), key: '', value: '', enabled: true },
    ]);
  }, [items, onChange]);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <KeyValueRow
            item={item}
            onToggle={handleToggle}
            onKeyChange={handleKeyChange}
            onValueChange={handleValueChange}
            onDelete={handleDelete}
            keyPlaceholder={keyPlaceholder}
            valuePlaceholder={valuePlaceholder}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            subtitle={emptySubtitle}
            style={styles.empty}
          />
        }
        keyboardShouldPersistTaps="handled"
      />

      {/* FAB — add row */}
      <TouchableOpacity
        onPress={handleAdd}
        activeOpacity={0.8}
        accessibilityLabel="Add row"
        accessibilityRole="button"
        style={styles.fab}>
        <Icon name="plus" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: {
    padding: Spacing.md,
    paddingBottom: 80,
  },
  empty: { minHeight: 200 },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});
