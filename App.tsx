import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import CommunityDetailsScreen from './src/screens/CommunityDetailsScreen';
import CommunityListScreen from './src/screens/CommunityListScreen';
import CommunityMilkAvailabilityScreen from './src/screens/CommunityMilkAvailabilityScreen';

import BookMilkScreen from './src/screens/BookMilkScreen';
import PaymentScreen from './src/screens/PaymentScreen';

import type {Community} from './src/types/community';

export type RootStackParamList = {
  Home: undefined;
  CommunityList: undefined;
  CommunityDetails: {
    mode: 'ADD' | 'EDIT';
    community?: Community;
  };
  CommunityMilkAvailability: undefined;

  BookMilk: {
    communityId: number;
  };

  Payment: {
    userId: number;
    communityId: number;
    bookingId: number;
    reservationId: number;
    itemName: string;
    bookingQty: number;
    itemPrice: number;
    fulfillmentType: string;
    deliveryCharge: number;
    platformFee: number;
    totalAmount: number;
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

        <Stack.Screen
          name="CommunityMilkAvailability"
          component={CommunityMilkAvailabilityScreen}
        />

        <Stack.Screen
          name="BookMilk"
          component={BookMilkScreen}
        />

        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            headerShown: false,
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;