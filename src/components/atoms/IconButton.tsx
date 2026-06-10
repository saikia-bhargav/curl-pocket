import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, TouchTarget, Typography } from '@/theme';

interface Props {
  icon: string;                    // MaterialCommunityIcons name
  onPress: () => void;
  color?: string;
  size?: number;
  label?: string;                  // optional text below icon
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  hitSlop?: number;                // extends touch area
  accessibilityLabel?: string;
}

export const IconButton: React.FC<Props> = ({
  icon,
  onPress,
  color = Colors.text.secondary,
  size = 20,
  label,
  disabled = false,
  loading = false,
  style,
  hitSlop = 8,
  accessibilityLabel,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={{ top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }}
      activeOpacity={0.6}
      accessibilityLabel={accessibilityLabel ?? label ?? icon}
      accessibilityRole="button"
      style={[styles.container, style]}>
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Icon
          name={icon}
          size={size}
          color={disabled ? Colors.text.muted : color}
        />
      )}
      {label !== undefined && (
        <Text
          style={[styles.label, { color: disabled ? Colors.text.muted : color }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: TouchTarget.min,
    minHeight: TouchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  label: {
    ...Typography.caption,
  },
});
