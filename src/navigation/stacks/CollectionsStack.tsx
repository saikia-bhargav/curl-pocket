import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/theme';
import type { CollectionsStackParamList } from '@/navigation/types';
import {
  CollectionsPlaceholder,
  CollectionDetailPlaceholder,
  CollectionRequestPlaceholder,
} from '@/screens/placeholders';

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
        component={CollectionsPlaceholder}
        options={{ title: 'Collections' }}
      />
      <Stack.Screen
        name="CollectionDetail"
        component={CollectionDetailPlaceholder}
        options={{ title: 'Collection' }}
      />
      <Stack.Screen
        name="CollectionRequest"
        component={CollectionRequestPlaceholder}
        options={{ title: 'Request' }}
      />
    </Stack.Navigator>
  );
};
