import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/theme';
import type { RequestStackParamList } from '@/navigation/types';

import { RequestBuilderScreen } from '@/screens/request/RequestBuilderScreen';
import { ResponseDetailPlaceholder } from '@/screens/placeholders';

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
        component={RequestBuilderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResponseDetail"
        component={ResponseDetailPlaceholder}
        options={{ title: 'Response' }}
      />
    </Stack.Navigator>
  );
};
