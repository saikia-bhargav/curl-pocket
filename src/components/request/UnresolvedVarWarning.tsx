// Amber inline banner shown below the URL bar when the active request
// contains {{keys}} that don't resolve in the active environment.
// Tapping navigates to EnvironmentEditScreen or EnvironmentsScreen.

import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, Radius } from '@/theme';
import { useAppNavigation } from '@/navigation';
import {
  useEnvironmentsStore,
  selectActiveEnvironment,
} from '@/store/environmentsSlice';

interface Props {
  unresolvedKeys: string[];
}

export const UnresolvedVarWarning: React.FC<Props> = memo(({ unresolvedKeys }) => {
  const navigation = useAppNavigation();
  const activeEnv = useEnvironmentsStore(selectActiveEnvironment);

  const handlePress = useCallback(() => {
    if (activeEnv !== null) {
      navigation.navigate('EnvironmentsTab', {
        screen: 'EnvironmentEdit',
        params: { environmentId: activeEnv.id },
      });
    } else {
      navigation.navigate('EnvironmentsTab', {
        screen: 'Environments',
      });
    }
  }, [activeEnv, navigation]);

  if (unresolvedKeys.length === 0) { return null; }

  const keyList = unresolvedKeys.map(k => `{{${k}}}`).join(', ');
  const label = unresolvedKeys.length === 1
    ? `Unresolved: ${keyList}`
    : `${unresolvedKeys.length} unresolved variables: ${keyList}`;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.container}>
      <Icon name="alert-outline" size={13} color={Colors.status.warning} />
      <Text style={styles.text} numberOfLines={1}>{label}</Text>
      <Icon name="chevron-right" size={13} color={Colors.status.warning} />
    </TouchableOpacity>
  );
});

UnresolvedVarWarning.displayName = 'UnresolvedVarWarning';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.warningDim,
    borderRadius: Radius.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${Colors.status.warning}40`,
  },
  text: {
    ...Typography.bodyXs,
    color: Colors.status.warning,
    flex: 1,
  },
});
