// Tappable badge shown in the header right slot of RequestBuilderScreen.
// Opens EnvironmentPickerSheet on press.

import React, { useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import {
  useEnvironmentsStore,
  selectActiveEnvironment,
} from '@/store/environmentsSlice';
import { EnvironmentPickerSheet } from './EnvironmentPickerSheet';
import type { EnvironmentPickerSheetHandle } from './EnvironmentPickerSheet';

export const EnvironmentBadge: React.FC = () => {
  const activeEnv = useEnvironmentsStore(selectActiveEnvironment);
  const sheetRef = useRef<EnvironmentPickerSheetHandle>(null);

  const handlePress = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  const label = activeEnv?.name ?? 'No env';
  const dotColor = activeEnv?.color ?? Colors.text.muted;

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Active environment: ${label}. Tap to change.`}
        style={styles.badge}>
        {/* Color dot */}
        <View style={[styles.dot, { backgroundColor: dotColor }]} />

        {/* Environment name */}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>

        {/* Chevron */}
        <Icon
          name="chevron-down"
          size={14}
          color={Colors.text.muted}
        />
      </TouchableOpacity>

      <EnvironmentPickerSheet ref={sheetRef} />
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
    maxWidth: 110,
    // marginRight: Spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  label: {
    ...Typography.bodyXs,
    color: Colors.text.secondary,
    flex: 1,
    fontSize: 12,
  },
});
