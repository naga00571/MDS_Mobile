import {Picker} from '@react-native-picker/picker';
import React, {useEffect, useState} from 'react';

import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../../App';

import {
  getUserId,
  getUserRole,
  getUserCommunityId,
} from '../auth/authStorage';

import {API_BASE_URL} from '../api/apiConfig';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'BookItems0'
>;


const BookItemsScreen0 = ({navigation}: Props) => {

  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState('');
  const [communityId, setCommunityId] = useState<number | null>(null);

  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<any | null>(null); 
  
  const [communityList, setCommunityList] = useState<any[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);

  const [isBooking, setIsBooking] = useState(false);

  const [customerCommunity, setCustomerCommunity] = useState<any | null>(null);

  // --------------------------------------------------
  // Load logged-in user session
  // --------------------------------------------------
  useEffect(() => {

    const loadSession = async () => {

      const loggedInUserId = await getUserId();
      const loggedInUserRole = await getUserRole();
      const loggedInCommunityId = await getUserCommunityId();

      setUserId(loggedInUserId);
      setUserRole(loggedInUserRole ?? '');
      setCommunityId(loggedInCommunityId);

      // Temporary session information alert
      //Alert.alert(
      //  'User Session',
      //  `User ID: ${loggedInUserId ?? 'Not available'}\n\n` +
      //  `Role: ${loggedInUserRole ?? 'Not available'}\n\n` +
      //  `Community ID: ${
      //    loggedInCommunityId ?? 'Not available'
      //  }`,
      //);

      // --------------------------------------------------
    // Load today's inventory AFTER session is loaded
    // --------------------------------------------------
    await getTodaysCommunityInventory(
      loggedInUserId,  
      loggedInUserRole ?? '',
      loggedInCommunityId,
    );



    };

    loadSession();

  }, []);
  // end of useEffect function

  //   useEffect(() => {
  //       getTodaysCommunityInventory();
  //   }, []);

useEffect(() => {

    if (
        (userRole === 'POC_ADMIN' || userRole === 'SUPER_ADMIN') &&
            selectedCommunityId !== null
    ) {
        const selectedCommunityInventory = inventoryData.find(
            (item: any) =>
                item.COMMUNITY_ID === selectedCommunityId &&
                item.TODAY_DATE === item.AVAILABILITY_DATE,
        );

        setSelectedInventory(
            selectedCommunityInventory ?? null,
        );

        console.log(
            'SELECTED COMMUNITY ID:',
            selectedCommunityId,
        );

        console.log(
            'SELECTED COMMUNITY INVENTORY:',
            selectedCommunityInventory,
        );
    }

}, [
    selectedCommunityId,
    inventoryData,
    userRole,
]);



  let filteredInventoryData: any[] = [];

  const getTodaysCommunityInventory = async (
    loggedInUserId: number | null,
    loggedInUserRole: string,
    loggedInCommunityId: number | null,
  ) => {
    try {

        setIsLoading(true);

        const response = await fetch(
            `${API_BASE_URL}/api/community-todays-availability/`,
        );

        if (!response.ok) {
            throw new Error('Unable to load today\'s milk inventory.');
        }

        const data = await response.json();

        console.log('MILK INVENTORY API CALLED');
        console.log('API DATA:', data);
        console.log('Today\'s Community Milk Inventory:', data);

        //setInventoryData(data);

        if (loggedInUserRole === 'CUSTOMER') {
            
            filteredInventoryData = data.filter(
                (item: any) =>
                item.COMMUNITY_ID === loggedInCommunityId &&
                item.TODAY_DATE === item.AVAILABILITY_DATE,
            );

            // this is useful to show community name if inventory is null for today
            const customerCommunityData = data.find(
                (item: any) =>
                item.COMMUNITY_ID === loggedInCommunityId,
            );
            setCustomerCommunity(customerCommunityData ?? null);
            // this is useful to show community name if inventory is null for today

            console.log('CUSTOMER COMMUNITY ID:', loggedInCommunityId);
            console.log('CUSTOMER INVENTORY:', filteredInventoryData);

            if (filteredInventoryData.length > 0) {
                setSelectedInventory(filteredInventoryData[0]);
            } else {
                setSelectedInventory(null);
            }


        } 
        // --------------------------------------------------
        // POC_ADMIN
        // Use POC_USER_ID to get assigned communities
        // --------------------------------------------------
        else if (loggedInUserRole === 'POC_ADMIN') {

            filteredInventoryData = data.filter(
                (item: any) =>
                    item.POC_USER_ID === loggedInUserId, 
                    // && item.TODAY_DATE === item.AVAILABILITY_DATE,
            );

        }
        // --------------------------------------------------
        // SUPER_ADMIN
        // No POC_USER_ID or community filter
        // --------------------------------------------------
        else if (loggedInUserRole === 'SUPER_ADMIN') {

            // filteredInventoryData = data.filter(
            //     (item: any) =>
            //     item.TODAY_DATE === item.AVAILABILITY_DATE,
            // );

            filteredInventoryData = data;

            console.log(
                'SUPER ADMIN INVENTORY:',
                filteredInventoryData,
            );
        }
        // end of loggedInuser filers

        setInventoryData(filteredInventoryData);

        // --------------------------------------------------
        // Build community list for admin users
        // --------------------------------------------------
        if (
            loggedInUserRole === 'POC_ADMIN' ||
            loggedInUserRole === 'SUPER_ADMIN'
        ) {
            const uniqueCommunities = filteredInventoryData.filter(
                (item: any, index: number, array: any[]) =>
                    array.findIndex(
                        community =>
                        community.COMMUNITY_ID === item.COMMUNITY_ID,
                ) === index,
            );

            setCommunityList(uniqueCommunities);

            if (uniqueCommunities.length > 0) {
                setSelectedCommunityId(
                    uniqueCommunities[0].COMMUNITY_ID,
                );
            }

            console.log('COMMUNITY LIST:', uniqueCommunities);
            console.log('SELECTED COMMUNITY:', uniqueCommunities[0]?.COMMUNITY_ID);

        }

        

    } catch (error) {
        console.error('Get today\'s community inventory error:', error);
    } finally {
        setIsLoading(false);
    }

  };
  // end of [getTodaysCommunityInventory]


  const handleBookMilk = () => {

    if (isBooking) {
        return;
    }

    let bookingCommunityId: number | null = null;

    if (userRole === 'CUSTOMER') {
        bookingCommunityId = selectedInventory?.COMMUNITY_ID ?? null;
    } else if (
        userRole === 'POC_ADMIN' ||
        userRole === 'SUPER_ADMIN'
    ) {
        bookingCommunityId = selectedCommunityId;
    }

    if (!bookingCommunityId) {
        return;
    }

    setIsBooking(true);

    navigation.navigate('BookMilk', {
        communityId: bookingCommunityId,
    });

  };
  // end of handleBookMilk function



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
          BOOK ITEMS
        </Text>

      </View>


      {/* Background */}

      <View style={styles.background}>

        <Image
          source={require('../assets/images/milkavailability.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />


        {/* Session Information Card : just for info only */}

        {/*
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>User Session</Text>
          <View style={styles.divider} />
          <Text style={styles.infoLabel}> User ID </Text>
          <Text style={styles.infoValue}> {userId ?? 'Not available'} </Text>
          <View style={styles.spacing} />
          <Text style={styles.infoLabel}> User Role </Text>
          <Text style={styles.infoValue}> {userRole || 'Not available'} </Text>
          <View style={styles.spacing} />
          <Text style={styles.infoLabel}> Community ID </Text>
          <Text style={styles.infoValue}> {communityId ?? 'Not available'} </Text>
        </View>
        */}

        {/* Session Information Card : just for info only */}

        {/* Community Selection */}

        {(userRole === 'POC_ADMIN' || userRole === 'SUPER_ADMIN') && (
            <View style={styles.communityPickerContainer}>

                <Text style={styles.communityPickerLabel}>
                    Select Community
                </Text>

                <View style={styles.communityPicker}>

                <Picker
                    selectedValue={selectedCommunityId}
                    onValueChange={value =>
                    setSelectedCommunityId(value)
                    }
                >
                    <Picker.Item
                        label="Select Community"
                        value={null}
                    />

                    {communityList.map((item: any) => (
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

        {/* Items Card */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Available Items
          </Text>

          <View style={styles.divider} />

          {selectedInventory ? (
            <>
                <Text style={styles.infoLabel}>Community </Text>
                <Text style={styles.infoValue}>
                    {selectedInventory.COMMUNITY_NAME}
                </Text>

                <View style={styles.spacing} />

                <Text style={styles.infoLabel}>Date </Text>
                <Text style={styles.infoValue}>
                    {selectedInventory.TODAY_DATE}
                </Text>

                <View style={styles.spacing} />

                <Text style={styles.availableLabel}> Available Milk </Text>
                <Text style={styles.quantityText}>
                    {selectedInventory.REMAINING_QTY ?? 0}
                </Text>

                <Text style={styles.availableText}>
                    {selectedInventory.IS_AVAILABLE ? 'Available' : 'Not Available'}
                </Text>
            </>
            ) : customerCommunity ? (
            <>
                <Text style={styles.infoLabel}>Community </Text>
                <Text style={styles.infoValue}>
                    {customerCommunity.COMMUNITY_NAME}
                </Text>

                <View style={styles.spacing} />

                <Text style={styles.infoLabel}>Date </Text>
                <Text style={styles.infoValue}>
                    {customerCommunity.TODAY_DATE}
                </Text>

                <View style={styles.spacing} />
                <View style={styles.spacing} />

                <Text style={styles.availableLabel}>
                    No milk availability found for today.
                </Text>
            </>
            ) : (
                    <Text style={styles.availableLabel}>
                        No milk availability found for today.
                    </Text>
                )
            }

            {selectedInventory &&
                selectedInventory.IS_AVAILABLE &&
                Number(selectedInventory.REMAINING_QTY) > 0 && (
                    <TouchableOpacity
                        style={[
                            styles.bookButton,
                            isBooking && styles.bookButtonDisabled,
                        ]}
                        onPress={handleBookMilk}
                    >
                        <Text style={styles.bookButtonText}>
                            {isBooking ? 'PLEASE WAIT...' : 'BOOK MILK'}
                        </Text>
                    </TouchableOpacity>
            )}

        </View>

      </View>

    </SafeAreaView>
  );
};


export default BookItemsScreen0;


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


  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },


  // --------------------------------------------------
  // Header
  // --------------------------------------------------

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


  // --------------------------------------------------
  // Card
  // --------------------------------------------------

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


  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1769C2',
  },


  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },


  // --------------------------------------------------
  // Session information
  // --------------------------------------------------

  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },


  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },


  spacing: {
    height: 10,
  },


  // --------------------------------------------------
  // Available items
  // --------------------------------------------------

  availableLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1769C2',
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

  bookButtonDisabled: {
    opacity: 0.5,
  },

});