import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/theme';
import type { RequestStackParamList } from '@/navigation/types';

// Placeholder screens — will be replaced in Prompt 3
import {
  RequestBuilderPlaceholder,
  ResponseDetailPlaceholder,
} from '@/screens/placeholders';

const Stack = createNativeStackNavigator<RequestStackParamList>();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: Colors.background.surface },
  headerTintColor: Colors.text.primary,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  animation: 'slide_from_right' as const,
};

export const RequestStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="RequestBuilder"
        component={RequestBuilderPlaceholder}
        options={{ headerShown: false }}  // header managed by RequestBuilderScreen itself
      />
      <Stack.Screen
        name="ResponseDetail"
        component={ResponseDetailPlaceholder}
        options={{ title: 'Response' }}
      />
    </Stack.Navigator>
  );
};
