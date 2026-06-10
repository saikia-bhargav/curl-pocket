import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/theme';
import type { HistoryStackParamList } from '@/navigation/types';
import {
  HistoryPlaceholder,
  HistoryDetailPlaceholder,
} from '@/screens/placeholders';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: Colors.background.surface },
  headerTintColor: Colors.text.primary,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  animation: 'slide_from_right' as const,
};

export const HistoryStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="History"
        component={HistoryPlaceholder}
        options={{ title: 'History' }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailPlaceholder}
        options={{ title: 'Request detail' }}
      />
    </Stack.Navigator>
  );
};
