import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, Radius, TouchTarget } from '@/theme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<Props> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  fullWidth = false,
}) => {
  const bgMap = {
    primary:   Colors.accent.primary,
    secondary: Colors.background.elevated,
    danger:    Colors.status.error,
  };

  const textMap = {
    primary:   Colors.text.inverse,
    secondary: Colors.text.primary,
    danger:    '#fff',
  };

  const bg = disabled ? Colors.background.elevated : bgMap[variant];
  const textColor = disabled ? Colors.text.muted : textMap[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.base,
        { backgroundColor: bg },
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: TouchTarget.min,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  label: {
    ...Typography.bodyMd,
    fontWeight: '600',
  },
});
