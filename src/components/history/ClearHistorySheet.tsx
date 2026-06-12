// Modal-based "Clear history" sheet — replaces @gorhom/bottom-sheet
// (incompatible with react-native-reanimated v4).

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { useHistoryStore } from '@/store/historySlice';

export interface ClearHistorySheetHandle {
  open: () => void;
  close: () => void;
}

interface ClearOption {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  action: () => void;
  destructive?: boolean;
}

const ANIM_MS = 240;

export const ClearHistorySheet = forwardRef<ClearHistorySheetHandle>((_props, ref) => {
  const insets        = useSafeAreaInsets();
  const clearAll      = useHistoryStore(s => s.clearAll);
  const clearOlderThan = useHistoryStore(s => s.clearOlderThan);

  const [visible, setVisible] = useState(false);
  const slideAnim   = useRef(new Animated.Value(400)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openSheet = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 0, duration: ANIM_MS, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 1, duration: ANIM_MS, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, backdropAnim]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 400, duration: ANIM_MS, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0,  duration: ANIM_MS, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [slideAnim, backdropAnim]);

  useImperativeHandle(ref, () => ({ open: openSheet, close: closeSheet }), [
    openSheet, closeSheet,
  ]);

  const confirmClear = useCallback((label: string, action: () => void) => {
    closeSheet();
    setTimeout(() => {
      Alert.alert(
        'Clear history',
        `${label}? Favorited entries are always kept.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: action },
        ],
      );
    }, 300);
  }, [closeSheet]);

  const options: ClearOption[] = [
    {
      id: '7d',
      label: 'Clear older than 7 days',
      sublabel: 'Keep recent entries',
      icon: 'calendar-week',
      action: () => confirmClear('Clear entries older than 7 days', () => clearOlderThan(7)),
    },
    {
      id: '30d',
      label: 'Clear older than 30 days',
      sublabel: 'Keep last month',
      icon: 'calendar-month',
      action: () => confirmClear('Clear entries older than 30 days', () => clearOlderThan(30)),
    },
    {
      id: '90d',
      label: 'Clear older than 90 days',
      sublabel: 'Keep last 3 months',
      icon: 'calendar-range',
      action: () => confirmClear('Clear entries older than 90 days', () => clearOlderThan(90)),
    },
    {
      id: 'all',
      label: 'Clear all history',
      sublabel: 'Removes all non-favorited entries',
      icon: 'delete-sweep-outline',
      action: () => confirmClear('Clear all history', clearAll),
      destructive: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={closeSheet}>
      <TouchableWithoutFeedback onPress={closeSheet}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + Spacing.md, transform: [{ translateY: slideAnim }] },
        ]}>
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Clear history</Text>
          <Text style={styles.subtitle}>Favorited entries are always preserved.</Text>
        </View>

        <View style={styles.divider} />

        {options.map((opt, idx) => (
          <React.Fragment key={opt.id}>
            <TouchableOpacity onPress={opt.action} activeOpacity={0.7} style={styles.optionRow}>
              <Icon
                name={opt.icon}
                size={20}
                color={opt.destructive ? Colors.status.error : Colors.text.secondary}
              />
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, opt.destructive && { color: Colors.status.error }]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionSublabel}>{opt.sublabel}</Text>
              </View>
            </TouchableOpacity>
            {idx < options.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </Animated.View>
    </Modal>
  );
});

ClearHistorySheet.displayName = 'ClearHistorySheet';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    elevation: 24,
  },
  handleRow: { alignItems: 'center', paddingVertical: Spacing.sm },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border.default,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  title:    { ...Typography.heading },
  subtitle: { ...Typography.bodySm, color: Colors.text.muted },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: Spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    minHeight: 56,
  },
  optionText:    { flex: 1, gap: 2 },
  optionLabel:   { ...Typography.bodyMd },
  optionSublabel:{ ...Typography.caption, color: Colors.text.muted },
});
