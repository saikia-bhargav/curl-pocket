import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/theme';
import type { SettingsStackParamList } from '@/navigation/types';
import {
  SettingsPlaceholder,
  AboutPlaceholder,
} from '@/screens/placeholders';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: Colors.background.surface },
  headerTintColor: Colors.text.primary,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  animation: 'slide_from_right' as const,
};

export const SettingsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="Settings"
        component={SettingsPlaceholder}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="About"
        component={AboutPlaceholder}
        options={{ title: 'About' }}
      />
    </Stack.Navigator>
  );
};
