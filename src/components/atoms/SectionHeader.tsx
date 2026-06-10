import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/theme';

// ReactNode lives in the 'react' package, not 'react-native'
type ReactNode = React.ReactNode;

interface Props {
  title: string;
  rightAction?: ReactNode;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<Props> = ({
  title,
  rightAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      {rightAction !== undefined && (
        <View style={styles.right}>{rightAction}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
  },
  title: {
    ...Typography.label,
    flex: 1,
  },
  right: {
    marginLeft: Spacing.sm,
  },
});
