// A row of colored swatches. Used in NewEnvironmentSheet and EnvironmentEditScreen.

import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ENV_COLORS } from '@/types/environment';
import { Spacing } from '@/theme';

interface Props {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export const ColorPicker: React.FC<Props> = memo(({ selectedColor, onSelect }) => (
  <View style={styles.row}>
    {ENV_COLORS.map(color => (
      <TouchableOpacity
        key={color}
        onPress={() => onSelect(color)}
        accessibilityRole="radio"
        accessibilityState={{ checked: selectedColor === color }}
        accessibilityLabel={`Color ${color}`}
        style={[styles.swatch, { backgroundColor: color }]}>
        {selectedColor === color && (
          <Icon name="check" size={14} color="#000" />
        )}
      </TouchableOpacity>
    ))}
  </View>
));

ColorPicker.displayName = 'ColorPicker';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
