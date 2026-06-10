// Modal-based method picker — avoids @gorhom/bottom-sheet (incompatible with Reanimated v4)

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
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { MethodBadge } from '@/components/atoms/MethodBadge';
import { Divider } from '@/components/atoms/Divider';
import { HTTP_METHODS } from '@/constants';
import type { HttpMethod } from '@/types/request';

export interface MethodPickerSheetHandle {
  open: () => void;
  close: () => void;
}

interface Props {
  currentMethod: HttpMethod;
  onSelect: (method: HttpMethod) => void;
}

const SHEET_HEIGHT = HTTP_METHODS.length * 56 + 96;
const ANIM_MS = 240;

export const MethodPickerSheet = forwardRef<MethodPickerSheetHandle, Props>(
  ({ currentMethod, onSelect }, ref) => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    const openSheet = useCallback(() => {
      setVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: ANIM_MS, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: ANIM_MS, useNativeDriver: true }),
      ]).start();
    }, [slideAnim, backdropAnim]);

    const closeSheet = useCallback(() => {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: ANIM_MS, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: ANIM_MS, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, [slideAnim, backdropAnim]);

    useImperativeHandle(ref, () => ({ open: openSheet, close: closeSheet }), [
      openSheet, closeSheet,
    ]);

    const handleSelect = useCallback(
      (method: HttpMethod) => {
        onSelect(method);
        closeSheet();
      },
      [onSelect, closeSheet],
    );

    const renderItem = useCallback(
      ({ item }: { item: string }) => {
        const method = item as HttpMethod;
        const isActive = method === currentMethod;
        return (
          <TouchableOpacity
            onPress={() => handleSelect(method)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ checked: isActive }}
            style={[styles.methodRow, isActive && styles.methodRowActive]}>
            <MethodBadge method={method} size="md" />
            <Text
              style={[
                styles.methodName,
                isActive && { color: Colors.method[method] },
              ]}>
              {method}
            </Text>
            {isActive && (
              <Icon name="check" size={18} color={Colors.method[method]} />
            )}
          </TouchableOpacity>
        );
      },
      [currentMethod, handleSelect],
    );

    return (
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={closeSheet}>
        <TouchableWithoutFeedback onPress={closeSheet} accessible={false}>
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + Spacing.md,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <Text style={styles.sheetTitle}>HTTP Method</Text>
          <Divider />
          <FlatList
            data={[...HTTP_METHODS]}
            keyExtractor={item => item}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <Divider />}
          />
        </Animated.View>
      </Modal>
    );
  },
);

MethodPickerSheet.displayName = 'MethodPickerSheet';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border.default,
  },
  sheetTitle: {
    ...Typography.heading,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    minHeight: 56,
  },
  methodRowActive: {
    backgroundColor: Colors.background.elevated,
  },
  methodName: {
    ...Typography.bodyMd,
    flex: 1,
  },
});
