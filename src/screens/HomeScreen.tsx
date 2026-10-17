import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


import {
  getUserFirstName,
  getUserLastName,
  getUserRole,
  clearAuthData,
} from '../auth/authStorage';

//const userRole = 'CUSTOMER';

function HomeScreen() {
  const navigation =
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    await clearAuthData();
    navigation.replace('LoginWithPasscode');
  };


  //const userRole = 'SUPER_ADMIN';

  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const loadUserDetails = async () => {
      const firstName = await getUserFirstName();
      const lastName = await getUserLastName();
      const role = await getUserRole();

      console.log('HOME - FIRST NAME:', firstName);
      console.log('HOME - LAST NAME:', lastName);
      console.log('HOME - USER ROLE:', role);
      

      setUserFirstName(firstName ?? '');
      setUserLastName(lastName ?? '');
      setUserRole(role ?? '');
    };

    loadUserDetails();
  }, []);

  const isCustomer = userRole === 'CUSTOMER';
  const isPocAdmin = userRole === 'POC_ADMIN';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  return (
    <SafeAreaView style={styles.container}>

      <Image
        source={require('../assets/images/MDS_app_background2.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
     />

    <View style={styles.content}>


      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
            <Text style={styles.appTitle}>🥛 ADITI ORGANIC DAIRY </Text>
            {/* {!isCustomer && ( */}
                <Text style={styles.roleBadge}>{userRole}</Text>
            {/* )} */}
        </View>
        <Text style={styles.welcomeText}>Hi, {userFirstName || 'NO FIRST NAME'}</Text>
      </View>

      {/* Milk & Dairy Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>
          Fresh Milk & Dairy
        </Text>

        <Text style={styles.description}>
          Fresh milk and quality dairy products delivered conveniently
          within your community.
        </Text>
      </View>

      {/* Quick Links */}
      <View style={styles.linksContainer}>
        <Text style={styles.sectionTitle}>Useful Links</Text>

        {/* CUSTOMER */}
        {isCustomer && (
          <>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('BookItems0')}
            >
              <Text style={styles.linkIcon}>🥛</Text>
              <Text style={styles.linkText}>Book Milk</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => navigation.navigate('Bookings')}
            >
              <Text style={styles.linkIcon}>📋</Text>
              <Text style={styles.linkText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkIcon}>👤</Text>
              <Text style={styles.linkText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleLogout}
            >
              <Text style={styles.linkIcon}>🚪</Text>
              <Text style={styles.linkText}>Logout</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

          </>
        )}
        {/* end of CUSTOMER links */}

        {/* POC ADMIN */}
        {isPocAdmin && (
          <>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('CommunityStockEntry')}
            >
              <Text style={styles.linkIcon}>🥛</Text>
              <Text style={styles.linkText}>Stock Entry</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('BookItems0')}
            >
              <Text style={styles.linkIcon}>🥛</Text>
              <Text style={styles.linkText}>Book Items</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkIcon}>📋</Text>
              <Text style={styles.linkText}>Today's Bookings</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkIcon}>🏘️</Text>
              <Text style={styles.linkText}>Community Details</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkIcon}>👤</Text>
              <Text style={styles.linkText}>My Profile</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleLogout}
            >
              <Text style={styles.linkIcon}>🚪</Text>
              <Text style={styles.linkText}>Logout</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

          </>
        )}

        {/* SUPER ADMIN */}
        {isSuperAdmin && (
          <>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => navigation.navigate('CommunityList')}
            >
              <Text style={styles.linkIcon}>🏘️</Text>
              <Text style={styles.linkText}>Community Details</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <Text style={styles.linkIcon}>👥</Text>
              <Text style={styles.linkText}>User Management</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('CommunityStockEntry')}
            >
              <Text style={styles.linkIcon}>🥛</Text>
              <Text style={styles.linkText}>Stock Entry</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('BookItems0')}
            >
              <Text style={styles.linkIcon}>🥛</Text>
              <Text style={styles.linkText}>Book Items</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => navigation.navigate('Bookings')}
            >
              <Text style={styles.linkIcon}>📋</Text>
              <Text style={styles.linkText}>Bookings</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkIcon}>👤</Text>
              <Text style={styles.linkText}>My Profile</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleLogout}
            >
              <Text style={styles.linkIcon}>🚪</Text>
              <Text style={styles.linkText}>Logout</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

          </>
        )}
      </View>


    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F5F7FA',
  },

  content: {
    flex: 1,
  },

  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  roleBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
  },

  welcomeText: {
    fontSize: 16,
    marginTop: 25,
  },

  descriptionContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },

  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
  },

  linksContainer: {
    marginHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1565C0',
  },

  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 10,
  },

  linkIcon: {
    fontSize: 22,
    width: 40,
  },

  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },

  linkArrow: {
    marginLeft: 'auto',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1565C0',
  }
});

export default HomeScreen;