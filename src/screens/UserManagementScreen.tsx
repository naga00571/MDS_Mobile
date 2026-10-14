import React, {useEffect, useState} from 'react';

import {
  Alert,  
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';

import {
    createUserWithPassCode,
    getUsers,
    GetUsersResponse,
} from '../api/usersApi';


type Props = NativeStackScreenProps<
  RootStackParamList,
  'UserManagement'
>;


const UserManagementScreen = ({navigation}: Props) => {

  const [activeTab, setActiveTab] = useState<'CREATE' | 'LIST'>('CREATE');

  // Create User fields
  const [mobileNumber, setMobileNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [address2, setAddress2] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  // Normal: [ CREATE USER ]
  // During API call:
  // [ CREATING... ]   ← disabled

  const [userList, setUserList] = useState<GetUsersResponse[]>([]);

  // Temporary user list data for UI development.
  // This will come from the backend API later.
  /* const userList = [
    {
      id: 1001,
      mobileNumber: '9876543210',
      firstName: 'Ramesh',
      passcode: '5831',
      community: 'Green Valley',
      role: 'CUSTOMER',
      isActive: true,
    },
    {
      id: 1002,
      mobileNumber: '9876501234',
      firstName: 'Suresh',
      passcode: '7294',
      community: 'Lakshmi Nagar',
      role: 'CUSTOMER',
      isActive: true,
    },
  ]; */


  const handleCreateUser = async () => {
    // API integration will be added later.

    // -----------------------------
    // Validate Mobile Number
    // -----------------------------
    if (!mobileNumber.trim()) {
        Alert.alert(
            'Validation',
            'Please enter mobile number.',
        );
        return;
    }

    if (mobileNumber.length !== 10) {
        Alert.alert(
            'Validation',
            'Mobile number must be 10 digits.',
        );
        return;
    }


    // -----------------------------
    // Validate First Name
    // -----------------------------
    if (!firstName.trim()) {
        Alert.alert(
            'Validation',
            'Please enter first name.',
        );
        return;
    }

    // -----------------------------
    // Start Create User
    // -----------------------------
    setIsCreating(true);

    try {

        const result = await createUserWithPassCode({

            mobile_number: mobileNumber,
            first_name: firstName.trim(),
            last_name:
                lastName.trim() || null,
            address:
                address.trim() || null,
            address2:
                address2.trim() || null,
            latitude: null,
            longitude: null,
            user_role: 'CUSTOMER',

        });


        // -----------------------------
        // Success
        // -----------------------------
        Alert.alert(
            'User Created',
            `User created successfully.\n\n` +
            `User ID: ${result.user_id}\n` +
            `Name: ${result.first_name}\n` +
            `Mobile: ${result.mobile_number}\n\n` +
            `Initial Passcode: ${result.initial_passcode}`,
            [
                {
                text: 'OK',
                onPress: () => {
                    // Clear Create User form
                    setMobileNumber('');
                    setFirstName('');
                    setLastName('');
                    setAddress('');
                    setAddress2('');

                    // Go to User List    
                    setActiveTab('LIST');
                    loadUsers();
                },
                },
            ],
            {
                cancelable: false,
            },
        );

    } catch (error) {
        // -----------------------------
        // Error
        // -----------------------------

        const message =
            error instanceof Error
                ? error.message
                : 'Unable to create user.';

        Alert.alert(
            'Create User Failed',
            message,
        );

    } finally {
        // Always enable button again
        setIsCreating(false);
    }

    console.log('CREATE USER');

    console.log({
      mobileNumber,
      firstName,
      lastName,
      address,
      address2,
      userRole: 'CUSTOMER',
    });

  };
  // end of handleCreateUser : function


  // loadUsers (sp_fn_get_users()) : START
  const loadUsers = async () => {

    try {
        const data = await getUsers();

        setUserList(data);
    } catch (error) {

        const message =
        error instanceof Error
            ? error.message
            : 'Unable to load users.';

        Alert.alert(
            'User List',
            message,
        );
    }
  };
  // loadUsers (sp_fn_get_users()) : END

  // The [] means: Run loadUsers() once when UserManagementScreen is loaded.
  useEffect(() => {
    loadUsers();
  }, []);




  const renderCreateUser = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Create User
          </Text>

          <Text style={styles.sectionDescription}>
            Add a new customer to the MDS application.
          </Text>

          <View style={styles.divider} />


          {/* Mobile Number */}

          <Text style={styles.inputLabel}>
            Mobile Number *
          </Text>

          <TextInput
            style={styles.input}
            value={mobileNumber}
            onChangeText={text => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setMobileNumber(numericValue);
            }}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor="#999"
          />


          {/* First Name */}

          <Text style={styles.inputLabel}>
            First Name *
          </Text>

          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />


          {/* Last Name */}

          <Text style={styles.inputLabel}>
            Last Name
          </Text>

          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />


          {/* Address */}

          <Text style={styles.inputLabel}>
            Address
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
            ]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
            placeholderTextColor="#999"
            multiline
          />


          {/* Address 2 */}

          <Text style={styles.inputLabel}>
            Address 2
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
            ]}
            value={address2}
            onChangeText={setAddress2}
            placeholder="Enter additional address"
            placeholderTextColor="#999"
            multiline
          />


          {/* Role */}

          <Text style={styles.inputLabel}>
            Role
          </Text>

          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>
              CUSTOMER
            </Text>
          </View>


          {/* Passcode Information */}

          <View style={styles.infoBox}>

            <Text style={styles.infoTitle}>
              Initial Passcode
            </Text>

            <Text style={styles.infoText}>
              A random 4-digit passcode will be generated
              automatically after the user is created.
            </Text>

          </View>


          {/* Create Button */}

          <TouchableOpacity
            style={[
                styles.primaryButton,
                isCreating && styles.disabledButton,
            ]}
            onPress={handleCreateUser}
            disabled={isCreating}
            >
                <Text style={styles.primaryButtonText}>
                    {isCreating ? 'CREATING...' : 'CREATE USER'}
                </Text>
            </TouchableOpacity>

        </View>

      </ScrollView>
    );
  };


  const renderUserList = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.listHeaderCard}>

          <Text style={styles.sectionTitle}>
            User List
          </Text>

          <Text style={styles.sectionDescription}>
            MDS users and their community details.
          </Text>

        </View>


        {userList.map(user => (

          <View
            key={user.user_id}
            style={styles.userCard}
          >

            {/* User ID */}

            <View style={styles.userRow}>

              <Text style={styles.userLabel}>
                User ID
              </Text>

              <Text style={styles.userValue}>
                {user.user_id}
              </Text>

            </View>


            {/* Mobile */}

            <View style={styles.userRow}>

              <Text style={styles.userLabel}>
                Mobile
              </Text>

              <Text style={styles.userValue}>
                {user.mobile_number}
              </Text>

            </View>


            {/* First Name */}

            <View style={styles.userRow}>

              <Text style={styles.userLabel}>
                First Name
              </Text>

              <Text style={styles.userValue}>
                {user.first_name}
              </Text>

            </View>


            {/* Passcode */}

            <View style={styles.userRow}>

              <Text style={styles.userLabel}>
                Passcode
              </Text>

              <Text style={styles.passcodeValue}>
                {user.passcode}
              </Text>

            </View>


            {/* Community */}

            <View style={styles.userRow}>

              <Text style={styles.userLabel}>
                Community
              </Text>

              <Text style={styles.userValue}>
                {user.community_name}
              </Text>

            </View>


            {/* Role */}

            <View style={styles.userRow}>

              <Text style={styles.userLabel}>
                Role
              </Text>

              <Text style={styles.userValue}>
                {user.user_role}
              </Text>

            </View>


            {/* Status */}

            <View style={styles.userRow}>

              <Text style={styles.userLabel}>
                Status
              </Text>

              <Text
                style={
                  user.is_active
                    ? styles.activeText
                    : styles.inactiveText
                }
              >
                {user.is_active ? 'ACTIVE' : 'INACTIVE'}
              </Text>

            </View>

          </View>

        ))}

      </ScrollView>
    );
  };


  return (

    <SafeAreaView style={styles.container}>

      {/* Header */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>
            ←
          </Text>
        </TouchableOpacity>


        <Text style={styles.headerTitle}>
          USER MANAGEMENT
        </Text>

      </View>


      {/* Background */}

      <View style={styles.background}>

        <Image
          source={require('../assets/images/milkavailability.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />


        {/* Tabs */}

        <View style={styles.tabContainer}>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'CREATE' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('CREATE')}
          >

            <Text
              style={[
                styles.tabText,
                activeTab === 'CREATE' &&
                  styles.activeTabText,
              ]}
            >
              CREATE USER
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'LIST' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('LIST')}
          >

            <Text
              style={[
                styles.tabText,
                activeTab === 'LIST' &&
                  styles.activeTabText,
              ]}
            >
              USER LIST
            </Text>

          </TouchableOpacity>

        </View>


        {/* Tab Content */}

        {activeTab === 'CREATE'
          ? renderCreateUser()
          : renderUserList()}

      </View>

    </SafeAreaView>

  );
};


