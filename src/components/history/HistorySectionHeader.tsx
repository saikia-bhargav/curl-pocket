import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/theme';

interface Props {
  title: string;
  count: number;
}

export const HistorySectionHeader: React.FC<Props> = memo(({ title, count }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.count}>{count}</Text>
  </View>
));

HistorySectionHeader.displayName = 'HistorySectionHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  title: { ...Typography.label },
  count: { ...Typography.caption, color: Colors.text.muted },
});
