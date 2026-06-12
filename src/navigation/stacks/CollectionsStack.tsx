import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/theme';
import type { CollectionsStackParamList } from '@/navigation/types';

import { CollectionsScreen } from '@/screens/collections/CollectionsScreen';
import { CollectionDetailScreen } from '@/screens/collections/CollectionDetailScreen';
import { CollectionRequestScreen } from '@/screens/collections/CollectionRequestScreen';

const Stack = createNativeStackNavigator<CollectionsStackParamList>();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: Colors.background.surface },
  headerTintColor: Colors.text.primary,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  animation: 'slide_from_right' as const,
};

export const CollectionsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CollectionDetail"
        component={CollectionDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CollectionRequest"
        component={CollectionRequestScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};
