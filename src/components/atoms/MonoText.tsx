import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { TextProps, TextStyle } from 'react-native';
import { Typography, Colors } from '@/theme';

interface Props extends TextProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  bold?: boolean;
  style?: TextStyle;
}

export const MonoText: React.FC<Props> = ({
  size = 'md',
  color = Colors.text.primary,
  bold = false,
  style,
  children,
  ...rest
}) => {
  const sizeStyle = {
    xs: Typography.monoXs,
    sm: Typography.monoSm,
    md: Typography.monoMd,
    lg: Typography.monoLg,
  }[size];

  return (
    <Text
      style={[sizeStyle, bold && Typography.monoBold, { color }, style]}
      {...rest}>
      {children}
    </Text>
  );
};

// Suppress unused variable warning — StyleSheet used for potential future styles
const _styles = StyleSheet.create({});
