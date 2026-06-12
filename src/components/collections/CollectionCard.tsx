import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import type { Collection, CollectionNode } from '@/types/collection';
import { CollectionTree } from './CollectionTree';

interface Props {
  collection: Collection;
  itemCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  onPress: () => void;
  treeNodes: CollectionNode[];
  onNodePress: (node: CollectionNode) => void;
}

export const CollectionCard: React.FC<Props> = ({
  collection,
  itemCount,
  isExpanded,
  onToggle,
  onPress,
  treeNodes,
  onNodePress,
}) => {
  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  }, [onToggle]);

  return (
    <View style={styles.card}>
      {/* Color indicator bar */}
      <View style={[styles.colorBar, { backgroundColor: collection.color }]} />

      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={handleToggle}>
        <Icon name="folder-outline" size={24} color={Colors.text.secondary} />
        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{collection.name}</Text>
          <Text style={styles.count}>{itemCount} items</Text>
        </View>

        <TouchableOpacity onPress={handleToggle} style={styles.chevronBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon
            name={isExpanded ? 'chevron-down' : 'chevron-right'}
            size={20}
            color={Colors.text.muted}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {isExpanded && treeNodes.length > 0 && (
        <View style={styles.treeContainer}>
          <CollectionTree
            nodes={treeNodes}
            onNodePress={onNodePress}
            level={0}
          />
        </View>
      )}
      {isExpanded && treeNodes.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Empty collection</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...Typography.bodyLg,
    color: Colors.text.primary,
  },
  count: {
    ...Typography.monoXs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  chevronBtn: {
    padding: Spacing.xs,
  },
  treeContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.subtle,
    paddingBottom: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodySm,
    color: Colors.text.muted,
  },
});
