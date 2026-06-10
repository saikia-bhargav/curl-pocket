import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/theme';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export const PreReqPanel: React.FC<Props> = ({ value, onChange }) => (
  <View style={styles.container}>
    <Text style={styles.hint}>
      // JavaScript executed before the request is sent
    </Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline
      placeholder={'// pm.environment.set("token", "value");'}
      placeholderTextColor={Colors.text.muted}
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      textAlignVertical="top"
      style={styles.input}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.elevated },
  hint: {
    ...Typography.monoXs,
    color: Colors.text.muted,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 2,
  },
  input: {
    ...Typography.monoSm,
    flex: 1,
    padding: Spacing.md,
    color: Colors.text.primary,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
});
