// Single editable variable row for EnvironmentEditScreen.
// Toggle | Key | Value (secret-masked) | Shield icon | Delete

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import type { EnvVariable } from '@/types/environment';

interface Props {
  variable: EnvVariable;
  onUpdate: (varId: string, partial: Partial<Omit<EnvVariable, 'id'>>) => void;
  onDelete: (varId: string) => void;
}

export const EnvVariableRow: React.FC<Props> = memo(({
  variable,
  onUpdate,
  onDelete,
}) => {
  const [valueVisible, setValueVisible] = useState(false);

  const handleToggle     = useCallback((enabled: boolean) => onUpdate(variable.id, { enabled }), [variable.id, onUpdate]);
  const handleKeyChange  = useCallback((key: string) => onUpdate(variable.id, { key }), [variable.id, onUpdate]);
  const handleValueChange= useCallback((value: string) => onUpdate(variable.id, { value }), [variable.id, onUpdate]);
  const handleSecretToggle = useCallback(
    () => onUpdate(variable.id, { secret: !variable.secret }),
    [variable.id, variable.secret, onUpdate],
  );
  const handleDelete = useCallback(() => onDelete(variable.id), [variable.id, onDelete]);

  const textColor = variable.enabled ? Colors.text.primary : Colors.text.muted;

  return (
    <View style={styles.container}>
      {/* Enabled toggle */}
      <Switch
        value={variable.enabled}
        onValueChange={handleToggle}
        trackColor={{ false: Colors.border.subtle, true: Colors.accent.dim }}
        thumbColor={variable.enabled ? Colors.accent.primary : Colors.text.muted}
        style={styles.switch}
      />

      {/* Key + Value stacked */}
      <View style={styles.fields}>
        <TextInput
          value={variable.key}
          onChangeText={handleKeyChange}
          placeholder="Variable name"
          placeholderTextColor={Colors.text.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, styles.keyInput]}
        />
        <View style={styles.valueRow}>
          <TextInput
            value={variable.value}
            onChangeText={handleValueChange}
            placeholder={variable.secret ? 'Secret value' : 'Value'}
            placeholderTextColor={Colors.text.muted}
            secureTextEntry={variable.secret && !valueVisible}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, styles.valueInput, { color: textColor }]}
          />
          {variable.secret && (
            <TouchableOpacity
              onPress={() => setValueVisible(v => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={valueVisible ? 'Hide value' : 'Show value'}
              style={styles.eyeBtn}>
              <Icon
                name={valueVisible ? 'eye-off-outline' : 'eye-outline'}
                size={15}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Secret toggle */}
      <TouchableOpacity
        onPress={handleSecretToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={variable.secret ? 'Mark as plain text' : 'Mark as secret'}
        style={styles.iconBtn}>
        <Icon
          name={variable.secret ? 'shield-lock' : 'shield-outline'}
          size={18}
          color={variable.secret ? Colors.accent.primary : Colors.text.muted}
        />
      </TouchableOpacity>

      {/* Delete */}
      <TouchableOpacity
        onPress={handleDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Delete variable"
        style={styles.iconBtn}>
        <Icon name="close" size={16} color={Colors.text.muted} />
      </TouchableOpacity>
    </View>
  );
});

EnvVariableRow.displayName = 'EnvVariableRow';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    flexShrink: 0,
  },
  fields: { flex: 1, gap: 3 },
  valueRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    ...Typography.monoSm,
    flex: 1,
    paddingVertical: 2,
    color: Colors.text.primary,
  },
  keyInput: { color: Colors.text.accent },
  valueInput: { flex: 1 },
  eyeBtn: { padding: Spacing.xs },
  iconBtn: { padding: Spacing.xs, flexShrink: 0 },
});
