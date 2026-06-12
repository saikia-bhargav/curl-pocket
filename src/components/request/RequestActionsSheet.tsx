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

export interface RequestActionsSheetHandle {
  expand: () => void;
  close: () => void;
}

interface Props {
  onImport: () => void;
  onExport: () => void;
}

const SHEET_HEIGHT = 200;
const ANIM_DURATION = 240;

export const RequestActionsSheet = forwardRef<RequestActionsSheetHandle, Props>(
  ({ onImport, onExport }, ref) => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);

    const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
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

    const handleImport = useCallback(() => {
      close();
      setTimeout(() => {
        onImport();
      }, 300);
    }, [close, onImport]);

    const handleExport = useCallback(() => {
      close();
      setTimeout(() => {
        onExport();
      }, 300);
    }, [close, onExport]);

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
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.options}>
            <TouchableOpacity onPress={handleImport} activeOpacity={0.7} style={styles.optionRow}>
              <Icon name="file-import-outline" size={24} color={Colors.text.primary} />
              <Text style={styles.optionLabel}>Import cURL</Text>
            </TouchableOpacity>

            <Divider />

            <TouchableOpacity onPress={handleExport} activeOpacity={0.7} style={styles.optionRow}>
              <Icon name="code-braces" size={24} color={Colors.text.primary} />
              <Text style={styles.optionLabel}>Export Code</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    );
  },
);

RequestActionsSheet.displayName = 'RequestActionsSheet';

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
  options: {
    paddingTop: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  optionLabel: {
    ...Typography.bodyLg,
    color: Colors.text.primary,
  },
});
