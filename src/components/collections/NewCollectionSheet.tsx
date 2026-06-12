import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';

export interface NewCollectionSheetHandle {
  open: () => void;
  close: () => void;
}

interface Props {
  onSubmit: (name: string, color: string) => void;
}

const PALETTE = [
  '#9ecbff', // Blue
  '#f97583', // Red
  '#85e89d', // Green
  '#b392f0', // Purple
  '#f8c555', // Yellow
  '#ffab70', // Orange
  '#79b8ff', // Light Blue
  '#d1d5da', // Gray
];

const ANIM_MS = 240;

export const NewCollectionSheet = forwardRef<NewCollectionSheetHandle, Props>(
  ({ onSubmit }, ref) => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState(PALETTE[0]);

    const slideAnim = useRef(new Animated.Value(400)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    const openSheet = useCallback(() => {
      setName('');
      setColor(PALETTE[0]);
      setVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: ANIM_MS, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: ANIM_MS, useNativeDriver: true }),
      ]).start();
    }, [slideAnim, backdropAnim]);

    const closeSheet = useCallback(() => {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 400, duration: ANIM_MS, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: ANIM_MS, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, [slideAnim, backdropAnim]);

    useImperativeHandle(ref, () => ({ open: openSheet, close: closeSheet }), [
      openSheet, closeSheet,
    ]);

    const handleSubmit = useCallback(() => {
      if (!name.trim()) return;
      onSubmit(name.trim(), color);
      closeSheet();
    }, [name, color, onSubmit, closeSheet]);

    return (
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={closeSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback onPress={closeSheet}>
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
            <Text style={styles.sheetTitle}>New Collection</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. User Management API"
                placeholderTextColor={Colors.text.muted}
                style={styles.input}
                autoFocus
              />

              <Text style={styles.label}>Color</Text>
              <View style={styles.palette}>
                {PALETTE.map(c => (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.7}
                    onPress={() => setColor(c)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: c },
                      color === c && styles.colorSwatchActive,
                    ]}>
                    {color === c && (
                      <Icon name="check" size={20} color="#000" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!name.trim()}
                style={[styles.btn, !name.trim() && styles.btnDisabled]}>
                <Text style={styles.btnText}>Create Collection</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

NewCollectionSheet.displayName = 'NewCollectionSheet';

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
  form: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  label: {
    ...Typography.label,
    marginTop: Spacing.sm,
  },
  input: {
    ...Typography.bodyMd,
    height: 48,
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.text.primary,
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: Colors.background.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  btn: {
    height: 48,
    backgroundColor: Colors.accent.primary,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    ...Typography.bodyMd,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
