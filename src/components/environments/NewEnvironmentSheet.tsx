// NewEnvironmentSheet — Modal + Animated slide-up (same pattern as EnvironmentPickerSheet).
// @gorhom/bottom-sheet is incompatible with Reanimated v4 in this project.

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
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { Divider } from '@/components/atoms/Divider';
import { ColorPicker } from './ColorPicker';
import { useEnvironmentsStore } from '@/store/environmentsSlice';
import { ENV_COLORS } from '@/types/environment';

export interface NewEnvironmentSheetHandle {
  open: () => void;
  close: () => void;
}

interface Props {
  onCreated?: (id: string) => void;
}

const SHEET_HEIGHT = Math.min(Dimensions.get('window').height * 0.6, 480);
const ANIM_DURATION = 260;

export const NewEnvironmentSheet = forwardRef<NewEnvironmentSheetHandle, Props>(
  ({ onCreated }, ref) => {
    const insets = useSafeAreaInsets();
    const addEnvironment = useEnvironmentsStore(s => s.addEnvironment);

    const [visible, setVisible]   = useState(false);
    const [name, setName]         = useState('');
    const [color, setColor]       = useState<string>(ENV_COLORS[0]);
    const [nameError, setNameError] = useState('');

    const slideAnim   = useRef(new Animated.Value(SHEET_HEIGHT)).current;
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
      ]).start(() => {
        setVisible(false);
        setName('');
        setColor(ENV_COLORS[0]);
        setNameError('');
      });
    }, [slideAnim, backdropAnim]);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const handleCreate = useCallback(() => {
      const trimmed = name.trim();
      if (trimmed === '') {
        setNameError('Name is required');
        return;
      }
      const id = addEnvironment(trimmed, color);
      close();
      onCreated?.(id);
    }, [name, color, addEnvironment, close, onCreated]);

    return (
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={close}>

        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={close} accessible={false}>
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + Spacing.lg,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>New environment</Text>
            <TouchableOpacity
              onPress={close}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Close">
              <Icon name="close" size={20} color={Colors.text.muted} />
            </TouchableOpacity>
          </View>

          <Divider />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.form}>
              {/* Name field */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NAME</Text>
                <TextInput
                  value={name}
                  onChangeText={text => { setName(text); setNameError(''); }}
                  placeholder="e.g. Development"
                  placeholderTextColor={Colors.text.muted}
                  autoCapitalize="words"
                  returnKeyType="done"
                  style={[styles.input, nameError !== '' && styles.inputError]}
                />
                {nameError !== '' && (
                  <Text style={styles.errorText}>{nameError}</Text>
                )}
              </View>

              {/* Color picker */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>COLOR</Text>
                <ColorPicker selectedColor={color} onSelect={setColor} />
              </View>

              {/* Preview row */}
              <View style={styles.preview}>
                <View style={[styles.previewDot, { backgroundColor: color }]} />
                <Text style={styles.previewName}>
                  {name.trim() !== '' ? name.trim() : 'Environment name'}
                </Text>
              </View>

              {/* Create button */}
              <TouchableOpacity
                onPress={handleCreate}
                activeOpacity={0.8}
                style={styles.createBtn}>
                <Text style={styles.createBtnText}>Create environment</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    );
  },
);

NewEnvironmentSheet.displayName = 'NewEnvironmentSheet';

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
  handleRow: { alignItems: 'center', paddingVertical: Spacing.sm },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border.default },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { ...Typography.heading },
  form: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  field: { gap: Spacing.sm },
  fieldLabel: { ...Typography.label },
  input: {
    ...Typography.bodyMd,
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
    height: 44,
  },
  inputError: { borderColor: Colors.status.error },
  errorText: { ...Typography.caption, color: Colors.status.error },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  previewDot: { width: 10, height: 10, borderRadius: 5 },
  previewName: { ...Typography.bodyMd, color: Colors.text.secondary },
  createBtn: {
    backgroundColor: Colors.accent.primary,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createBtnText: { ...Typography.bodyMd, color: '#fff', fontWeight: '600' },
});
