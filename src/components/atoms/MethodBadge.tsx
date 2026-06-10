import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/theme';
import type { HttpMethod } from '@/types/request';

interface Props {
  method: HttpMethod;
  size?: 'sm' | 'md' | 'lg';
}

export const MethodBadge: React.FC<Props> = ({ method, size = 'md' }) => {
  const color = Colors.method[method] ?? Colors.text.muted;
  const bgColor = Colors.methodDim[method] ?? 'rgba(122,127,142,0.12)';

  return (
    <View style={[styles.base, styles[size], { backgroundColor: bgColor }]}>
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          size === 'lg' && styles.textLg,
          { color },
        ]}
        numberOfLines={1}>
        {method}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    minWidth: 36,
  },
  md: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    minWidth: 48,
  },
  lg: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minWidth: 60,
  },
  text: {
    ...Typography.monoBold,
    fontSize: 12,
    textAlign: 'center',
  },
  textSm: {
    fontSize: 10,
  },
  textLg: {
    fontSize: 14,
  },
});
