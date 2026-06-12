import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
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
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { Divider } from '@/components/atoms/Divider';
import { PrimaryButton } from '@/components/atoms/PrimaryButton';
import type { ApiRequest } from '@/types/request';
import { toCurl, toFetch, toAxios, toHttpie } from '@/services/curlGenerator';

export interface ExportSheetHandle {
  expand: () => void;
  close: () => void;
}

interface Props {
  request: ApiRequest | null;
}

type ExportFormat = 'curl' | 'fetch' | 'axios' | 'httpie';

const FORMATS: { id: ExportFormat; label: string; lang: string }[] = [
  { id: 'curl', label: 'cURL', lang: 'bash' },
  { id: 'fetch', label: 'fetch', lang: 'javascript' },
  { id: 'axios', label: 'Axios', lang: 'javascript' },
  { id: 'httpie', label: 'HTTPie', lang: 'bash' },
];

const SHEET_HEIGHT = Dimensions.get('window').height * 0.75;
const ANIM_DURATION = 280;

const CODE_THEME = {
  hljs: { display: 'flex', background: Colors.background.elevated, color: Colors.text.primary },
  'hljs-attr':    { color: '#79b8ff' },
  'hljs-string':  { color: '#9ecbff' },
  'hljs-number':  { color: '#f8c555' },
  'hljs-literal': { color: '#79b8ff' },
  'hljs-keyword': { color: '#f97583' },
  'hljs-comment': { color: Colors.text.muted, fontStyle: 'italic' },
};

export const ExportSheet = forwardRef<ExportSheetHandle, Props>(
  ({ request }, ref) => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const [format, setFormat] = useState<ExportFormat>('curl');

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

    const generatedCode = useMemo(() => {
      if (request === null) { return ''; }
      switch (format) {
        case 'curl':   return toCurl(request);
        case 'fetch':  return toFetch(request);
        case 'axios':  return toAxios(request);
        case 'httpie': return toHttpie(request);
        default:       return '';
      }
    }, [request, format]);

    const handleCopy = useCallback(() => {
      Clipboard.setString(generatedCode);
      Alert.alert('Copied', 'Code snippet copied to clipboard');
    }, [generatedCode]);

    const handleShare = useCallback(async () => {
      try {
        await Share.share({
          message: generatedCode,
          title: `Export ${format.toUpperCase()}`,
        });
      } catch { /* ignored */ }
    }, [generatedCode, format]);

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

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Export Request</Text>
            <TouchableOpacity onPress={close} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close" size={20} color={Colors.text.muted} />
            </TouchableOpacity>
          </View>

          <Divider />

          {/* Format Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {FORMATS.map(f => {
                const isActive = format === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setFormat(f.id)}
                    style={[styles.tabBtn, isActive && styles.tabBtnActive]}>
                    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <Divider />

          {/* Code Viewer */}
          <ScrollView style={styles.codeContainer} contentContainerStyle={styles.codeContent}>
            {request !== null ? (
              <SyntaxHighlighter
                language={FORMATS.find(f => f.id === format)?.lang ?? 'bash'}
                style={CODE_THEME}
                fontSize={13}
                fontFamily={Platform.OS === 'ios' ? 'Menlo' : 'monospace'}
                highlighter="hljs"
                CodeTag={Text}
                PreTag={Text}>
                {generatedCode}
              </SyntaxHighlighter>
            ) : (
              <Text style={styles.emptyText}>No request data</Text>
            )}
          </ScrollView>

          <Divider />

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
              <Icon name="share-variant" size={20} color={Colors.accent.primary} />
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>
            <View style={styles.copyWrapper}>
              <PrimaryButton label="Copy Code" onPress={handleCopy} />
            </View>
          </View>
        </Animated.View>
      </Modal>
    );
  },
);

ExportSheet.displayName = 'ExportSheet';

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { ...Typography.heading },
  tabsContainer: {
    backgroundColor: Colors.background.surface,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
  },
  tabBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Colors.accent.primary,
  },
  tabLabel: { ...Typography.bodySm, color: Colors.text.muted },
  tabLabelActive: { color: Colors.text.primary, fontWeight: '600' },
  codeContainer: {
    flex: 1,
    backgroundColor: Colors.background.elevated,
  },
  codeContent: {
    padding: Spacing.md,
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.accent.dim,
    borderRadius: Radius.sm,
    height: 44,
  },
  actionLabel: {
    ...Typography.bodySm,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  copyWrapper: {
    flex: 1,
  },
});
