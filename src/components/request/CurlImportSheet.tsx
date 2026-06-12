import React, { useState, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { MethodBadge } from '@/components/atoms/MethodBadge';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import { Divider } from '@/components/atoms/Divider';
import { MonoText } from '@/components/atoms/MonoText';
import { parseCurl } from '@/services/curlParser';
import { useTabsStore, selectActiveTabId } from '@/store/tabsSlice';
import type { ParseResult } from '@/services/curlParser';

export interface CurlImportSheetHandle {
  expand: () => void;
  close: () => void;
}

const SHEET_HEIGHT = Dimensions.get('window').height * 0.9;
const ANIM_DURATION = 280;

type ParseStatus = 'idle' | 'parsing' | 'valid' | 'error';

const PLACEHOLDER = `curl 'https://api.example.com/v1/users' \\
  -H 'Authorization: Bearer your-token' \\
  -H 'Content-Type: application/json' \\
  -X POST \\
  -d '{"name": "Alice", "email": "alice@example.com"}'`;

export const CurlImportSheet = forwardRef<CurlImportSheetHandle>(
  (_, ref) => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ParseStatus>('idle');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [isPasting, setIsPasting] = useState(false);
    const parseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      ]).start(() => {
        setVisible(false);
        // Reset state
        setInput('');
        setStatus('idle');
        setParseResult(null);
      });
    }, [slideAnim, backdropAnim]);

    useImperativeHandle(ref, () => ({ expand: open, close }), [open, close]);

    const activeTabId = useTabsStore(selectActiveTabId);
  const updateTab = useTabsStore(s => s.updateTab);

  // ── Real-time parsing with debounce ───────────────────────────
  const handleInputChange = useCallback((text: string) => {
    setInput(text);

    if (parseTimeoutRef.current !== null) {
      clearTimeout(parseTimeoutRef.current);
    }

    if (text.trim() === '') {
      setStatus('idle');
      setParseResult(null);
      return;
    }

    setStatus('parsing');

    parseTimeoutRef.current = setTimeout(() => {
      const result = parseCurl(text);
      setParseResult(result);
      setStatus(result.valid ? 'valid' : 'error');
    }, 400);   // 400ms debounce — fast enough to feel live
  }, []);

  // ── Paste from clipboard ──────────────────────────────────────
  const handlePaste = useCallback(async () => {
    setIsPasting(true);
    try {
      const text = await Clipboard.getString();
      if (text.trim() !== '') {
        handleInputChange(text);
      }
    } finally {
      setIsPasting(false);
    }
  }, [handleInputChange]);

  // ── Import into active request tab ────────────────────────────
  const handleImport = useCallback(() => {
    if (parseResult?.valid !== true || parseResult.request === undefined || !activeTabId) {
      return;
    }

    const req = parseResult.request;

    updateTab(activeTabId, {
      method: req.method ?? 'GET',
      url: req.url ?? '',
      title: req.url ?? 'Imported request',
      isDirty: true,
    });

    // Broadcast the full request to RequestBuilderScreen so it updates local state
    DeviceEventEmitter.emit('IMPORT_CURL', req);

      // Navigate back to Request tab
      close();
    }, [parseResult, activeTabId, updateTab, close]);

    // ── Status indicator ──────────────────────────────────────────
  const StatusIndicator = useMemo(() => {
    if (status === 'idle') { return null; }

    const config = {
      parsing: {
        icon: <ActivityIndicator size="small" color={Colors.text.muted} />,
        text: 'Parsing…',
        color: Colors.text.muted,
      },
      valid: {
        icon: <Icon name="check-circle" size={16} color={Colors.status.success} />,
        text: 'Valid cURL command',
        color: Colors.status.success,
      },
      error: {
        icon: <Icon name="alert-circle" size={16} color={Colors.status.error} />,
        text: parseResult?.error ?? 'Invalid cURL command',
        color: Colors.status.error,
      },
    }[status];

    return (
      <View style={[
        styles.statusRow,
        status === 'valid' && styles.statusValid,
        status === 'error' && styles.statusError,
      ]}>
        {config.icon}
        <Text style={[styles.statusText, { color: config.color }]} numberOfLines={2}>
          {config.text}
        </Text>
      </View>
    );
  }, [status, parseResult]);

  // ── Parse preview card ─────────────────────────────────────────
  const PreviewCard = useMemo(() => {
    if (status !== 'valid' || parseResult?.request === undefined) {
      return null;
    }

    const req = parseResult.request;
    const headerCount = req.headers?.filter(h => h.enabled).length ?? 0;
    const paramCount = req.params?.filter(p => p.enabled).length ?? 0;
    const hasBody = req.body?.type !== 'none';
    const hasAuth = req.auth?.type !== 'none';

    return (
      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>PARSED REQUEST</Text>

        {/* Method + URL */}
        <View style={styles.previewUrlRow}>
          <MethodBadge method={req.method ?? 'GET'} size="md" />
          <MonoText size="sm" style={styles.previewUrl} numberOfLines={2}>
            {req.url ?? ''}
          </MonoText>
        </View>

        {/* Chips */}
        <View style={styles.previewChips}>
          {paramCount > 0 && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {paramCount} param{paramCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {headerCount > 0 && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {headerCount} header{headerCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {hasBody && (
            <View style={[styles.chip, styles.chipAccent]}>
              <Text style={[styles.chipText, { color: Colors.accent.primary }]}>
                {req.body?.type} body
              </Text>
            </View>
          )}
          {hasAuth && (
            <View style={[styles.chip, styles.chipAccent]}>
              <Text style={[styles.chipText, { color: Colors.accent.primary }]}>
                {req.auth?.type} auth
              </Text>
            </View>
          )}
        </View>

        {/* Notes from parser */}
        {parseResult.notes !== undefined && parseResult.notes.length > 0 && (
          <View style={styles.notesContainer}>
            {parseResult.notes.map((note, idx) => (
              <View key={idx} style={styles.noteRow}>
                <Icon name="information-outline" size={14} color={Colors.status.warning} />
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }, [status, parseResult]);

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
              paddingBottom: insets.bottom,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {/* ── Handle ──────────────────────────────────────── */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* ── Custom Header ───────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Import cURL</Text>
            <TouchableOpacity
              onPress={close}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Cancel">
              <Text style={styles.headerBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
            <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">

          {/* ── Input area ─────────────────────────────────── */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>CURL COMMAND</Text>
              <TouchableOpacity
                onPress={handlePaste}
                disabled={isPasting}
                style={styles.pasteBtn}
                accessibilityLabel="Paste from clipboard">
                {isPasting
                  ? <ActivityIndicator size="small" color={Colors.accent.primary} />
                  : (
                    <>
                      <Icon name="clipboard-outline" size={14} color={Colors.accent.primary} />
                      <Text style={styles.pasteBtnLabel}>Paste</Text>
                    </>
                  )}
              </TouchableOpacity>
            </View>

            <TextInput
              value={input}
              onChangeText={handleInputChange}
              placeholder={PLACEHOLDER}
              placeholderTextColor={Colors.text.muted}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            {StatusIndicator}
          </View>

          <Divider />

          {/* ── Preview area ───────────────────────────────── */}
          {PreviewCard}

        </ScrollView>

        {/* ── Footer ─────────────────────────────────────── */}
        <View style={styles.footer}>
          <PrimaryButton
            label="Import to Request"
            onPress={handleImport}
            disabled={status !== 'valid'}
            fullWidth
          />
          </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    );
  }
);

CurlImportSheet.displayName = 'CurlImportSheet';

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
    height: SHEET_HEIGHT,
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
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  headerTitle: { ...Typography.heading },
  headerBtnText: { ...Typography.bodyMd, color: Colors.text.secondary },
  scrollContent: { paddingBottom: Spacing.xl },

  inputSection: { padding: Spacing.lg },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  inputLabel: { ...Typography.label },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.accent.dim,
    borderRadius: Radius.sm,
  },
  pasteBtnLabel: { ...Typography.bodySm, color: Colors.accent.primary, fontWeight: '500' },
  input: {
    ...Typography.monoSm,
    backgroundColor: Colors.background.surface,
    color: Colors.text.primary,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.default,
    minHeight: 180,
    padding: Spacing.md,
    textAlignVertical: 'top',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background.surface,
  },
  statusValid: { backgroundColor: Colors.status.successDim },
  statusError: { backgroundColor: Colors.status.errorDim },
  statusText: { ...Typography.bodySm, flex: 1 },

  previewCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.background.surface,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  previewLabel: { ...Typography.label, marginBottom: Spacing.md },
  previewUrlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  previewUrl: { flex: 1, color: Colors.text.primary, lineHeight: 20 },
  previewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.pill,
  },
  chipAccent: { backgroundColor: Colors.accent.dim },
  chipText: { ...Typography.caption, color: Colors.text.secondary, fontWeight: '500' },
  notesContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.subtle,
    gap: Spacing.sm,
  },
  noteRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  noteText: { ...Typography.caption, color: Colors.status.warning, flex: 1 },

  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.background.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.subtle,
  },
});
