import React, { useCallback } from 'react';
import {
  View,
  TextInput,
  Switch,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import type { KeyValuePair } from '@/types/request';

interface Props {
  item: KeyValuePair;
  onToggle: (id: string, enabled: boolean) => void;
  onKeyChange: (id: string, key: string) => void;
  onValueChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  disabled?: boolean;
}

export const KeyValueRow: React.FC<Props> = ({
  item,
  onToggle,
  onKeyChange,
  onValueChange,
  onDelete,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  disabled = false,
}) => {
  const handleToggle = useCallback(
    (val: boolean) => onToggle(item.id, val),
    [item.id, onToggle],
  );

  const handleKeyChange = useCallback(
    (text: string) => onKeyChange(item.id, text),
    [item.id, onKeyChange],
  );

  const handleValueChange = useCallback(
    (text: string) => onValueChange(item.id, text),
    [item.id, onValueChange],
  );

  const handleDelete = useCallback(
    () => onDelete(item.id),
    [item.id, onDelete],
  );

  const isDisabled = disabled || !item.enabled;
  const textColor = isDisabled ? Colors.text.muted : Colors.text.primary;

  return (
    <View style={styles.container}>
      <Switch
        value={item.enabled}
        onValueChange={handleToggle}
        disabled={disabled}
        trackColor={{
          false: Colors.border.subtle,
          true: Colors.accent.dim,
        }}
        thumbColor={item.enabled ? Colors.accent.primary : Colors.text.muted}
        style={styles.switch}
      />

      <TextInput
        value={item.key}
        onChangeText={handleKeyChange}
        placeholder={keyPlaceholder}
        placeholderTextColor={Colors.text.muted}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, styles.keyInput, { color: textColor }]}
      />

      <View style={styles.separator} />

      <TextInput
        value={item.value}
        onChangeText={handleValueChange}
        placeholder={valuePlaceholder}
        placeholderTextColor={Colors.text.muted}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, styles.valueInput, { color: textColor }]}
      />

      <TouchableOpacity
        onPress={handleDelete}
        disabled={disabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Delete row"
        style={styles.deleteBtn}>
        <Icon
          name="close"
          size={16}
          color={disabled ? Colors.text.muted : Colors.text.muted}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.elevated,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minHeight: 44,
  },
  switch: {
    marginRight: Spacing.sm,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  input: {
    ...Typography.monoSm,
    flex: 1,
    paddingVertical: Spacing.sm,
    color: Colors.text.primary,
  },
  keyInput: {
    color: Colors.text.accent,   // keys in accent purple
  },
  valueInput: {
    color: Colors.text.primary,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    height: 16,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: Spacing.xs,
  },
  deleteBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