export default UserManagementScreen;


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#97d9fd',
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


  backButton: {
    marginRight: 10,

    paddingVertical: 5,
    paddingHorizontal: 4,
  },


  backIcon: {
    fontSize: 28,
    fontWeight: '400',
  },


  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },


  /* ---------------------------
     Tabs
  ---------------------------- */

  tabContainer: {
    marginTop: 16,
    marginHorizontal: 16,

    flexDirection: 'row',

    backgroundColor: 'rgba(255, 255, 255, 0.95)',

    borderRadius: 12,

    overflow: 'hidden',

    elevation: 3,
  },


  tab: {
    flex: 1,

    height: 50,

    justifyContent: 'center',
    alignItems: 'center',
  },


  activeTab: {
    backgroundColor: '#1769C2',
  },


  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },


  activeTabText: {
    color: '#FFFFFF',
  },


  /* ---------------------------
     Create User
  ---------------------------- */

  card: {
    marginTop: 16,
    marginHorizontal: 16,

    marginBottom: 30,

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


  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },


  sectionDescription: {
    marginTop: 5,

    fontSize: 14,

    color: '#666',

    lineHeight: 20,
  },


  divider: {
    height: 1,

    backgroundColor: '#E5E5E5',

    marginVertical: 16,
  },


  inputLabel: {
    fontSize: 15,

    fontWeight: '600',

    color: '#333',

    marginBottom: 6,

    marginTop: 12,
  },


  input: {
    borderWidth: 1,

    borderColor: '#CCCCCC',

    borderRadius: 10,

    height: 50,

    paddingHorizontal: 12,

    fontSize: 16,

    backgroundColor: '#FFFFFF',
  },


  multilineInput: {
    height: 80,

    paddingTop: 12,

    textAlignVertical: 'top',
  },


  roleContainer: {
    height: 50,

    borderWidth: 1,

    borderColor: '#CCCCCC',

    borderRadius: 10,

    paddingHorizontal: 12,

    justifyContent: 'center',

    backgroundColor: '#F5F5F5',
  },


  roleText: {
    fontSize: 16,

    fontWeight: '600',

    color: '#555',
  },


  infoBox: {
    marginTop: 20,

    padding: 14,

    borderRadius: 12,

    backgroundColor: '#EAF5FF',

    borderWidth: 1,

    borderColor: '#C9E6FA',
  },


  infoTitle: {
    fontSize: 15,

    fontWeight: '700',

    color: '#1769C2',
  },


  infoText: {
    marginTop: 4,

    fontSize: 13,

    lineHeight: 19,

    color: '#555',
  },


  primaryButton: {
    marginTop: 25,
    backgroundColor: '#1769C2',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },


  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  disabledButton: {
    backgroundColor: '#999999',
  },

  /* ---------------------------
     User List
  ---------------------------- */

  listHeaderCard: {
    marginTop: 16,

    marginHorizontal: 16,

    padding: 18,

    backgroundColor: 'rgba(255, 255, 255, 0.95)',

    borderRadius: 20,

    elevation: 5,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.15,

    shadowRadius: 6,
  },


  userCard: {
    marginTop: 14,

    marginHorizontal: 16,

    padding: 18,

    backgroundColor: 'rgba(255, 255, 255, 0.95)',

    borderRadius: 20,

    elevation: 5,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.15,

    shadowRadius: 6,

    marginBottom: 2,
  },


  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },


  userLabel: {
    width: 95,

    fontSize: 14,

    color: '#666',

    fontWeight: '600',
  },


  userValue: {
    flex: 1,

    fontSize: 15,

    color: '#333',

    fontWeight: '600',
  },


  passcodeValue: {
    flex: 1,

    fontSize: 18,

    color: '#1769C2',

    fontWeight: '800',

    letterSpacing: 2,
  },


  activeText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#279A35',
  },


  inactiveText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#C62828',
  },

});