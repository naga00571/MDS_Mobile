import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import CommunityDetailsScreen from './src/screens/CommunityDetailsScreen';
import CommunityListScreen from './src/screens/CommunityListScreen';

import type {Community} from './src/types/community';

export type RootStackParamList = {
  Home: undefined;
  CommunityList: undefined;
  CommunityDetails: {
    mode: 'ADD' | 'EDIT';
    community?: Community;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="CommunityList"
          component={CommunityListScreen}
        />

        <Stack.Screen
          name="CommunityDetails"
          component={CommunityDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;