import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { Divider } from '@/components/atoms/Divider';
import { EmptyState } from '@/components/atoms/EmptyState';
import { NewEnvironmentSheet } from '@/components/environments/NewEnvironmentSheet';
import type { NewEnvironmentSheetHandle } from '@/components/environments/NewEnvironmentSheet';
import {
  useEnvironmentsStore,
  selectAllEnvironments,
} from '@/store/environmentsSlice';
import type { Environment } from '@/types/environment';
import type { EnvironmentsScreenProps } from '@/navigation/types';

export const EnvironmentsScreen: React.FC<EnvironmentsScreenProps> = ({ navigation }) => {
  const environments       = useEnvironmentsStore(selectAllEnvironments);
  const activeEnvironmentId = useEnvironmentsStore(s => s.activeEnvironmentId);
  const setActive           = useEnvironmentsStore(s => s.setActive);
  const deleteEnvironment   = useEnvironmentsStore(s => s.deleteEnvironment);
  const duplicateEnvironment = useEnvironmentsStore(s => s.duplicateEnvironment);

  const newSheetRef = useRef<NewEnvironmentSheetHandle>(null);

  const handleNewPress = useCallback(() => newSheetRef.current?.open(), []);

  const handleCreated = useCallback(
    (id: string) => navigation.navigate('EnvironmentEdit', { environmentId: id }),
    [navigation],
  );

  const handleRowPress = useCallback(
    (env: Environment) => navigation.navigate('EnvironmentEdit', { environmentId: env.id }),
    [navigation],
  );

  const handleActivate = useCallback(
    (id: string) => setActive(activeEnvironmentId === id ? null : id),
    [activeEnvironmentId, setActive],
  );

  const handleDelete = useCallback(
    (env: Environment) => {
      Alert.alert(
        'Delete environment',
        `Delete "${env.name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteEnvironment(env.id) },
        ],
      );
    },
    [deleteEnvironment],
  );

  const handleLongPress = useCallback(
    (env: Environment) => {
      Alert.alert(
        env.name,
        undefined,
        [
          { text: 'Duplicate', onPress: () => duplicateEnvironment(env.id) },
          { text: 'Delete',    style: 'destructive', onPress: () => handleDelete(env) },
          { text: 'Cancel',    style: 'cancel' },
        ],
      );
    },
    [duplicateEnvironment, handleDelete],
  );

  const renderItem = useCallback(
    ({ item: env }: { item: Environment }) => {
      const isActive = env.id === activeEnvironmentId;
      const varCount = env.variables.filter(v => v.enabled).length;

      return (
        <TouchableOpacity
          onPress={() => handleRowPress(env)}
          onLongPress={() => handleLongPress(env)}
          delayLongPress={400}
          activeOpacity={0.7}
          style={[styles.envRow, isActive && styles.envRowActive]}>

          {/* Left accent bar */}
          {isActive && (
            <View style={[styles.activeBorder, { backgroundColor: env.color }]} />
          )}

          {/* Color dot */}
          <View style={[styles.dot, { backgroundColor: env.color }]} />

          {/* Name + meta */}
          <View style={styles.envInfo}>
            <Text style={styles.envName}>{env.name}</Text>
            <Text style={styles.envMeta}>
              {varCount} variable{varCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Active chip */}
          {isActive && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>Active</Text>
            </View>
          )}

          {/* Circle toggle */}
          <TouchableOpacity
            onPress={() => handleActivate(env.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="radio"
            accessibilityState={{ checked: isActive }}
            accessibilityLabel={isActive ? 'Deactivate' : 'Set as active'}
            style={styles.activateBtn}>
            <Icon
              name={isActive ? 'check-circle' : 'circle-outline'}
              size={22}
              color={isActive ? Colors.accent.primary : Colors.text.muted}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [activeEnvironmentId, handleRowPress, handleLongPress, handleActivate],
  );

  const keyExtractor = useCallback((item: Environment) => item.id, []);

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        icon="layers-outline"
        title="No environments"
        subtitle="Create an environment to manage variables like baseUrl and tokens"
        action={
          <TouchableOpacity onPress={handleNewPress} style={styles.emptyActionBtn}>
            <Icon name="plus" size={16} color={Colors.accent.primary} />
            <Text style={styles.emptyActionLabel}>New environment</Text>
          </TouchableOpacity>
        }
      />
    ),
    [handleNewPress],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Environments</Text>
        <TouchableOpacity
          onPress={handleNewPress}
          activeOpacity={0.7}
          accessibilityLabel="New environment"
          style={styles.newBtn}>
          <Icon name="plus" size={20} color={Colors.accent.primary} />
          <Text style={styles.newBtnLabel}>New</Text>
        </TouchableOpacity>
      </View>

      <Divider />

      <FlatList
        data={environments}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
      />

      <NewEnvironmentSheet ref={newSheetRef} onCreated={handleCreated} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.surface,
  },
  headerTitle: { ...Typography.heading },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  newBtnLabel: { ...Typography.bodyMd, color: Colors.accent.primary },
  listContent: { flexGrow: 1, paddingBottom: Spacing.xxxl },
  envRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
    minHeight: 64,
    gap: Spacing.md,
  },
  envRowActive: { backgroundColor: Colors.background.surface },
  activeBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
  dot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  envInfo: { flex: 1, gap: 3 },
  envName: { ...Typography.bodyMd, fontWeight: '500' },
  envMeta: { ...Typography.caption },
  activeChip: {
    backgroundColor: Colors.status.successDim,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  activeChipText: { ...Typography.caption, color: Colors.status.success, fontWeight: '600' },
  activateBtn: { padding: Spacing.xs },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.dim,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emptyActionLabel: { ...Typography.bodyMd, color: Colors.accent.primary },
});
