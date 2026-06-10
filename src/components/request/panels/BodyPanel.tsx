import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { KeyValueRow } from '@/components/atoms/KeyValueRow';
import { EmptyState } from '@/components/atoms/EmptyState';
import { generateId } from '@/utils';
import type { RequestBody, KeyValuePair } from '@/types/request';
import type { BodyType, ContentLanguage } from '@/constants';

const BODY_TYPES: { label: string; value: BodyType }[] = [
  { label: 'None',      value: 'none' },
  { label: 'Raw',       value: 'raw' },
  { label: 'Form data', value: 'form-data' },
  { label: 'URL enc.',  value: 'urlencoded' },
  { label: 'GraphQL',   value: 'graphql' },
];

const LANGUAGES: { label: string; value: ContentLanguage }[] = [
  { label: 'JSON',       value: 'json' },
  { label: 'XML',        value: 'xml' },
  { label: 'Text',       value: 'text' },
  { label: 'HTML',       value: 'html' },
  { label: 'JavaScript', value: 'javascript' },
];

const LINE_HEIGHT = 20;

interface Props {
  body: RequestBody;
  onChange: (body: RequestBody) => void;
}

export const BodyPanel: React.FC<Props> = ({ body, onChange }) => {
  const setType = useCallback(
    (type: BodyType) => onChange({ ...body, type }),
    [body, onChange],
  );

  const setLanguage = useCallback(
    (language: ContentLanguage) => onChange({ ...body, language }),
    [body, onChange],
  );

  const setRaw = useCallback(
    (raw: string) => onChange({ ...body, raw }),
    [body, onChange],
  );

  const updateFormData = useCallback(
    (items: KeyValuePair[]) => onChange({ ...body, formData: items }),
    [body, onChange],
  );

  const updateUrlEncoded = useCallback(
    (items: KeyValuePair[]) => onChange({ ...body, urlEncoded: items }),
    [body, onChange],
  );

  const lineCount = useMemo(
    () => (body.raw.length > 0 ? body.raw.split('\n').length : 1),
    [body.raw],
  );

  // Shared KV list renderer for form-data / urlencoded
  const renderKvList = useCallback(
    (
      items: KeyValuePair[],
      update: (items: KeyValuePair[]) => void,
      placeholder: string,
    ) => (
      <View style={{ flex: 1 }}>
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <KeyValueRow
              item={item}
              onToggle={(id, enabled) =>
                update(items.map(p => (p.id === id ? { ...p, enabled } : p)))
              }
              onKeyChange={(id, key) =>
                update(items.map(p => (p.id === id ? { ...p, key } : p)))
              }
              onValueChange={(id, value) =>
                update(items.map(p => (p.id === id ? { ...p, value } : p)))
              }
              onDelete={id => update(items.filter(p => p.id !== id))}
              keyPlaceholder={placeholder}
            />
          )}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: 80 }}
          ListEmptyComponent={
            <EmptyState
              icon="plus-circle-outline"
              title="No items"
              subtitle="Tap + to add"
              style={{ minHeight: 150 }}
            />
          }
          keyboardShouldPersistTaps="handled"
        />
        <TouchableOpacity
          onPress={() =>
            update([
              ...items,
              { id: generateId(), key: '', value: '', enabled: true },
            ])
          }
          accessibilityLabel="Add row"
          style={styles.fab}>
          <Icon name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {/* Body type segmented selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.segRow}
        keyboardShouldPersistTaps="handled"
        style={styles.segScrollBg}>
        {BODY_TYPES.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            onPress={() => setType(value)}
            style={[styles.segBtn, body.type === value && styles.segBtnActive]}>
            <Text
              style={[
                styles.segLabel,
                body.type === value && styles.segLabelActive,
              ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* None */}
      {body.type === 'none' && (
        <EmptyState
          icon="close-circle-outline"
          title="No body"
          subtitle="Select a body type above to add a request body"
          style={{ flex: 1 }}
        />
      )}

      {/* Raw */}
      {body.type === 'raw' && (
        <View style={{ flex: 1 }}>
          {/* Language chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.langRow}
            style={styles.langScrollBg}
            keyboardShouldPersistTaps="handled">
            {LANGUAGES.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setLanguage(value)}
                style={[
                  styles.langChip,
                  body.language === value && styles.langChipActive,
                ]}>
                <Text
                  style={[
                    styles.langLabel,
                    body.language === value && styles.langLabelActive,
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Code editor with line numbers */}
          <ScrollView
            style={styles.editorScroll}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.editorRow}>
              {/* Line number column */}
              <View style={styles.lineNumbers}>
                {Array.from({ length: lineCount }, (_, i) => (
                  <Text key={i} style={styles.lineNum}>
                    {i + 1}
                  </Text>
                ))}
              </View>
              {/* Code input */}
              <TextInput
                value={body.raw}
                onChangeText={setRaw}
                multiline
                scrollEnabled={false}
                placeholder={
                  body.language === 'json'
                    ? '{\n  "key": "value"\n}'
                    : 'Request body...'
                }
                placeholderTextColor={Colors.text.muted}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textAlignVertical="top"
                style={styles.codeInput}
              />
            </View>
          </ScrollView>
        </View>
      )}

      {/* Form data */}
      {body.type === 'form-data' &&
        renderKvList(body.formData, updateFormData, 'Field name')}

      {/* URL encoded */}
      {body.type === 'urlencoded' &&
        renderKvList(body.urlEncoded, updateUrlEncoded, 'Parameter')}

      {/* GraphQL */}
      {body.type === 'graphql' && (
        <EmptyState
          icon="graphql"
          title="GraphQL editor"
          subtitle="GraphQL support coming soon"
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },

  // Segment control
  segScrollBg: {
    height: 44,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  segRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  segBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  segBtnActive: {
    backgroundColor: Colors.accent.dim,
    borderColor: Colors.accent.border,
  },
  segLabel: { ...Typography.bodySm, color: Colors.text.muted, fontSize: 12 },
  segLabelActive: { color: Colors.accent.primary, fontWeight: '600' },

  // Language chips
  langScrollBg: {
    height: 36,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  langRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  langChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  langChipActive: {
    backgroundColor: Colors.accent.dim,
    borderColor: Colors.accent.border,
  },
  langLabel:      { ...Typography.monoXs, color: Colors.text.muted },
  langLabelActive: { color: Colors.accent.primary, fontWeight: '600' },

  // Code editor
  editorScroll: { flex: 1, backgroundColor: Colors.background.elevated },
  editorRow: { flexDirection: 'row', minHeight: 300 },
  lineNumbers: {
    width: 38,
    backgroundColor: Colors.background.surface,
    paddingTop: Spacing.sm,
    paddingRight: 6,
    alignItems: 'flex-end',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: Colors.border.subtle,
  },
  lineNum: {
    ...Typography.monoXs,
    color: Colors.text.muted,
    lineHeight: LINE_HEIGHT,
    textAlign: 'right',
  },
  codeInput: {
    ...Typography.monoSm,
    flex: 1,
    padding: Spacing.sm,
    color: Colors.text.primary,
    lineHeight: LINE_HEIGHT,
    minHeight: 300,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});
