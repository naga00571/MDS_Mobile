import React, {useEffect, useState} from 'react';
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

import {Picker} from '@react-native-picker/picker';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';

type CommunityInventory = {
  COMMUNITY_ID: number;
  POC_USER_ID: number;
  COMMUNITY_NAME: string;
  TODAY_DATE: string;
  AVAILABILITY_ID: number | null;
  AVAILABILITY_DATE: string | null;
  INITIAL_QTY: number | null;
  BOOKED_QTY: number | null;
  REMAINING_QTY: number | null;
  IS_AVAILABLE: boolean | null;
  IS_ACTIVE: boolean | null;
  IS_DELETE: boolean | null;
  IS_NOTIFICATION_SENT: boolean | null;
  NOTIFICATION_SENT_AT: string | null;
  CREATED_AT: string | null;
  UPDATED_AT: string | null;
  DELETED_AT: string | null;
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CommunityMilkAvailability'
>;

// we need loggged-in-user id , role & community-id if associated
const userID = 1002;
const userRole = 'CUSTOMER';

//const userRole = 'SUPER_ADMIN';

//const userID = 1001;
//const userRole = 'POC_ADMIN';

const customerCommunityId = 11;
const isInventoryAdminUser =
  userRole === 'SUPER_ADMIN' || userRole === 'POC_ADMIN';

const CommunityMilkAvailabilityScreen = ({navigation}: Props) => {

  const [inventoryData, setInventoryData] = useState<CommunityInventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialQty, setInitialQty] = useState(''); 
  
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    getTodaysCommunityInventory();
  }, []);


  let filteredInventoryData: CommunityInventory[] = [];

  if (userRole === 'SUPER_ADMIN' || userRole === 'POC_ADMIN') {
    filteredInventoryData = inventoryData.filter(
      item => item.POC_USER_ID === userID,
    );
  } else if (userRole === 'CUSTOMER' || userRole === '') {
    filteredInventoryData = inventoryData.filter(
      item => item.COMMUNITY_ID === customerCommunityId,
    );
  }

  // here, inventoryData contains the data from SQL function
  // applying filter by POC_USER_ID
  //const filteredInventoryData = inventoryData.filter(
  //  item => item.POC_USER_ID === userID,
  //);

  // get the number of communities that POC_USER_ID handles
  const communityCount = filteredInventoryData.length;
  // 0 → no community assigned
  // 1 → one community → we can auto-select it
  // 2+ → multiple communities → we'll show the dropdown

  useEffect(() => {
    if (communityCount === 1) {
        setSelectedCommunityId(filteredInventoryData[0].COMMUNITY_ID);
    } 
    // else {
    //     setSelectedCommunityId(null);
    // }
  }, [communityCount]);

  // [communityCount, filteredInventoryData]);

  const selectedCommunity = filteredInventoryData.find(
    item => item.COMMUNITY_ID === selectedCommunityId,
  );

  const getTodaysCommunityInventory = async () => {
    try {

        setIsLoading(true);

        const response = await fetch(
            'http://10.0.2.2:8000/api/community-todays-availability/',
        );

        if (!response.ok) {
            throw new Error('Unable to load today\'s milk inventory.');
        }

        const data = await response.json();

        console.log('MILK INVENTORY API CALLED');
        console.log('API DATA:', data);
        console.log('Today\'s Community Milk Inventory:', data);

        setInventoryData(data);
    } catch (error) {
        console.error('Get today\'s community inventory error:', error);
    } finally {
        setIsLoading(false);
    }
  };
  // end of [getTodaysCommunityInventory]

  // render Inventory Stock based on conditions: start 
  const renderInventorySection = () => {

    // No community selected yet
    if (!selectedCommunity) {
        return null;
    }

    // No inventory for today
    if (
        selectedCommunity.INITIAL_QTY === null
    ) {
        return (
        <View>
            {/* Initial Quantity */}
            <Text>
            Initial Milk Quantity
            </Text>

            {/* Textbox will be added here */}
            <TextInput
                style={styles.quantityInput}
                value={initialQty}
                onChangeText={text => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setInitialQty(numericValue);
                }}
                keyboardType="numeric"
                maxLength={3}
                placeholder="Enter quantity"
            />

            {/* SAVE button will be added here : start */}
            <TouchableOpacity
                style={[
                    styles.saveButton,
                    (!initialQty || Number(initialQty) <= 0) &&
                        styles.saveButtonDisabled,
                ]}
                onPress={handleSaveInventory}
                disabled={!initialQty || Number(initialQty) <= 0 || isLoading}
            >
              {isLoading ? (
                <View style={styles.savingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>
                      Saving...
                    </Text>
                </View>
              ) : (
                  <Text style={styles.saveButtonText}>
                      SAVE
                  </Text>
              )}
            </TouchableOpacity>
            {/* SAVE button will be added here : end */}

        </View>
        );
    }

    // Inventory already exists
    if (
        selectedCommunity.INITIAL_QTY !== null &&
        selectedCommunity.REMAINING_QTY !== null
    ) {
        return (
        <View>
            {/* Initial Quantity */}
            <Text>Initial Quantity</Text>

            <Text style={styles.inventoryQuantityText}>
                {selectedCommunity.INITIAL_QTY} Ltrs
            </Text>

            <View style={styles.spacing} />

            {/* Booked Quantity */}
            <Text>Booked Quantity</Text>

            <Text style={styles.inventoryQuantityText}>
              {selectedCommunity.BOOKED_QTY ?? 0} Ltrs
            </Text>

            <View style={styles.spacing} />

            {/* Remaining Quantity  style={styles.availableText} */}
            <Text>Remaining Quantity</Text>

            <Text style={styles.quantityText}>
              {selectedCommunity.REMAINING_QTY} Ltrs
            </Text>
            <Text style={styles.availableText}>Available</Text>

            {/* EDIT / CANCEL buttons will be added here */}
        </View>
        );
    }

    return null;
  };
  // render Inventory Stock based on conditions: END 
  
  // SAVE button for Initial Stock Entry : START //
  const handleSaveInventory = async () => {

    // Validate Initial Quantity
    if (!initialQty || Number(initialQty) <= 0) {
      Alert.alert(
        'Invalid Quantity',
        'Please enter a valid initial milk quantity.',
      );
      return;
    }

    try {

        setIsLoading(true);

        const response = await fetch(
            'http://10.0.2.2:8000/api/community-todays-availability/',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    community_id: selectedCommunityId,
                    availability_date: availabilityDate,
                    initial_qty: Number(initialQty),
                }),
            },
        );

        if (!response.ok) {
            throw new Error('Unable to save today\'s milk inventory.');
        }


        // Validation will be added here later

        const data = await response.json();
        
        console.log('SAVE MILK INVENTORY API CALLED');
        console.log('SAVED INVENTORY:', data);

        await getTodaysCommunityInventory();

        Alert.alert(
            'Success',
            'Today\'s milk inventory saved successfully.',
        );

        
    } catch (error) {
        console.error('Save today\'s community inventory error:', error);
    } finally {
        setIsLoading(false);
    }
  };
  // SAVE button for Initial Stock Entry : END //

  // Temporary value for UI development.
  // We will replace this with the API value later.
  // const availableQty = 180;

  // Today's date will come from the backend/API later.
  // const availabilityDate = '05 Sep 2026';

  // Use today's inventory returned by the API
  const todayInventory = inventoryData[0];
  // const availableQty = todayInventory?.REMAINING_QTY ?? 0;
  const availableQty = selectedCommunity?.REMAINING_QTY ?? 0;
  // const availabilityDate = todayInventory?.TODAY_DATE ?? '';
  const availabilityDate = selectedCommunity?.TODAY_DATE 
    ? new Date(selectedCommunity.TODAY_DATE).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';
  const communityName = selectedCommunity?.COMMUNITY_NAME ?? '';

  const handleBookMilk = () => {
    // Booking functionality will be added later.
    if (!selectedCommunityId) {
      return;
    }

    navigation.navigate('BookMilk', {
      communityId: selectedCommunityId,
    });
  };

  return (
      <SafeAreaView style={styles.container} >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            COMMUNITY MILK AVAILABILITY
          </Text>
        </View>

        {/* Background starts below header */}
        <View style={styles.background}>
            <Image
                source={require('../assets/images/milkavailability.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            {/* Community Selection */}
            {communityCount > 1 && (
                <View style={styles.communityPickerContainer}>
                <Text style={styles.communityPickerLabel}>
                    Select Community
                </Text>

                <View style={styles.communityPicker}>
                    <Picker
                      selectedValue={selectedCommunityId}
                      onValueChange={value => setSelectedCommunityId(value)}
                    >
                    <Picker.Item
                        label="Select Community"
                        value={null}
                    />

                    {filteredInventoryData.map(item => (
                        <Picker.Item
                        key={item.COMMUNITY_ID}
                        label={item.COMMUNITY_NAME}
                        value={item.COMMUNITY_ID}
                        />
                    ))}
                    </Picker>
                </View>
                </View>
            )}



            {/* Availability Card */}
            <View style={styles.card}>

            <Text style={styles.dateText}>
                Today – <Text style={styles.dateValue}>{availabilityDate}</Text>
            </Text>

            <Text style={styles.communityNameText}>
                {communityName}
            </Text>

            <View style={styles.divider} />

            {/* this is to render qty fields */}
            {isInventoryAdminUser ? (
                renderInventorySection()
            ) : (
                <>
                    <Text style={styles.availableLabel}>
                        Available Milk
                    </Text>

                    <Text style={styles.inventoryQuantityText}>
                        {availableQty} Ltrs
                    </Text>

                    <Text style={styles.availableText}>
                        Available
                    </Text>
                </>
            )}

            {/* Book Button */}
            <TouchableOpacity
                style={[
                  styles.bookButton,
                  availableQty <= 0 && styles.bookButtonDisabled,
                ]}
                disabled={availableQty <= 0}  
                onPress={handleBookMilk}
            >
                <Text style={styles.bookButtonText}>
                🥛  Book Your Milk
                </Text>
            </TouchableOpacity>

            </View>
      
        </View>
      </SafeAreaView>


    
  );

};
// end of [CommunityMilkAvailabilityScreen]

export default CommunityMilkAvailabilityScreen;

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
    position: 'absolute',         // fill the container
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
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

  card: {
    marginTop: 20,
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

  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },

  availableLabel: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },

  quantityText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1769C2',
  },

  availableText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#279A35',
    marginTop: 2,
  },

  bookButton: {
    marginTop: 25,
    backgroundColor: '#1769C2',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  communityPickerContainer: {
    marginTop: 20,
    marginHorizontal: 16,
  },

  communityPickerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },

  communityPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },

  dateValue: {
    fontWeight: 'bold',
  },

  quantityInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    height: 60,
    width: 150,
    paddingHorizontal: 12,
    fontSize: 30,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
   },

 saveButton: {
    marginTop: 20,
    backgroundColor: '#1769C2',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
 },

 saveButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '700',
 },

 saveButtonDisabled: {
    opacity: 0.5,
 },

 inventoryQuantityText:{
  fontSize: 30,
  fontWeight: '800',
 },

 spacing: {
  height: 10,
},

bookButtonDisabled: {
  opacity: 0.5,
},

savingContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

});