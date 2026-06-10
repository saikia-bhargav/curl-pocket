// Fully custom bottom tab bar — replaces the default RN tab bar.
// Icon-only design with a minimum 60px height + safe area insets.

import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, Spacing, TouchTarget } from '@/theme';

const TAB_BAR_HEIGHT = 56;

interface TabConfig {
  routeName: string;
  icon: string;
  activeIcon: string;
  label: string;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    routeName: 'RequestTab',
    icon: 'send-outline',
    activeIcon: 'send',
    label: 'Request',
  },
  {
    routeName: 'CollectionsTab',
    icon: 'folder-outline',
    activeIcon: 'folder',
    label: 'Collections',
  },
  {
    routeName: 'HistoryTab',
    icon: 'clock-outline',
    activeIcon: 'clock',
    label: 'History',
  },
  {
    routeName: 'EnvironmentsTab',
    icon: 'layers-outline',
    activeIcon: 'layers',
    label: 'Environments',
  },
  {
    routeName: 'SettingsTab',
    icon: 'cog-outline',
    activeIcon: 'cog',
    label: 'Settings',
  },
];

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  const handlePress = useCallback(
    (routeName: string, isFocused: boolean) => {
      if (isFocused) { return; }
      navigation.navigate(routeName);
    },
    [navigation],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: bottomPad, height: TAB_BAR_HEIGHT + bottomPad },
      ]}>
      {TAB_CONFIGS.map(config => {
        const route = state.routes.find(r => r.name === config.routeName);
        if (route === undefined) { return null; }

        const isFocused = state.routes[state.index]?.name === config.routeName;
        const iconName = isFocused ? config.activeIcon : config.icon;
        const iconColor = isFocused ? Colors.accent.primary : Colors.text.muted;

        return (
          <TouchableOpacity
            key={config.routeName}
            onPress={() => handlePress(config.routeName, isFocused)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={config.label}
            accessibilityState={{ selected: isFocused }}
            style={styles.tab}>
            {/* Active indicator dot above icon */}
            <View
              style={[
                styles.activeDot,
                { opacity: isFocused ? 1 : 0 },
              ]}
            />
            <Icon name={iconName} size={24} color={iconColor} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.subtle,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    minHeight: TouchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent.primary,
    position: 'absolute',
    top: 0,
  },
});
