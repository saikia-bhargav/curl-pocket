import React, { useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { MethodBadge } from '@/components/atoms/MethodBadge';
import { MethodPickerSheet } from './MethodPickerSheet';
import type { MethodPickerSheetHandle } from './MethodPickerSheet';
import type { HttpMethod } from '@/types/request';

interface Props {
  method: HttpMethod;
  url: string;
  loading: boolean;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

export const UrlBar: React.FC<Props> = ({
  method,
  url,
  loading,
  onMethodChange,
  onUrlChange,
  onSend,
}) => {
  const sheetRef = useRef<MethodPickerSheetHandle>(null);

  const handleMethodPress = useCallback(() => {
    sheetRef.current?.open();
  }, []);

  return (
    <View style={styles.container}>
      {/* Method picker pill */}
      <TouchableOpacity
        onPress={handleMethodPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`HTTP method: ${method}. Tap to change.`}
        style={styles.methodBtn}>
        <MethodBadge method={method} size="md" />
      </TouchableOpacity>

      {/* URL input */}
      <TextInput
        value={url}
        onChangeText={onUrlChange}
        placeholder="https://api.example.com/endpoint"
        placeholderTextColor={Colors.text.muted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="send"
        onSubmitEditing={onSend}
        editable={!loading}
        style={styles.urlInput}
        accessibilityLabel="Request URL"
      />

      {/* Send button */}
      <TouchableOpacity
        onPress={onSend}
        disabled={loading}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={loading ? 'Sending request' : 'Send request'}
        style={[styles.sendBtn, loading && styles.sendBtnLoading]}>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.text.inverse} />
        ) : (
          <Text style={styles.sendLabel}>Send</Text>
        )}
      </TouchableOpacity>

      {/* Method picker sheet (portal via modal) */}
      <MethodPickerSheet
        ref={sheetRef}
        currentMethod={method}
        onSelect={onMethodChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  methodBtn: {
    flexShrink: 0,
  },
  urlInput: {
    ...Typography.monoMd,
    flex: 1,
    height: 40,
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    color: Colors.text.primary,
    fontSize: 13,
  },
  sendBtn: {
    height: 40,
    minWidth: 72,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    flexShrink: 0,
  },
  sendBtnLoading: {
    opacity: 0.75,
  },
  sendLabel: {
    ...Typography.bodyMd,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
