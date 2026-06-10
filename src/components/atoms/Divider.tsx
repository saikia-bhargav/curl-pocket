import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/theme';

interface Props {
  style?: ViewStyle;
  vertical?: boolean;
  color?: string;
}

export const Divider: React.FC<Props> = ({
  style,
  vertical = false,
  color = Colors.border.subtle,
}) => {
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: color },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: Spacing.xs,
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.xs,
  },
});
