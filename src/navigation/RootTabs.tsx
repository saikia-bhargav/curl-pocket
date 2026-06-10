import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { RequestStack } from './stacks/RequestStack';
import { CollectionsStack } from './stacks/CollectionsStack';
import { HistoryStack } from './stacks/HistoryStack';
import { EnvironmentsStack } from './stacks/EnvironmentsStack';
import { SettingsStack } from './stacks/SettingsStack';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="RequestTab"      component={RequestStack} />
      <Tab.Screen name="CollectionsTab"  component={CollectionsStack} />
      <Tab.Screen name="HistoryTab"      component={HistoryStack} />
      <Tab.Screen name="EnvironmentsTab" component={EnvironmentsStack} />
      <Tab.Screen name="SettingsTab"     component={SettingsStack} />
    </Tab.Navigator>
  );
};
