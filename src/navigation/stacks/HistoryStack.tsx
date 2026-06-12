import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/theme';
import type { HistoryStackParamList } from '@/navigation/types';
import { HistoryScreen } from '@/screens/history/HistoryScreen';
import { HistoryDetailScreen } from '@/screens/history/HistoryDetailScreen';

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
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
