import React, {useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../../App';

import {loginWithPasscode} from '../api/usersApi';

import {
  saveAuthData, 
  getUserFirstName,
} from '../auth/authStorage';


type Props = NativeStackScreenProps<
  RootStackParamList,
  'LoginWithPasscode'
>;


const LoginWithPasscodeScreen = ({navigation}: Props) => {

  const [mobileNumber, setMobileNumber] = useState('');
  const [passcode, setPasscode] = useState('');

  const [isLoggingIn, setIsLoggingIn] = useState(false);


  const handleLogin = async () => {

    // ---------------------------------------------
    // Validate mobile number
    // ---------------------------------------------

    if (!mobileNumber.trim()) {
      Alert.alert(
        'Login',
        'Please enter your mobile number.',
      );

      return;
    }


    if (mobileNumber.trim().length < 10) {
      Alert.alert(
        'Login',
        'Please enter a valid mobile number.',
      );

      return;
    }


    // ---------------------------------------------
    // Validate passcode
    // ---------------------------------------------

    if (!passcode.trim()) {
      Alert.alert(
        'Login',
        'Please enter your 4-digit passcode.',
      );

      return;
    }


    if (passcode.trim().length !== 4) {
      Alert.alert(
        'Login',
        'Passcode must be 4 digits.',
      );

      return;
    }


    try {

      setIsLoggingIn(true);


      // -------------------------------------------
      // Call backend login API
      // -------------------------------------------

      const response = await loginWithPasscode({
        mobile_number: mobileNumber.trim(),
        passcode: passcode.trim(),
      });

      console.log('LOGIN RESPONSE:', response);

      // -------------------------------------------
      // Save authentication information
      // -------------------------------------------

      await saveAuthData(
        response.access_token,
        response.refresh_token,
        response.user_id,
        response.user_role,
        response.community_id,
        response.first_name,
        response.last_name,
      );

      const savedFirstName = await getUserFirstName();

      //Alert.alert(
      //  'Login Debug',
      //  `API Name: ${response.first_name}\nSaved Name: ${savedFirstName}`,
      //);


      // -------------------------------------------
      // Navigate to Home
      // -------------------------------------------

      navigation.replace('Home');


    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to login. Please try again.';


      Alert.alert(
        'Login Failed',
        message,
      );


    } finally {

      setIsLoggingIn(false);

    }
  };


  return (

    <SafeAreaView style={styles.container}>

      {/* Header */}

      <View style={styles.header}>

        <Text style={styles.headerTitle}>
          ADITI ORGANIC DAIRY
        </Text>

      </View>


      {/* Background */}

      <View style={styles.background}>

        <Image
          source={require('../assets/images/milkavailability.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />


        {/* Login Card */}

        <View style={styles.card}>

          <Image
            source={require('../assets/images/logo3.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>
            Welcome Back
          </Text>

          <Text style={styles.subtitle}>
            Login to continue
          </Text>


          {/* Mobile Number */}

          <Text style={styles.inputLabel}>
            Mobile Number
          </Text>

          <TextInput
            style={styles.input}
            value={mobileNumber}
            onChangeText={value => {
              const numericValue = value.replace(/[^0-9]/g, '');
              setMobileNumber(numericValue);
            }}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            maxLength={10}
            editable={!isLoggingIn}
          />


          {/* Passcode */}

          <Text style={styles.inputLabel}>
            Passcode
          </Text>

          <TextInput
            style={styles.input}
            value={passcode}
            onChangeText={value => {
              const numericValue = value.replace(
                /[^0-9]/g,
                '',
              );

              setPasscode(numericValue);
            }}
            placeholder="Enter 4-digit passcode"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            editable={!isLoggingIn}
          />


          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoggingIn && styles.loginButtonDisabled,
            ]}
            disabled={isLoggingIn}
            onPress={handleLogin}
          >
            {isLoggingIn ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
                <Text style={styles.loginButtonText}>
                  {'  '}Logging in...
                </Text>
              </View>

            ) : (
              <Text style={styles.loginButtonText}> LOGIN </Text>
            )}
          </TouchableOpacity>

        </View>

      </View>

    </SafeAreaView>
  );
};


export default LoginWithPasscodeScreen;


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#97d9fd',
  },


  header: {
    minHeight: 65,
    paddingHorizontal: 16,
    paddingVertical: 10,

    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#97d9fd',
  },


  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },


  background: {
    flex: 1,
    padding: 0,
  },


  backgroundImage: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    width: '100%',
    height: '100%',
  },


  card: {
    marginTop: 30,
    marginHorizontal: 16,

    backgroundColor: 'rgba(255, 255, 255, 0.95)',

    borderRadius: 20,

    padding: 22,

    elevation: 5,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.15,
    shadowRadius: 6,
  },


  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1769C2',

    textAlign: 'center',
  },


  subtitle: {
    fontSize: 15,
    color: '#555',

    textAlign: 'center',

    marginTop: 6,
    marginBottom: 25,
  },


  inputLabel: {
    fontSize: 15,
    fontWeight: '600',

    color: '#333',

    marginBottom: 6,
  },


  input: {
    height: 50,

    borderWidth: 1,
    borderColor: '#D5D5D5',

    borderRadius: 10,

    paddingHorizontal: 14,

    fontSize: 16,

    color: '#222',

    backgroundColor: '#FFFFFF',

    marginBottom: 18,
  },


  loginButton: {
    marginTop: 8,
    backgroundColor: '#1769C2',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },


  loginButtonDisabled: {
    opacity: 0.7,
  },


  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },


  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 12,
  },

});