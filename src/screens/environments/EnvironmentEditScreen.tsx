import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { Divider } from '@/components/atoms/Divider';
import { EmptyState } from '@/components/atoms/EmptyState';
import { ColorPicker } from '@/components/environments/ColorPicker';
import { EnvVariableRow } from '@/components/environments/EnvVariableRow';
import {
  useEnvironmentsStore,
  selectEnvironmentById,
} from '@/store/environmentsSlice';
import type { EnvironmentEditScreenProps } from '@/navigation/types';
import type { EnvVariable } from '@/types/environment';

export const EnvironmentEditScreen: React.FC<EnvironmentEditScreenProps> = ({
  route,
  navigation,
}) => {
  const { environmentId } = route.params;

  const env              = useEnvironmentsStore(selectEnvironmentById(environmentId));
  const updateEnvironment = useEnvironmentsStore(s => s.updateEnvironment);
  const addVariable       = useEnvironmentsStore(s => s.addVariable);
  const updateVariable    = useEnvironmentsStore(s => s.updateVariable);
  const deleteVariable    = useEnvironmentsStore(s => s.deleteVariable);
  const deleteEnvironment = useEnvironmentsStore(s => s.deleteEnvironment);
  const setActive         = useEnvironmentsStore(s => s.setActive);
  const activeId          = useEnvironmentsStore(s => s.activeEnvironmentId);

  const isActive = activeId === environmentId;

  // Local name — commit to store on blur
  const [localName, setLocalName] = useState(env?.name ?? '');
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (env !== undefined) { setLocalName(env.name); }
  }, [env]);

  const handleNameBlur = useCallback(() => {
    const trimmed = localName.trim();
    if (trimmed !== '' && trimmed !== env?.name) {
      updateEnvironment(environmentId, { name: trimmed });
    } else if (trimmed === '') {
      setLocalName(env?.name ?? '');  // revert empty
    }
  }, [localName, env?.name, environmentId, updateEnvironment]);

  const handleColorSelect = useCallback(
    (color: string) => updateEnvironment(environmentId, { color }),
    [environmentId, updateEnvironment],
  );

  const handleAddVariable = useCallback(
    () => addVariable(environmentId),
    [environmentId, addVariable],
  );

  const handleUpdateVariable = useCallback(
    (varId: string, partial: Partial<Omit<EnvVariable, 'id'>>) =>
      updateVariable(environmentId, varId, partial),
    [environmentId, updateVariable],
  );

  const handleDeleteVariable = useCallback(
    (varId: string) => deleteVariable(environmentId, varId),
    [environmentId, deleteVariable],
  );

  const handleToggleActive = useCallback(() => {
    setActive(isActive ? null : environmentId);
  }, [isActive, environmentId, setActive]);

  const handleDeleteEnvironment = useCallback(() => {
    Alert.alert(
      'Delete environment',
      `Delete "${env?.name ?? 'this environment'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEnvironment(environmentId);
            navigation.goBack();
          },
        },
      ],
    );
  }, [env?.name, environmentId, deleteEnvironment, navigation]);

  // ── Header buttons (set via navigation options) ──────────────────────────────
  useEffect(() => {
    navigation.setOptions({
      title: env?.name ?? 'Environment',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleDeleteEnvironment}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Delete environment"
          style={{ marginRight: Spacing.sm }}>
          <Icon name="delete-outline" size={22} color={Colors.status.error} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, env?.name, handleDeleteEnvironment]);

  if (env === undefined) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <EmptyState icon="alert-outline" title="Environment not found" subtitle="" />
      </SafeAreaView>
    );
  }

  const variables = env.variables;

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={variables}
          keyExtractor={(item: EnvVariable) => item.id}
          renderItem={({ item }: { item: EnvVariable }) => (
            <EnvVariableRow
              variable={item}
              onUpdate={handleUpdateVariable}
              onDelete={handleDeleteVariable}
            />
          )}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* Name field */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>NAME</Text>
                <TextInput
                  ref={nameInputRef}
                  value={localName}
                  onChangeText={setLocalName}
                  onBlur={handleNameBlur}
                  placeholder="Environment name"
                  placeholderTextColor={Colors.text.muted}
                  autoCapitalize="words"
                  returnKeyType="done"
                  style={styles.nameInput}
                />
              </View>

              {/* Color picker */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>COLOR</Text>
                <ColorPicker selectedColor={env.color} onSelect={handleColorSelect} />
              </View>

              {/* Active toggle */}
              <TouchableOpacity
                onPress={handleToggleActive}
                activeOpacity={0.7}
                style={[styles.activeRow, isActive && styles.activeRowOn]}>
                <View style={[styles.activeDot, { backgroundColor: env.color }]} />
                <Text style={[styles.activeLabel, isActive && styles.activeLabelOn]}>
                  {isActive ? 'Active environment' : 'Set as active'}
                </Text>
                <Icon
                  name={isActive ? 'check-circle' : 'circle-outline'}
                  size={20}
                  color={isActive ? Colors.accent.primary : Colors.text.muted}
                />
              </TouchableOpacity>

              <Divider style={styles.divider} />

              {/* Variables section header */}
              <View style={styles.varHeader}>
                <Text style={styles.sectionLabel}>VARIABLES  ({variables.length})</Text>
                <TouchableOpacity
                  onPress={handleAddVariable}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Add variable"
                  style={styles.addVarBtn}>
                  <Icon name="plus" size={18} color={Colors.accent.primary} />
                  <Text style={styles.addVarText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <TouchableOpacity
              onPress={handleAddVariable}
              activeOpacity={0.7}
              style={styles.emptyVarsBtn}>
              <Icon name="plus-circle-outline" size={18} color={Colors.accent.primary} />
              <Text style={styles.emptyVarsText}>Add first variable</Text>
            </TouchableOpacity>
          }
          contentContainerStyle={styles.listContent}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },
  listContent: { paddingBottom: Spacing.xxxl },
  listHeader: { paddingBottom: Spacing.md },

  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionLabel: { ...Typography.label },

  nameInput: {
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

  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.subtle,
    backgroundColor: Colors.background.elevated,
    gap: Spacing.sm,
  },
  activeRowOn: {
    borderColor: Colors.accent.border,
    backgroundColor: Colors.accent.dim,
  },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  activeLabel: { ...Typography.bodyMd, flex: 1, color: Colors.text.secondary },
  activeLabelOn: { color: Colors.accent.primary },

  divider: { marginTop: Spacing.lg },

  varHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  addVarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addVarText: { ...Typography.bodySm, color: Colors.accent.primary },

  emptyVarsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    borderColor: Colors.border.default,
  },
  emptyVarsText: { ...Typography.bodyMd, color: Colors.accent.primary },
});
