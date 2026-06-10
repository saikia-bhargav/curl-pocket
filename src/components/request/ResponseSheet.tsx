// ResponseSheet — Modal-based response viewer replacing @gorhom/bottom-sheet
// (incompatible with react-native-reanimated v4).
//
// Layout: slides up from bottom. Two snap heights — half (55 %) and full (92 %).
// Tabs: Pretty · Raw · Headers.  Toolbar: Copy · Share · Save · Retry.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  FlatList,
  StyleSheet,
  Share,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Divider } from '@/components/atoms/Divider';
import type { ApiResponse } from '@/types/request';

const SCREEN_H = Dimensions.get('window').height;
const HALF_H  = SCREEN_H * 0.55;
const FULL_H  = SCREEN_H * 0.92;
const ANIM_MS = 280;

// Minimal dark code theme — avoids fragile react-syntax-highlighter style paths
const CODE_THEME = {
  hljs: { display: 'flex', background: Colors.background.elevated, color: Colors.text.primary },
  'hljs-attr':    { color: '#79b8ff' },
  'hljs-string':  { color: '#9ecbff' },
  'hljs-number':  { color: '#f8c555' },
  'hljs-literal': { color: '#79b8ff' },
  'hljs-keyword': { color: '#f97583' },
  'hljs-comment': { color: Colors.text.muted, fontStyle: 'italic' },
};

interface Props {
  visible: boolean;
  response: ApiResponse;
  onClose: () => void;
  onRetry: () => void;
}

type ResponseTab = 'pretty' | 'raw' | 'headers';

