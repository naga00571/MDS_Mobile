import React, {useEffect, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  'BookMilk'
>;


// --------------------------------------------------
// Temporary logged-in user details
// --------------------------------------------------

const userID = 1002;
const userRole = 'CUSTOMER';


// --------------------------------------------------
// Temporary milk item details
// Later these can come from MDS_ITEMS table/API
// --------------------------------------------------

const ITEM_NAME = 'Regular Milk';
const ITEM_PRICE = 60;


// --------------------------------------------------
// Book Milk Screen
// --------------------------------------------------

function BookMilkScreen({route, navigation}: Props) {

  const {communityId} = route.params;


  const [inventoryData, setInventoryData] = useState<
    CommunityInventory[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [bookingQty, setBookingQty] = useState(1);

  const [fulfillmentType, setFulfillmentType] =
    useState<'PICKUP' | 'DELIVERY'>('PICKUP');


  // --------------------------------------------------
  // Get today's inventory
  // --------------------------------------------------

  useEffect(() => {
    getTodaysCommunityInventory();
  }, []);


  const getTodaysCommunityInventory = async () => {

    try {

      setIsLoading(true);

      const response = await fetch(
        'http://10.0.2.2:8000/api/community-todays-availability/',
      );

      if (!response.ok) {
        throw new Error(
          'Unable to load today\'s milk inventory.',
        );
      }

      const data = await response.json();

      console.log(
        'BOOK MILK - INVENTORY API CALLED',
      );

      console.log(
        'BOOK MILK - API DATA:',
        data,
      );

      setInventoryData(data);

    } catch (error) {

      console.error(
        'Book Milk inventory error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to load today\'s milk availability.',
      );

    } finally {

      setIsLoading(false);

    }
  };


  // --------------------------------------------------
  // Filter today's inventory
  // by logged-in customer's community
  // --------------------------------------------------

  const selectedCommunity = inventoryData.find(
    item =>
      item.COMMUNITY_ID === communityId &&
      item.IS_ACTIVE === true &&
      item.IS_DELETE === false,
  );


  // --------------------------------------------------
  // Values displayed on screen
  // --------------------------------------------------

  const communityName =
    selectedCommunity?.COMMUNITY_NAME ?? '';

  const remainingQty =
    selectedCommunity?.REMAINING_QTY ?? 0;

  const availabilityDate =
    selectedCommunity?.TODAY_DATE
      ? new Date(
          selectedCommunity.TODAY_DATE,
        ).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '';


  // --------------------------------------------------
  // Quantity handling
  // --------------------------------------------------

  const increaseQuantity = () => {

    if (bookingQty < remainingQty) {
      setBookingQty(bookingQty + 1);
    }

  };


  const decreaseQuantity = () => {

    if (bookingQty > 1) {
      setBookingQty(bookingQty - 1);
    }

  };


  // --------------------------------------------------
  // Amount calculation
  // --------------------------------------------------

  const milkAmount =
    bookingQty * ITEM_PRICE;


  // Temporary delivery charge
  // We can replace this with actual logic later.
  // deliveryCharge is Rs.2 per litre (<-- testing)
  const deliveryCharge =
    fulfillmentType === 'DELIVERY'
      ? (bookingQty * 2)
      : 0;

  // Platform fee is currently zero (Rs. 3 is test value)
  const platformFee = 3;

  const totalAmount =
    milkAmount +
    deliveryCharge +
    platformFee;


  // --------------------------------------------------
  // NEXT button will create booking with 5- minute reservation
  // ['Select quantity', 'Pickup / Delivery', 'Calculate total'
  // function call: sp_fn_create_booking_reservation
  // it gives : BOOKING_ID + RESERVATION_ID
  // --------------------------------------------------
  const handleNext = async () => {
    
    if (!selectedCommunity) {
        Alert.alert(
            'Milk Availability',
            'Milk availability is not available for your community today.',
        );
        return;
    }

    if (remainingQty <= 0) {
        Alert.alert(
            'Milk Unavailable',
            'There is no milk available for booking today.',
        );
        return;
    }

    if (bookingQty > remainingQty) {
        Alert.alert(
            'Quantity Unavailable',
            `Only ${remainingQty} Ltrs of milk is available.`,
        );
        return;
    }

    try {

        setIsLoading(true);

        console.log('CREATING BOOKING RESERVATION...');

        const response = await fetch(
            'http://10.0.2.2:8000/api/bookings/reserve',
            {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                customer_id: userID,
                community_id: communityId,
                item_name: ITEM_NAME,
                booking_qty: bookingQty,
                item_price: ITEM_PRICE,
                fulfillment_type: fulfillmentType,
                delivery_charge: deliveryCharge,
                platform_fee: platformFee,
                reservation_minutes: 5,
                }),
            },
        );

        const data = await response.json();

        console.log(
            'BOOKING RESERVATION RESPONSE:',
            data,
        );

        if (!response.ok) {
            throw new Error(
                data.detail ||
                'Unable to create booking reservation.',
            );
        }

        /*
        * The function returns:
        * BOOKING_ID
        * RESERVATION_ID
        * ...
        */

        const bookingResult = data[0];

        const bookingId =
            bookingResult?.BOOKING_ID ??
            bookingResult?.booking_id;

        const reservationId =
            bookingResult?.RESERVATION_ID ??
            bookingResult?.reservation_id;

        // const bookingId =
        //     data.BOOKING_ID ?? data.booking_id;

        // const reservationId =
        //     data.RESERVATION_ID ?? data.reservation_id;

        console.log('BOOKING ID:', bookingId);
        console.log('RESERVATION ID:', reservationId);

        navigation.navigate('Payment', {
            userId: userID,
            communityId: selectedCommunity.COMMUNITY_ID,
            bookingId: Number(bookingId),
            reservationId: Number(reservationId),
            itemName: ITEM_NAME,
            bookingQty: bookingQty,
            itemPrice: ITEM_PRICE,
            fulfillmentType: fulfillmentType,
            deliveryCharge: deliveryCharge,
            platformFee: platformFee,
            totalAmount: totalAmount,
        });


        Alert.alert(
            'Reservation Created',
            'Your milk has been reserved for 5 minutes.',
        );

    } catch (error) {
        console.error(
            'Create booking reservation error:',
            error,
        );

        Alert.alert(
            'Booking Error',
            error instanceof Error
                ? error.message
                : 'Unable to create booking reservation.',
        );

    } finally {
        setIsLoading(false);
    }

    // Payment screen will be connected next.
    //Alert.alert(
    //  'Next Step',
    //  'Reservation will be created here.',
    //);

  };
  // --------------------------------------------------
  // NEXT button will create booking with 5- minute reservation
  // ---------------- End ----------------------------------


  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (isLoading) {

    return (
      <SafeAreaView style={styles.container}>

        <View style={styles.loadingScreen}>

          <ActivityIndicator
            size="large"
            color="#1769C2"
          />

          <Text style={styles.loadingText}>
            Loading milk availability...
          </Text>

        </View>

      </SafeAreaView>
    );

  }


  // --------------------------------------------------
  // Render
  // --------------------------------------------------

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
          BOOK MILK
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


        {/* Step Indicator */}

        <View style={styles.stepsContainer}>

          <View style={styles.stepActive}>
            <Text style={styles.stepNumberActive}>
              1
            </Text>

            <Text style={styles.stepTextActive}>
              SELECT MILK
            </Text>
          </View>


          <View style={styles.stepArrow}>
            <Text>
              →
            </Text>
          </View>


          <View style={styles.stepInactive}>
            <Text style={styles.stepNumberInactive}>
              2
            </Text>

            <Text style={styles.stepTextInactive}>
              PAYMENT
            </Text>
          </View>


          <View style={styles.stepArrow}>
            <Text>
              →
            </Text>
          </View>


          <View style={styles.stepInactive}>
            <Text style={styles.stepNumberInactive}>
              3
            </Text>

            <Text style={styles.stepTextInactive}>
              ORDER
            </Text>
          </View>

        </View>


        {/* Main Card */}

        <View style={styles.card}>

          {/* Date */}

          <Text style={styles.dateText}>
            Today –{' '}
            <Text style={styles.dateValue}>
              {availabilityDate}
            </Text>
          </Text>


          {/* Community */}

          <Text style={styles.communityNameText}>
            {communityName}
          </Text>


          <View style={styles.divider} />


          {/* Milk */}

          <Text style={styles.itemName}>
            🥛 {ITEM_NAME}
          </Text>


          <Text style={styles.availableLabel}>
            Available Milk
          </Text>


          <Text style={styles.availableQuantity}>
            {remainingQty} Ltrs
          </Text>


          <Text style={styles.availableText}>
            Available
          </Text>


          {/* Quantity */}

          <View style={styles.quantityRow}>

  <Text style={styles.quantityLabel}>
    Select Quantity
  </Text>

  <View style={styles.quantitySelector}>

    <TouchableOpacity
      style={styles.smallQuantityButton}
      onPress={decreaseQuantity}
      disabled={bookingQty <= 1}
    >
      <Text style={styles.smallQuantityButtonText}>
        −
      </Text>
    </TouchableOpacity>

    <Text style={styles.smallQuantityValue}>
      {bookingQty} Ltr
    </Text>

    <TouchableOpacity
      style={styles.smallQuantityButton}
      onPress={increaseQuantity}
      disabled={bookingQty >= remainingQty}
    >
      <Text style={styles.smallQuantityButtonText}>
        +
      </Text>
    </TouchableOpacity>

  </View>

</View>


          {/* Fulfillment */}

          <Text style={styles.sectionLabel}>
            Fulfillment
          </Text>


          <View style={styles.fulfillmentContainer}>

            {/* Pickup */}

            <TouchableOpacity
              style={[
                styles.fulfillmentOption,
                fulfillmentType === 'PICKUP' &&
                  styles.fulfillmentOptionSelected,
              ]}
              onPress={() =>
                setFulfillmentType('PICKUP')
              }
            >

              <View
                style={[
                  styles.radioCircle,
                  fulfillmentType === 'PICKUP' &&
                    styles.radioCircleSelected,
                ]}
              />

              <Text style={styles.fulfillmentText}>
                Pickup
              </Text>

            </TouchableOpacity>


            {/* Delivery */}

            <TouchableOpacity
              style={[
                styles.fulfillmentOption,
                fulfillmentType === 'DELIVERY' &&
                  styles.fulfillmentOptionSelected,
              ]}
              onPress={() =>
                setFulfillmentType('DELIVERY')
              }
            >

              <View
                style={[
                  styles.radioCircle,
                  fulfillmentType === 'DELIVERY' &&
                    styles.radioCircleSelected,
                ]}
              />

              <Text style={styles.fulfillmentText}>
                Delivery
              </Text>

            </TouchableOpacity>

          </View>


          {/* Amount Summary */}

          <View style={styles.divider} />


          <View style={styles.amountRow}>

            <Text style={styles.amountLabel}>
              Milk Amount
            </Text>

            <Text style={styles.amountValue}>
              ₹{milkAmount.toFixed(2)}
            </Text>

          </View>


          <View style={styles.amountRow}>

            <Text style={styles.amountLabel}>
              Delivery Charge
            </Text>

            <Text style={styles.amountValue}>
              ₹{deliveryCharge.toFixed(2)}
            </Text>

          </View>


          <View style={styles.amountRow}>

            <Text style={styles.amountLabel}>
              Platform Fee
            </Text>

            <Text style={styles.amountValue}>
              ₹{platformFee.toFixed(2)}
            </Text>

          </View>


          <View style={styles.totalDivider} />


          <View style={styles.amountRow}>

            <Text style={styles.totalLabel}>
              TOTAL
            </Text>

            <Text style={styles.totalValue}>
              ₹{totalAmount.toFixed(2)}
            </Text>

          </View>


          {/* NEXT */}

          <TouchableOpacity
            style={[
              styles.nextButton,
              remainingQty <= 0 &&
                styles.nextButtonDisabled,
            ]}
            disabled={remainingQty <= 0}
            onPress={handleNext}
          >

            <Text style={styles.nextButtonText}>
              NEXT →
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    </SafeAreaView>
  );
}


