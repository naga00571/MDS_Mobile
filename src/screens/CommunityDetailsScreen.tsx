import {useEffect, useState} from 'react';
// import React, {useState} from 'react';
import {
  ActivityIndicator,
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

type Props = NativeStackScreenProps<
    RootStackParamList,
    'CommunityDetails'
  >;

function CommunityDetailsScreen({route, navigation}: Props) {

  const {mode} = route.params;
  const community = route.params.community;

  useEffect(() => {
    if (mode === 'EDIT' && community) {
        setCommunityName(community.community_name);
        setAddress(community.address);
        setPocName(community.poc_name);
        setPocNumber(community.poc_number);
    }
  }, [mode, community]);

  const [communityName, setCommunityName] = useState('');
  const [address, setAddress] = useState('');
  const [pocName, setPocName] = useState('');
  const [pocNumber, setPocNumber] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const saveCommunity = async () => {
    // Basic validation
    if (!communityName.trim()) {
      Alert.alert('Validation', 'Please enter community name.');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Validation', 'Please enter community address.');
      return;
    }

    if (!pocName.trim()) {
      Alert.alert('Validation', 'Please enter POC name.');
      return;
    }

    if (!pocNumber.trim()) {
      Alert.alert('Validation', 'Please enter POC number.');
      return;
    }

    if (!/^[0-9]{10}$/.test(pocNumber)) {
        Alert.alert('Validation', 'POC contact number must be exactly 10 digits.');
        return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        'http://10.0.2.2:8000/api/community/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ID: mode === 'EDIT' && community
              ? community.id
              : null,
            COMMUNITY_NAME: communityName.trim(),
            ADDRESS: address.trim(),
            ADDRESS2: null,
            LATITUDE: null,
            LONGITUDE: null,
            POC_NAME: pocName.trim(),
            POC_NUMBER: pocNumber.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to save community.');
      }

      Alert.alert(
        'Success',
        mode === 'ADD'
            ? 'Community saved successfully.'
            : 'Community updated successfully.',
        [
            {
            text: 'OK',
            onPress: () => navigation.goBack(),
            },
        ],
      );

      // Clear form after successful INSERT
      if (mode === 'ADD') {
        setCommunityName('');
        setAddress('');
        setPocName('');
        setPocNumber('');
      }

    } catch (error) {
      console.error('Save community error:', error);

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Unable to save community.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <Image
        source={require('../assets/images/MDS_app_background2.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >



        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
  
          <Text style={styles.headerTitle}>
            {mode === 'ADD' ? 'ADD COMMUNITY' : 'EDIT COMMUNITY'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>

          <Text style={styles.label}>
            Community Name
          </Text>

          <TextInput
            style={styles.input}
            value={communityName}
            onChangeText={setCommunityName}
            placeholder="Enter community name"
          />

          <Text style={styles.label}>
            Address
          </Text>

          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter community address"
            multiline
          />

          <Text style={styles.label}>
            POC Name
          </Text>

          <TextInput
            style={styles.input}
            value={pocName}
            onChangeText={setPocName}
            placeholder="Enter POC name"
          />

          <Text style={styles.label}>
            POC Number
          </Text>

          <TextInput
            style={styles.input}
            value={pocNumber}
            onChangeText={text => {
                // Allow only digits
                const digitsOnly = text.replace(/[^0-9]/g, '');
                setPocNumber(digitsOnly);
            }}
            placeholder="Enter 10 digit POC mobile number"
            keyboardType="number-pad"
            maxLength={10}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={saveCommunity}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  SAVING...
                </Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>
                {mode === 'ADD'
                    ? 'SAVE COMMUNITY'
                    : 'UPDATE COMMUNITY'}
              </Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  header: {
    minHeight: 65,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },

  backButton: {
    marginRight: 10,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },

  backButtonText: {
    fontSize: 28,
    fontWeight: '400',
  },

  formContainer: {
    padding: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },

  multilineInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  saveButton: {
    height: 48,
    marginTop: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default CommunityDetailsScreen;