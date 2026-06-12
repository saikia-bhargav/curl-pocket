// EnvironmentPickerSheet — reimplemented with RN Modal + Animated.
// @gorhom/bottom-sheet is incompatible with react-native-reanimated v4.

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
  StyleSheet,
  FlatList,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { Divider } from '@/components/atoms/Divider';
import {
  useEnvironmentsStore,
  selectActiveEnvironment,
} from '@/store/environmentsSlice';
import type { Environment } from '@/types/environment';
import { useAppNavigation } from '@/navigation';

// Public handle exposed via ref
export interface EnvironmentPickerSheetHandle {
  expand: () => void;
  close: () => void;
}

const SHEET_HEIGHT = Dimensions.get('window').height * 0.55;
const ANIM_DURATION = 280;

export const EnvironmentPickerSheet = forwardRef<
  EnvironmentPickerSheetHandle,
  object
>((_props, ref) => {
  const insets       = useSafeAreaInsets();
  const navigation   = useAppNavigation();
  const environments = useEnvironmentsStore(s => s.environments);
  const activeEnv    = useEnvironmentsStore(selectActiveEnvironment);
  const setActive    = useEnvironmentsStore(s => s.setActive);

  const [visible, setVisible] = useState(false);
  const slideAnim    = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const open = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: ANIM_DURATION, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 1, duration: ANIM_DURATION, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, backdropAnim]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: ANIM_DURATION, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: ANIM_DURATION, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [slideAnim, backdropAnim]);

  useImperativeHandle(ref, () => ({ expand: open, close }), [open, close]);

  const handleSelect = useCallback(
    (id: string) => { setActive(id); close(); },
    [setActive, close],
  );

  const handleNone = useCallback(
    () => { setActive(null); close(); },
    [setActive, close],
  );

  const handleManage = useCallback(() => {
    close();
    // Short delay so sheet animates away before navigating
    setTimeout(() => {
      navigation.navigate('EnvironmentsTab', { screen: 'Environments' });
    }, 300);
  }, [close, navigation]);

  const handleEditEnv = useCallback(
    (envId: string) => {
      close();
      setTimeout(() => {
        navigation.navigate('EnvironmentsTab', {
          screen: 'EnvironmentEdit',
          params: { environmentId: envId },
        });
      }, 300);
    },
    [close, navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Environment }) => {
      const isActive   = item.id === activeEnv?.id;
      const varCount   = item.variables.filter(v => v.enabled).length;
      return (
        <TouchableOpacity
          onPress={() => handleSelect(item.id)}
          activeOpacity={0.7}
          accessibilityRole="radio"
          accessibilityState={{ checked: isActive }}
          style={styles.envRow}>
          <View style={[styles.envDot, { backgroundColor: item.color }]} />
          <View style={styles.envInfo}>
            <Text style={styles.envName}>{item.name}</Text>
            <Text style={styles.envMeta}>
              {varCount} variable{varCount !== 1 ? 's' : ''}
            </Text>
          </View>
          {isActive && (
            <Icon name="check" size={18} color={Colors.accent.primary} />
          )}
          <TouchableOpacity
            onPress={() => handleEditEnv(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Edit ${item.name}`}
            style={styles.editBtn}>
            <Icon name="pencil-outline" size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [activeEnv, handleSelect, handleEditEnv],
  );

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={close}>

      <TouchableWithoutFeedback onPress={close} accessible={false}>
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
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Environments</Text>
          <TouchableOpacity
            onPress={close}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Close">
            <Icon name="close" size={20} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>

        <Divider />

        <FlatList
          data={environments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <Divider />}
        />

        <Divider />

        {/* No environment option */}
        <TouchableOpacity onPress={handleNone} activeOpacity={0.7} style={styles.envRow}>
          <View style={[styles.envDot, { backgroundColor: Colors.text.muted }]} />
          <View style={styles.envInfo}>
            <Text style={[styles.envName, { color: Colors.text.muted }]}>No environment</Text>
          </View>
          {activeEnv === null && (
            <Icon name="check" size={18} color={Colors.accent.primary} />
          )}
        </TouchableOpacity>

        <Divider />

        {/* Manage environments */}
        <TouchableOpacity onPress={handleManage} activeOpacity={0.7} style={styles.manageBtn}>
          <Icon name="cog-outline" size={18} color={Colors.accent.primary} />
          <Text style={styles.manageBtnLabel}>Manage environments</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
});

EnvironmentPickerSheet.displayName = 'EnvironmentPickerSheet';

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
    minHeight: SHEET_HEIGHT,
    elevation: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
    }),
  },
  handleContainer: { alignItems: 'center', paddingVertical: Spacing.sm },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border.default },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  sheetTitle: { ...Typography.heading },
  envRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    minHeight: 52,
  },
  envDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  envInfo: { flex: 1, gap: 2 },
  envName: { ...Typography.bodyMd },
  envMeta: { ...Typography.caption },
  editBtn: { padding: Spacing.xs },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    minHeight: 52,
  },
  manageBtnLabel: { ...Typography.bodyMd, color: Colors.accent.primary },
});
