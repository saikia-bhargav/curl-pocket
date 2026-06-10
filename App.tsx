import React from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            backgroundColor: '#0D0F14',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: '#E2E4ED',
              fontSize: 22,
              fontWeight: '600',
            }}>
            rn-api-client
          </Text>
          <Text
            style={{
              color: '#00D2A8',
              fontSize: 14,
              marginTop: 8,
            }}>
            scaffold ready ✓
          </Text>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;