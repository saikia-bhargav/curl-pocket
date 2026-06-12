import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing } from '@/theme';
import { MethodBadge } from '@/components/atoms/MethodBadge';
import type { CollectionNode } from '@/types/collection';

interface CollectionTreeProps {
  nodes: CollectionNode[];
  onNodePress: (node: CollectionNode) => void;
  level: number;
}

export const CollectionTree: React.FC<CollectionTreeProps> = ({ nodes, onNodePress, level }) => {
  return (
    <View>
      {nodes.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          onNodePress={onNodePress}
          level={level}
        />
      ))}
    </View>
  );
};

interface TreeNodeProps {
  node: CollectionNode;
  onNodePress: (node: CollectionNode) => void;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onNodePress, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onNodePress(node);
    }
  };

  const paddingLeft = Spacing.lg + (level * Spacing.xl);

  if (node.type === 'folder') {
    return (
      <View>
        <TouchableOpacity
          style={[styles.row, { paddingLeft }]}
          activeOpacity={0.7}
          onPress={handlePress}>
          <Icon
            name={isExpanded ? 'folder-open-outline' : 'folder-outline'}
            size={20}
            color={Colors.text.secondary}
          />
          <Text style={styles.label} numberOfLines={1}>{node.node.name}</Text>
          <Icon
            name={isExpanded ? 'chevron-down' : 'chevron-right'}
            size={16}
            color={Colors.text.muted}
          />
        </TouchableOpacity>
        {isExpanded && node.children && (
          <CollectionTree
            nodes={node.children}
            onNodePress={onNodePress}
            level={level + 1}
          />
        )}
      </View>
    );
  }

  // Request node
  const request = node.node as import('@/types/collection').CollectionRequest;
  return (
    <TouchableOpacity
      style={[styles.row, { paddingLeft }]}
      activeOpacity={0.7}
      onPress={handlePress}>
      <MethodBadge method={request.method} size="sm" />
      <Text style={styles.label} numberOfLines={1}>{request.name || request.url}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.lg,
    gap: Spacing.sm,
  },
  label: {
    ...Typography.monoSm,
    color: Colors.text.primary,
    flex: 1,
  },
});
