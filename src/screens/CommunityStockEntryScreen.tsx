import React, {useEffect, useState} from 'react';

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

import {SafeAreaView} from 'react-native-safe-area-context';
import {Picker} from '@react-native-picker/picker';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {API_BASE_URL} from '../api/apiConfig';

import type {RootStackParamList} from '../../App';

import {
  getUserId,
  getUserRole,
  getAccessToken,
} from '../auth/authStorage';

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
  'CommunityStockEntry'
>;

const CommunityStockEntryScreen = ({navigation}: Props) => {

    // State 1: Store communities returned by the API
  const [communities, setCommunities] = useState<CommunityInventory[]>([]);
  // State 2: Store the selected community ID
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
  // State 3: Track API loading status
  const [loading, setLoading] = useState<boolean>(true);

  const [additionalStockQty, setAdditionalStockQty] = useState<string>('');
  const [savingStock, setSavingStock] = useState<boolean>(false);

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        // 1. Get logged-in user details
        const loggedInUserId = await getUserId();
        const loggedInUserRole = await getUserRole();

        // 2. Get community information from existing API
        const response = await fetch(
          `${API_BASE_URL}/api/community-todays-availability/`,
        );

        if (!response.ok) {
          throw new Error(
            'Unable to retrieve community information.',
          );
        }

        const data: CommunityInventory[] = await response.json();

        // 3. Identify communities based on role
        let userCommunities: CommunityInventory[] = [];

        if (loggedInUserRole === 'SUPER_ADMIN') {
          userCommunities = data;
        } else if (loggedInUserRole === 'POC_ADMIN') {
          userCommunities = data.filter(
            item =>
              item.POC_USER_ID === Number(loggedInUserId),
          );
        }

        setCommunities(userCommunities);

        if (userCommunities.length > 0) {
            setSelectedCommunityId(
                String(userCommunities[0].COMMUNITY_ID),
            );
        }

        // 4. Display details for testing : START
        //const communityDetails =
        //  userCommunities.length > 0
        //    ? userCommunities
        //        .map(
        //          item =>
        //            `${item.COMMUNITY_NAME} (ID: ${item.COMMUNITY_ID})`,
        //        )
        //        .join('\n')
        //    : 'No communities found in today’s availability data.';

        //Alert.alert(
        //  'Community Stock Entry - User Details',
        //  `User ID: ${loggedInUserId ?? 'Not found'}\n` +
        //    `Role: ${loggedInUserRole ?? 'Not found'}\n\n` +
        //    `Communities:\n${communityDetails}`,
        //);
        // test purpose: END

      } catch (error) {
        console.error(
          'Community Stock Entry initialization error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to load user and community details.',
        );
      } finally {
        setLoading(false);
      }

    };

    loadCommunities();
  }, []);



    // Refresh community inventory while preserving selection
    const refreshCommunities = async () => {
        const loggedInUserId = await getUserId();
        const loggedInUserRole = await getUserRole();

        const accessToken = await getAccessToken();

        if (!accessToken) {
            throw new Error(
                'Access token not found. Please log in again.',
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/api/community-todays-availability/`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error(
            'Stock was saved, but the inventory refresh failed.',
            );
        }

        const data: CommunityInventory[] = await response.json();

        let userCommunities: CommunityInventory[] = [];

        if (loggedInUserRole === 'SUPER_ADMIN') {
            userCommunities = data;
        } else if (loggedInUserRole === 'POC_ADMIN') {
            userCommunities = data.filter(
                item => item.POC_USER_ID === Number(loggedInUserId),
            );
        }

        setCommunities(userCommunities);

        // Keep the currently selected community if it still exists
        const selectedStillExists = userCommunities.some(
            item => String(item.COMMUNITY_ID) === selectedCommunityId,
        );

        if (!selectedStillExists && userCommunities.length > 0) {
            setSelectedCommunityId(
                String(userCommunities[0].COMMUNITY_ID),
            );
        }
    };
    // Refresh community inventory while preserving selection

  const todayDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const selectedCommunity = communities.find(
    item => String(item.COMMUNITY_ID) === selectedCommunityId,
  );

  const initialQty = Number(
    selectedCommunity?.INITIAL_QTY ?? 0,
  );

  const bookedQty = Number(
    selectedCommunity?.BOOKED_QTY ?? 0,
  );

  const remainingQty = Number(
    selectedCommunity?.REMAINING_QTY ?? 0,
  );

  const handleAddStock = async () => {
    if (!selectedCommunity) {
        Alert.alert(
            'Select Community',
            'Please select a community first.',
        );
        return;
    }

    const quantity = Number(additionalStockQty);

    if (
        additionalStockQty.trim() === '' ||
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        Alert.alert(
            'Invalid Quantity',
            'Please enter a quantity greater than zero.',
        );
        return;
    }

    //Alert.alert(
    //    'Validation Successful',
    //    `Community: ${selectedCommunity.COMMUNITY_NAME}\n` +
    //    `Additional Stock: ${quantity} litres\n\n` +
    //    'Backend saving will be connected in the next step.',
    //);


    if (savingStock) {
        return;
    }

    setSavingStock(true);

    try {

        // 1. Retrieve the logged-in user's access token
        const accessToken = await getAccessToken();

        if (!accessToken) {
        Alert.alert(
            'Session Expired',
            'Please log in again before adding stock.',
        );
        return;
        }

        // 2. Call the Add Stock API
        const response = await fetch(
        `${API_BASE_URL}/api/community-todays-availability/add-stock`,
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
            community_id: selectedCommunity.COMMUNITY_ID,
            entry_qty: quantity,
            }),
        },
        );

        // 3. Read the API response
        const responseData = await response.json();

        if (!response.ok) {
        throw new Error(
            responseData.detail ??
            'Unable to add stock. Please try again.',
        );
        }

        // 4. Clear the input after a successful save
        setAdditionalStockQty('');

        // 5. Refresh the inventory summary
        await refreshCommunities();


        // 6. Display success
        Alert.alert(
            'Success',
            `Added ${quantity} litres of milk to ` +
                `${selectedCommunity.COMMUNITY_NAME}.`,
        );

    } catch (error) {
        console.error('Add stock API error:', error);

        Alert.alert(
            'Add Stock Failed',
            error instanceof Error
                ? error.message
                : 'Unable to add stock. Please try again.',
        );

    } finally {
        setSavingStock(false);
    }



    
   };
   // end of handleAddStock


  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          COMMUNITY STOCK ENTRY
        </Text>
      </View>

      {/* Background */}
      <View style={styles.background}>
        <Image
          source={require(
            '../assets/images/milkavailability.png'
          )}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.card}>

                {/* Today's date at the top */}
                <Text style={styles.dateText}>TODAY: {todayDate}</Text>

                <View style={styles.divider} />

                {loading ? (
                    <ActivityIndicator size="large" color="#16834A" />
                ) : communities.length === 0 ? (
                    <Text style={styles.availableLabel}>
                        No communities found for your account.
                    </Text>
                ) : (
                <>
                    <Text style={styles.fieldLabel}>SELECT COMMUNITY</Text>

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedCommunityId}
                            onValueChange={(value: string) =>
                            setSelectedCommunityId(value)
                            }
                            style={styles.picker}
                            dropdownIconColor="#333">
                                {communities.map(item => (
                                    <Picker.Item
                                        key={item.COMMUNITY_ID}
                                        label={item.COMMUNITY_NAME}
                                        value={String(item.COMMUNITY_ID)}
                                    />
                                ))}
                        </Picker>
                    </View>

                    {selectedCommunity && (
                        <View style={styles.selectedCommunity}>
                            <Text style={styles.communityNameText}>
                                {selectedCommunity.COMMUNITY_NAME}
                            </Text>

                            <Text style={styles.communityIdText}>
                                Community ID: {selectedCommunity.COMMUNITY_ID}
                            </Text>

                            {/* <Text style={styles.availableLabel}>
                                Availability Date:{' '}
                                {selectedCommunity.AVAILABILITY_DATE ?? 'No stock entered today'}
                            </Text> */}
                        </View>
                    )}

                    {/* Today's Stock Summary - Three Boxes */}
                    <View style={styles.stockSummaryContainer}>

                        {/* Entry Stock */}
                        <View style={[styles.stockBox, styles.entryStockBox]}>
                            <Text style={styles.stockBoxLabel}>Entry Stock</Text>
                            <Text style={styles.stockBoxValue}>
                                {initialQty.toFixed(0)}
                            </Text>
                            <Text style={styles.stockBoxUnit}>Litres</Text>
                        </View>

                        {/* Booked Quantity */}
                        <View style={[styles.stockBox, styles.bookedStockBox]}>
                            <Text style={styles.stockBoxLabel}>Booked Qty</Text>
                            <Text style={styles.stockBoxValue}>
                                {bookedQty.toFixed(0)}
                            </Text>
                            <Text style={styles.stockBoxUnit}>Litres</Text>
                        </View>

                        {/* Remaining Quantity */}
                        <View style={[styles.stockBox, styles.remainingStockBox]}>
                            <Text style={styles.stockBoxLabel}>Remaining</Text>
                            <Text style={styles.stockBoxValue}>
                                {remainingQty.toFixed(0)}
                            </Text>
                            <Text style={styles.stockBoxUnit}>Litres</Text>
                        </View>

                    </View>

                    {/* Add Additional Stock */}
                    <View style={styles.additionalStockSection}>
                        <Text style={styles.additionalStockTitle}>
                            Add (additional) Stock
                        </Text>

                        <Text style={styles.additionalStockDescription}>
                            Enter the quantity of milk being added.
                        </Text>

                        <Text style={styles.inputLabel}>
                            Quantity (Litres)
                        </Text>

                        <TextInput
                            style={styles.stockInput}
                            value={additionalStockQty}
                            onChangeText={(text) => {
                                // Allow digits and at most one decimal point
                                if (/^\d*\.?\d{0,1}$/.test(text)) {
                                    setAdditionalStockQty(text);
                                }
                            }}
                            placeholder="Enter quantity in litres"
                            keyboardType="decimal-pad"
                            editable={!!selectedCommunity}
                            maxLength={4}
                        />

                        <TouchableOpacity
                            style={[
                                styles.addStockButton,
                                (!selectedCommunity || savingStock) &&
                                     styles.addStockButtonDisabled,
                            ]}
                            onPress={handleAddStock}
                            disabled={!selectedCommunity || savingStock}
                            activeOpacity={0.8}
                        >
                            {savingStock ? (
                                <View style={styles.savingButtonContent}>
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.addStockButtonText}>
                                        Adding Stock...
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.addStockButtonText}>+ Add Stock</Text>
                            )}
                        </TouchableOpacity>

                    </View>

                </>
                )}
            </View>
        </ScrollView> 

      </View>

    </SafeAreaView>
  );
};

export default CommunityStockEntryScreen;

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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },

  communityNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  availableLabel: {
    fontSize: 15,
    color: '#555',
    marginTop: 8,
  },

  scrollContent: {
  paddingBottom: 30,
},

fieldLabel: {
  fontSize: 13,
  fontWeight: '700',
  color: '#555',
  marginBottom: 8,
},

pickerContainer: {
  borderWidth: 1,
  borderColor: '#D6D6D6',
  borderRadius: 10,
  overflow: 'hidden',
  backgroundColor: '#FFFFFF',
},

picker: {
  color: '#333333',
},

selectedCommunity: {
  marginTop: 18,
},

communityIdText: {
  fontSize: 13,
  color: '#666',
  marginTop: 4,
},

stockSummaryContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
  gap: 8,
},

stockBox: {
  flex: 1,
  minWidth: 0,
  paddingVertical: 16,
  paddingHorizontal: 4,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
},

entryStockBox: {
  backgroundColor: '#E5F4E8',
  borderColor: '#C8E6CC',
},

bookedStockBox: {
  backgroundColor: '#E5EFFD',
  borderColor: '#C6D9F5',
},

remainingStockBox: {
  backgroundColor: '#D4EDDA',
  borderColor: '#A8D5B2',
},

stockBoxLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: '#333333',
  textAlign: 'center',
},

stockBoxValue: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#222222',
  marginTop: 8,
},

stockBoxUnit: {
  fontSize: 11,
  color: '#555555',
  marginTop: 4,
},

additionalStockSection: {
  marginTop: 24,
  paddingTop: 18,
  borderTopWidth: 1,
  borderTopColor: '#E5E5E5',
},

additionalStockTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#333333',
},

additionalStockDescription: {
  fontSize: 13,
  color: '#666666',
  marginTop: 6,
  marginBottom: 16,
},

inputLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333333',
  marginBottom: 8,
},

stockInput: {
  height: 50,
  borderWidth: 1,
  borderColor: '#D0D7DE',
  borderRadius: 10,
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 14,
  fontSize: 16,
  color: '#222222',
},

addStockButton: {
  marginTop: 16,
  minHeight: 50,
  borderRadius: 10,
  backgroundColor: '#23833B',
  alignItems: 'center',
  justifyContent: 'center',
},

addStockButtonDisabled: {
  backgroundColor: '#A8B5AA',
},

addStockButtonText: {
  fontSize: 16,
  fontWeight: '700',
  color: '#FFFFFF',
},

savingButtonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
},


});