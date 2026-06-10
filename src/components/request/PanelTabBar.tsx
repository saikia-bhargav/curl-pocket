import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/theme';
import { Badge } from '@/components/atoms/Badge';

export interface PanelTab {
  key: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: PanelTab[];
  activeIndex: number;
  onTabChange: (index: number) => void;
}

export const PanelTabBar: React.FC<Props> = ({ tabs, activeIndex, onTabChange }) => {
  const handlePress = useCallback((index: number) => {
    onTabChange(index);
  }, [onTabChange]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handlePress(index)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[styles.tab, isActive && styles.tabActive]}>
              <View style={styles.tabContent}>
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}>
                  {tab.label}
                </Text>
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge count={tab.count} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xs,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomColor: Colors.accent.primary,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tabLabel: {
    ...Typography.bodySm,
    color: Colors.text.muted,
    fontSize: 13,
  },
  tabLabelActive: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
});
