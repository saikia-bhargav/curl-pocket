import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing } from '@/theme';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  action,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Icon name={icon} size={48} color={Colors.text.muted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle !== undefined && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      {action !== undefined && (
        <View style={styles.action}>{action}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  title: {
    ...Typography.heading,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: Spacing.md,
  },
});