export default BookMilkScreen;


// ==================================================
// Styles
// ==================================================

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


  background: {
    flex: 1,
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


  stepsContainer: {
    marginTop: 15,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  stepActive: {
    alignItems: 'center',
    flex: 1,
  },


  stepInactive: {
    alignItems: 'center',
    flex: 1,
  },


  stepNumberActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    paddingTop: 4,
    backgroundColor: '#1769C2',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },


  stepNumberInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    paddingTop: 4,
    backgroundColor: '#DDDDDD',
    color: '#666666',
    fontWeight: 'bold',
  },


  stepTextActive: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1769C2',
  },


  stepTextInactive: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: '#777777',
  },


  stepArrow: {
    paddingHorizontal: 3,
  },


  card: {
    marginTop: 15,
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
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
    color: '#333333',
  },


  dateValue: {
    fontWeight: 'bold',
  },


  communityNameText: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
    color: '#1769C2',
  },


  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 15,
  },


  itemName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1769C2',
    marginBottom: 12,
  },


  availableLabel: {
    fontSize: 15,
    color: '#555555',
  },


  availableQuantity: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1769C2',
    marginTop: 3,
  },


  availableText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#279A35',
    marginTop: 2,
  },


  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginTop: 18,
    marginBottom: 8,
  },


  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },


  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1769C2',
    justifyContent: 'center',
    alignItems: 'center',
  },


  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },


  quantityValueContainer: {
    width: 90,
    alignItems: 'center',
  },


  quantityValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333333',
  },


  quantityUnit: {
    fontSize: 13,
    color: '#666666',
  },


  fulfillmentContainer: {
    flexDirection: 'row',
    gap: 10,
  },


  fulfillmentOption: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },


  fulfillmentOptionSelected: {
    borderColor: '#1769C2',
    backgroundColor: '#EAF3FF',
  },


  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#AAAAAA',
    marginRight: 8,
  },


  radioCircleSelected: {
    borderColor: '#1769C2',
    backgroundColor: '#1769C2',
  },


  fulfillmentText: {
    fontSize: 15,
    fontWeight: '600',
  },


  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },


  amountLabel: {
    fontSize: 15,
    color: '#555555',
  },


  amountValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },


  totalDivider: {
    height: 1,
    backgroundColor: '#BBBBBB',
    marginVertical: 8,
  },


  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333333',
  },


  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1769C2',
  },


  nextButton: {
    height: 52,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#1769C2',
    justifyContent: 'center',
    alignItems: 'center',
  },


  nextButtonDisabled: {
    opacity: 0.5,
  },


  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },


  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },


  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333333',
  },

  quantityRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 18,
},

quantityLabel: {
  fontSize: 16,
  fontWeight: '700',
  color: '#333333',
},

quantitySelector: {
  flexDirection: 'row',
  alignItems: 'center',
},

smallQuantityButton: {
  width: 30,
  height: 30,
  borderRadius: 7,
  backgroundColor: '#1769C2',
  justifyContent: 'center',
  alignItems: 'center',
},

smallQuantityButtonText: {
  color: '#FFFFFF',
  fontSize: 20,
  fontWeight: '600',
  lineHeight: 22,
},

smallQuantityValue: {
  minWidth: 65,
  textAlign: 'center',
  fontSize: 15,
  fontWeight: '700',
  color: '#333333',
},

});