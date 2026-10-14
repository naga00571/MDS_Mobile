import React, {useEffect, useState}  from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {isAuthenticated} from './src/auth/authStorage';

import LoginWithPasscodeScreen from './src/screens/LoginWithPasscodeScreen';
import HomeScreen from './src/screens/HomeScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import CommunityDetailsScreen from './src/screens/CommunityDetailsScreen';
import CommunityListScreen from './src/screens/CommunityListScreen';

import CommunityStockEntryScreen from './src/screens/CommunityStockEntryScreen';

import BookItemsScreen0 from './src/screens/BookItemsScreen0';
import BookMilkScreen from './src/screens/BookMilkScreen';


import PaymentScreen from './src/screens/PaymentScreen';
import Bookings from './src/screens/bookings';

import type {Community} from './src/types/community';

export type RootStackParamList = {
  LoginWithPasscode: undefined;
  Home: undefined;
  UserManagement: undefined;
  BookItems0: undefined;
  Bookings: undefined;
  CommunityList: undefined;
  CommunityDetails: {
    mode: 'ADD' | 'EDIT';
    community?: Community;
  };

  CommunityMilkAvailability: undefined;
  CommunityStockEntry: undefined;

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

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const loggedIn = await isAuthenticated();

        setAuthenticated(loggedIn);
      } catch (error) {
        console.log('Authentication check failed:', error);

        setAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isCheckingAuth) {
    return null;
  }


  return (
    <NavigationContainer>

      <Stack.Navigator
        initialRouteName = {
          authenticated
            ? 'Home'
            : 'LoginWithPasscode'
          }
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="LoginWithPasscode"
          component={LoginWithPasscodeScreen}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="UserManagement"
          component={UserManagementScreen}
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
          name="CommunityStockEntry"
          component={CommunityStockEntryScreen}
        />

        <Stack.Screen
          name="BookItems0"
          component={BookItemsScreen0}
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

        <Stack.Screen
          name="Bookings"
          component={Bookings}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;