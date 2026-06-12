// Final App.tsx — this will NOT change in future prompts.

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation/RootNavigator';
import { Colors } from '@/theme';

// React Navigation theme — maps to our dark color tokens
const NAV_THEME = {
  dark: true,
  colors: {
    primary:      Colors.accent.primary,
    background:   Colors.background.primary,
    card:         Colors.background.surface,
    text:         Colors.text.primary,
    border:       Colors.border.subtle,
    notification: Colors.status.error,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium:  { fontFamily: 'System', fontWeight: '500' as const },
    bold:    { fontFamily: 'System', fontWeight: '600' as const },
    heavy:   { fontFamily: 'System', fontWeight: '700' as const },
  },
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.background.primary}
          translucent={false}
        />
        <NavigationContainer theme={NAV_THEME}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;