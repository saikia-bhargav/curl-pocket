// Generic count/label badge — used for tab count indicators,
// collection request counts, etc.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Typography } from '@/theme';

interface Props {
  count: number;
  color?: string;
  bgColor?: string;
  max?: number;           // cap display at this number, e.g. 99
}

export const Badge: React.FC<Props> = ({
  count,
  color = Colors.text.accent,
  bgColor = Colors.accent.dim,
  max = 99,
}) => {
  if (count <= 0) { return null; }
  const label = count > max ? `${max}+` : `${count}`;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.monoXs,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