function formatBytes(bytes: number): string {
  if (bytes < 1024) { return `${bytes} B`; }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`;
}

export const ResponseSheet: React.FC<Props> = ({
  visible,
  response,
  onClose,
  onRetry,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ResponseTab>('pretty');
  const [isExpanded, setIsExpanded] = useState(false);

  const heightAnim = useRef(new Animated.Value(HALF_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(HALF_H)).current;

  // Animate in when visible becomes true
  useEffect(() => {
    if (visible) {
      setIsExpanded(false);
      heightAnim.setValue(HALF_H);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIM_MS,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: ANIM_MS,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: HALF_H,
          duration: ANIM_MS,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: ANIM_MS,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim, heightAnim]);

  const toggleExpand = useCallback(() => {
    const next = !isExpanded;
    setIsExpanded(next);
    Animated.spring(heightAnim, {
      toValue: next ? FULL_H : HALF_H,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  }, [isExpanded, heightAnim]);

  // ── Toolbar actions ─────────────────────────────────────────
  const handleCopy = useCallback(() => {
    Clipboard.setString(response.body);
    Alert.alert('Copied', 'Response body copied to clipboard');
  }, [response.body]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: response.body,
        title: `Response ${response.status}`,
      });
    } catch { /* user cancelled */ }
  }, [response]);

  const handleSave = useCallback(() => {
    Alert.alert('Save', 'Save to collection coming in Prompt 6');
  }, []);

  // ── Formatted body ───────────────────────────────────────────
  const prettyBody = React.useMemo(() => {
    if (response.bodyParsed !== undefined) {
      try { return JSON.stringify(response.bodyParsed, null, 2); } catch {}
    }
    return response.body;
  }, [response]);

  // ── Headers list ─────────────────────────────────────────────
  const headerEntries = React.useMemo(
    () => Object.entries(response.headers),
    [response.headers],
  );

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}>

      {/* Backdrop (semi-transparent, tapping dismisses) */}
      <Animated.View
        pointerEvents="box-only"
        style={[styles.backdrop, { opacity: backdropAnim }]}
      />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: heightAnim,
            paddingBottom: insets.bottom,
            transform: [{ translateY: slideAnim }],
          },
        ]}>

        {/* ── Handle + expand toggle ── */}
        <TouchableOpacity
          onPress={toggleExpand}
          activeOpacity={0.7}
          accessibilityLabel={isExpanded ? 'Collapse response' : 'Expand response'}
          style={styles.handleRow}>
          <View style={styles.handle} />
          <Icon
            name={isExpanded ? 'chevron-down' : 'chevron-up'}
            size={16}
            color={Colors.text.muted}
            style={styles.expandChevron}
          />
        </TouchableOpacity>

        {/* ── Status header ── */}
        <View style={styles.statusHeader}>
          <StatusBadge code={response.status} />
          <Text style={styles.statusText}>{response.statusText}</Text>
          <View style={styles.metaRow}>
            <Icon name="clock-outline" size={12} color={Colors.text.muted} />
            <Text style={styles.meta}>{formatMs(response.responseTimeMs)}</Text>
            <Icon name="database-outline" size={12} color={Colors.text.muted} />
            <Text style={styles.meta}>{formatBytes(response.sizeBytes)}</Text>
          </View>
          {/* Close */}
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Close response">
            <Icon name="close" size={20} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* ── Tab selector ── */}
        <View style={styles.tabRow}>
          {(['pretty', 'raw', 'headers'] as ResponseTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab && styles.tabLabelActive,
                ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Divider />

        {/* ── Panel content ── */}
        {activeTab === 'pretty' && (
          <ScrollView style={styles.bodyScroll}>
            <SyntaxHighlighter
              language={
                response.headers['content-type']?.includes('json')
                  ? 'json'
                  : 'plaintext'
              }
              style={CODE_THEME}
              fontSize={12}
              fontFamily={Platform.OS === 'ios' ? 'Menlo' : 'monospace'}
              highlighter="hljs">
              {prettyBody}
            </SyntaxHighlighter>
          </ScrollView>
        )}

        {activeTab === 'raw' && (
          <ScrollView style={styles.bodyScroll}>
            <Text style={styles.rawText} selectable>
              {response.body}
            </Text>
          </ScrollView>
        )}

        {activeTab === 'headers' && (
          <FlatList
            data={headerEntries}
            keyExtractor={([k]) => k}
            renderItem={({ item: [key, val] }) => (
              <View style={styles.headerRow}>
                <Text style={styles.headerKey} numberOfLines={1}>
                  {key}
                </Text>
                <Text style={styles.headerValue} selectable numberOfLines={2}>
                  {val}
                </Text>
              </View>
            )}
            ItemSeparatorComponent={() => <Divider />}
            contentContainerStyle={{ paddingBottom: Spacing.xl }}
          />
        )}

        {/* ── Toolbar ── */}
        <Divider />
        <View style={styles.toolbar}>
          <ToolbarBtn icon="content-copy"    label="Copy"   onPress={handleCopy} />
          <ToolbarBtn icon="share-variant"   label="Share"  onPress={handleShare} />
          <ToolbarBtn icon="content-save"    label="Save"   onPress={handleSave} />
          <ToolbarBtn icon="refresh"         label="Retry"  onPress={onRetry} accent />
        </View>
      </Animated.View>
    </Modal>
  );
};

// ── Toolbar button ───────────────────────────────────────────
interface ToolbarBtnProps {
  icon: string;
  label: string;
  onPress: () => void;
  accent?: boolean;
}

const ToolbarBtn: React.FC<ToolbarBtnProps> = ({ icon, label, onPress, accent }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={[styles.toolBtn, accent && styles.toolBtnAccent]}>
    <Icon
      name={icon}
      size={18}
      color={accent ? Colors.accent.primary : Colors.text.secondary}
    />
    <Text style={[styles.toolLabel, accent && styles.toolLabelAccent]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
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

  // Handle row
  handleRow: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border.default,
  },
  expandChevron: { position: 'absolute', right: Spacing.lg },

  // Status header
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  statusText: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  meta: {
    ...Typography.caption,
    marginRight: 4,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  tabBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 36,
    justifyContent: 'center',
  },
  tabBtnActive: { borderBottomColor: Colors.accent.primary },
  tabLabel: { ...Typography.bodySm, color: Colors.text.muted, fontSize: 13 },
  tabLabelActive: { color: Colors.text.primary, fontWeight: '600' },

  // Body scroll
  bodyScroll: { flex: 1, backgroundColor: Colors.background.elevated },
  rawText: {
    ...Typography.monoSm,
    color: Colors.text.secondary,
    padding: Spacing.md,
    lineHeight: 20,
  },

  // Headers list
  headerRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  headerKey: {
    ...Typography.monoXs,
    color: Colors.text.accent,
    fontSize: 11,
  },
  headerValue: {
    ...Typography.monoXs,
    color: Colors.text.secondary,
    fontSize: 12,
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.surface,
  },
  toolBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 3,
  },
  toolBtnAccent: {},
  toolLabel: {
    ...Typography.caption,
    color: Colors.text.muted,
    fontSize: 10,
  },
  toolLabelAccent: { color: Colors.accent.primary },
});
