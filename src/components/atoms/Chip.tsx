// Filter chips — used in History and Collections screens

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/theme';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const Chip: React.FC<Props> = ({ label, active, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.base,
        active ? styles.active : styles.inactive,
      ]}>
      <Text
        style={[
          styles.text,
          { color: active ? Colors.accent.primary : Colors.text.muted },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: Spacing.xs,
  },
  active: {
    backgroundColor: Colors.accent.dim,
    borderColor: Colors.accent.border,
  },
  inactive: {
    backgroundColor: 'transparent',
    borderColor: Colors.border.subtle,
  },
  text: {
    ...Typography.bodySm,
    fontSize: 12,
    fontWeight: '500',
  },
});
