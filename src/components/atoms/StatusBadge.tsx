import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/theme';
import { getStatusText, getStatusCategory } from '@/types/request';

interface Props {
  code: number;
  showText?: boolean;  // show "200 OK" vs just "200"
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({
  code,
  showText = true,
  size = 'md',
}) => {
  const category = getStatusCategory(code);

  const colorMap = {
    '2xx': { text: Colors.status.success, bg: Colors.status.successDim },
    '3xx': { text: Colors.status.warning, bg: Colors.status.warningDim },
    '4xx': { text: Colors.status.error,   bg: Colors.status.errorDim },
    '5xx': { text: '#FF3B3B',             bg: 'rgba(255,59,59,0.12)' },
    'unknown': { text: Colors.text.muted, bg: 'rgba(122,127,142,0.12)' },
  };

  const { text: textColor, bg: bgColor } = colorMap[category];
  const label = showText ? `${code} ${getStatusText(code)}` : `${code}`;

  return (
    <View style={[styles.base, size === 'sm' && styles.sm, { backgroundColor: bgColor }]}>
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          { color: textColor },
        ]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  sm: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  text: {
    ...Typography.monoBold,
    fontSize: 12,
  },
  textSm: {
    fontSize: 10,
  },
});
