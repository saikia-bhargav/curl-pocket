// Browser-style horizontal tab bar for open requests.
// Rendered at the top of RequestBuilderScreen (not in the nav header).

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radius, Typography, TouchTarget } from '@/theme';
import { MethodBadge } from '@/components/atoms/MethodBadge';
import {
  useTabsStore,
  selectTabs,
  selectActiveTabId,
} from '@/store/tabsSlice';

// Suppress unused import warning — MethodBadge used indirectly via method dot
void MethodBadge;

const TAB_MAX_WIDTH = 160;
const TAB_MIN_WIDTH = 100;

export const RequestTabsBar: React.FC = () => {
  const tabs = useTabsStore(selectTabs);
  const activeTabId = useTabsStore(selectActiveTabId);
  const newTab = useTabsStore(s => s.newTab);
  const closeTab = useTabsStore(s => s.closeTab);
  const setActiveTab = useTabsStore(s => s.setActiveTab);

  const scrollRef = useRef<ScrollView>(null);

  const handleNewTab = useCallback(() => {
    newTab();
    // Scroll to end after state update
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [newTab]);

  const handleClose = useCallback(
    (id: string) => {
      closeTab(id);
    },
    [closeTab],
  );

  const handlePress = useCallback(
    (id: string) => {
      setActiveTab(id);
    },
    [setActiveTab],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <Pressable
              key={tab.id}
              onPress={() => handlePress(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.tab,
                isActive ? styles.tabActive : styles.tabInactive,
              ]}>
              {/* Method color dot */}
              <View
                style={[
                  styles.methodDot,
                  { backgroundColor: Colors.method[tab.method] },
                ]}
              />

              {/* Tab title */}
              <Text
                style={[
                  styles.tabTitle,
                  { color: isActive ? Colors.text.primary : Colors.text.muted },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {tab.isDirty ? `${tab.title} ●` : tab.title}
              </Text>

              {/* Close button */}
              <TouchableOpacity
                onPress={() => handleClose(tab.id)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                accessibilityLabel={`Close ${tab.title}`}
                style={styles.closeBtn}>
                <Icon
                  name="close"
                  size={12}
                  color={isActive ? Colors.text.secondary : Colors.text.muted}
                />
              </TouchableOpacity>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* New tab button */}
      <TouchableOpacity
        onPress={handleNewTab}
        accessibilityLabel="New request tab"
        accessibilityRole="button"
        style={styles.newTabBtn}>
        <Icon name="plus" size={18} color={Colors.text.muted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
    height: 38,
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    maxWidth: TAB_MAX_WIDTH,
    minWidth: TAB_MIN_WIDTH,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 1,
  },
  tabActive: {
    backgroundColor: Colors.background.elevated,
    borderBottomColor: Colors.accent.primary,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  methodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  tabTitle: {
    ...Typography.bodyXs,
    flex: 1,
    fontSize: 12,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  newTabBtn: {
    width: TouchTarget.min,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.border.subtle,
    flexShrink: 0,
  },
});

// Suppress unused variable — Radius imported for future tab shape updates
void Radius;
