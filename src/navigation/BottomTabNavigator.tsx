import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { AIStylistScreen } from '../screens/AIStylistScreen';
import { StoreLocatorScreen } from '../screens/StoreLocatorScreen';
import { CustomTabBar } from '../components/common/CustomTabBar';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AIStylist" component={AIStylistScreen} />
      <Tab.Screen name="StoreLocator" component={StoreLocatorScreen} />
    </Tab.Navigator>
  );
};
