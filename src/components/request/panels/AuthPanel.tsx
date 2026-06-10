import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import type { RequestAuth } from '@/types/request';
import type { AuthType } from '@/constants';

const AUTH_TYPES: { label: string; value: AuthType }[] = [
  { label: 'None',    value: 'none' },
  { label: 'Bearer',  value: 'bearer' },
  { label: 'Basic',   value: 'basic' },
  { label: 'API Key', value: 'api-key' },
  { label: 'OAuth 2', value: 'oauth2' },
];

interface Props {
  auth: RequestAuth;
  onChange: (auth: RequestAuth) => void;
}

export const AuthPanel: React.FC<Props> = ({ auth, onChange }) => {
  const setType = useCallback(
    (type: AuthType) => onChange({ type }),
    [onChange],
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Auth type pills */}
      <View style={styles.typeRow}>
        {AUTH_TYPES.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            onPress={() => setType(value)}
            style={[
              styles.typeBtn,
              auth.type === value && styles.typeBtnActive,
            ]}>
            <Text
              style={[
                styles.typeLabel,
                auth.type === value && styles.typeLabelActive,
              ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.fields}>
        {/* Bearer token */}
        {auth.type === 'bearer' && (
          <>
            <Text style={styles.fieldLabel}>Token</Text>
            <TextInput
              value={auth.bearer?.token ?? ''}
              onChangeText={t =>
                onChange({ ...auth, bearer: { token: t } })
              }
              placeholder="Bearer token value"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </>
        )}

        {/* Basic auth */}
        {auth.type === 'basic' && (
          <>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              value={auth.basic?.username ?? ''}
              onChangeText={u =>
                onChange({
                  ...auth,
                  basic: { username: u, password: auth.basic?.password ?? '' },
                })
              }
              placeholder="username"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              value={auth.basic?.password ?? ''}
              onChangeText={p =>
                onChange({
                  ...auth,
                  basic: { username: auth.basic?.username ?? '', password: p },
                })
              }
              placeholder="password"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={styles.input}
            />
          </>
        )}

        {/* API Key */}
        {auth.type === 'api-key' && (
          <>
            <Text style={styles.fieldLabel}>Key name</Text>
            <TextInput
              value={auth.apiKey?.key ?? ''}
              onChangeText={k =>
                onChange({
                  ...auth,
                  apiKey: {
                    key: k,
                    value: auth.apiKey?.value ?? '',
                    placement: auth.apiKey?.placement ?? 'header',
                  },
                })
              }
              placeholder="X-API-Key"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="none"
              style={styles.input}
            />
            <Text style={styles.fieldLabel}>Value</Text>
            <TextInput
              value={auth.apiKey?.value ?? ''}
              onChangeText={v =>
                onChange({
                  ...auth,
                  apiKey: {
                    key: auth.apiKey?.key ?? '',
                    value: v,
                    placement: auth.apiKey?.placement ?? 'header',
                  },
                })
              }
              placeholder="API key value"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="none"
              style={styles.input}
            />
            <Text style={styles.fieldLabel}>Add to</Text>
            <View style={styles.placementRow}>
              {(['header', 'query'] as const).map(placement => (
                <TouchableOpacity
                  key={placement}
                  onPress={() =>
                    onChange({
                      ...auth,
                      apiKey: {
                        key: auth.apiKey?.key ?? '',
                        value: auth.apiKey?.value ?? '',
                        placement,
                      },
                    })
                  }
                  style={[
                    styles.placementBtn,
                    auth.apiKey?.placement === placement &&
                      styles.placementBtnActive,
                  ]}>
                  <Text
                    style={[
                      styles.placementLabel,
                      auth.apiKey?.placement === placement &&
                        styles.placementLabelActive,
                    ]}>
                    {placement === 'header' ? 'Header' : 'Query param'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* OAuth 2 */}
        {auth.type === 'oauth2' && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              OAuth 2.0 flow coming in a later update
            </Text>
          </View>
        )}

        {/* None */}
        {auth.type === 'none' && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              No authentication will be sent with this request
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: Spacing.xs,
    backgroundColor: Colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  typeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  typeBtnActive: {
    backgroundColor: Colors.accent.dim,
    borderColor: Colors.accent.border,
  },
  typeLabel: { ...Typography.bodySm, color: Colors.text.muted, fontSize: 12 },
  typeLabelActive: { color: Colors.accent.primary, fontWeight: '600' },

  fields: { padding: Spacing.lg, gap: Spacing.sm },
  fieldLabel: { ...Typography.label, marginTop: Spacing.xs },

  input: {
    ...Typography.monoSm,
    height: 44,
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.text.primary,
  },

  placementRow: { flexDirection: 'row', gap: Spacing.sm },
  placementBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  placementBtnActive: {
    backgroundColor: Colors.accent.dim,
    borderColor: Colors.accent.border,
  },
  placementLabel: { ...Typography.bodySm, color: Colors.text.muted },
  placementLabelActive: { color: Colors.accent.primary, fontWeight: '600' },

  placeholder: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  placeholderText: { ...Typography.bodySm, color: Colors.text.muted },
});
