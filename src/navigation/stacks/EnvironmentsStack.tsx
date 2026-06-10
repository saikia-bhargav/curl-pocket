import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/theme';
import type { EnvironmentsStackParamList } from '@/navigation/types';
import {
  EnvironmentsPlaceholder,
  EnvironmentEditPlaceholder,
} from '@/screens/placeholders';

const Stack = createNativeStackNavigator<EnvironmentsStackParamList>();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: Colors.background.surface },
  headerTintColor: Colors.text.primary,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  animation: 'slide_from_right' as const,
};

export const EnvironmentsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="Environments"
        component={EnvironmentsPlaceholder}
        options={{ title: 'Environments' }}
      />
      <Stack.Screen
        name="EnvironmentEdit"
        component={EnvironmentEditPlaceholder}
        options={{ title: 'Edit environment' }}
      />
    </Stack.Navigator>
  );
};
