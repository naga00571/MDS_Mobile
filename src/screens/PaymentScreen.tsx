import React, {useEffect, useState} from 'react';
import PhonePePaymentSDK from 'react-native-phonepe-pg';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';

import {API_BASE_URL} from '../api/apiConfig';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Payment'
>;

const PHONEPE_MERCHANT_ID = 'M23QSP1UUBAH';

const PaymentScreen = ({navigation, route}: Props) => {

  const [isAmountExpanded, setIsAmountExpanded] = useState(false);
  const [isBookingInfoExpanded, setIsBookingInfoExpanded] = useState(true);

  const [isPaying, setIsPaying] = useState(false);

  const [phonePeInitialized, setPhonePeInitialized] = useState(false);

  const {
    userId,
    communityId,
    bookingId,
    reservationId,
    itemName,
    bookingQty,
    itemPrice,
    fulfillmentType,
    deliveryCharge,
    platformFee,
    totalAmount,
  } = route.params;


  // =========================================================
  // PhonePe SDK Initialization : start
  // =========================================================
  const initializePhonePe = async () => {

    try {

      console.log('INITIALIZING PHONEPE SDK...');

      const result = await PhonePePaymentSDK.init(
        'SANDBOX',
        PHONEPE_MERCHANT_ID,
        `MDS_${bookingId}_${reservationId}`,
        true,
      );

      console.log('PHONEPE SDK INIT RESULT:', result,);

      if (result === true) {
        setPhonePeInitialized(true);
        console.log('PHONEPE SDK INITIALIZED SUCCESSFULLY');
      } else {
        setPhonePeInitialized(false);
        console.log('PHONEPE SDK INITIALIZATION FAILED');
      }


      /* Alert.alert(
        'PhonePe SDK',
        `Initialization result: ${JSON.stringify(result)}`,
      ); */

    } catch (error) {
      setPhonePeInitialized(false);

      console.error(
        'PHONEPE SDK INITIALIZATION ERROR:',
        error,
      );

      Alert.alert(
        'PhonePe SDK Error',
        error instanceof Error
          ? error.message
          : 'Unable to initialize PhonePe SDK.',
      );
    }
  };
  // =========================================================
  // PhonePe SDK Initialization : end
  // =========================================================

  // =========================================================
  // Automatically initialize PhonePe when Payment screen loads
  // =========================================================

  useEffect(() => {

    initializePhonePe();

  }, []);

  // =========================================================
  // PhonePe SDK : check installed UPI apps : start
  // =========================================================
  const checkInstalledUPIApps = async () => {

    if (!phonePeInitialized) {
      Alert.alert(
        'PhonePe SDK',
        'PhonePe SDK is not initialized yet.',
      );
      return;
    }

    try {
      console.log('CHECKING INSTALLED UPI APPS...');

      const result =
        await PhonePePaymentSDK.getUpiAppsForAndroid();

      console.log('INSTALLED UPI APPS:', result);

      Alert.alert(
        'Installed UPI Apps',
        JSON.stringify(result, null, 2),
      );
    } catch (error) {
        console.error('UPI APPS ERROR:', error);

        Alert.alert(
          'UPI Apps Error',
          error instanceof Error
            ? error.message
            : 'Unable to get installed UPI apps.',
        );
    }
  }
  // =========================================================
  // PhonePe SDK : check installed UPI apps : end
  // =========================================================

  // =========================================================
  // PAY BUTTON
  // =========================================================

  const handlePay = async () => {

    // Prevent duplicate payment attempts
    if (isPaying) {
      return;
    }
    setIsPaying(true);


    console.log('====================================');
    console.log('PAY BUTTON CLICKED');
    console.log('====================================');

    console.log('USER ID:', userId);
    console.log('COMMUNITY ID:', communityId);
    console.log('BOOKING ID:', bookingId);
    console.log('RESERVATION ID:', reservationId);
    console.log('TOTAL AMOUNT:', totalAmount);

    if (!phonePeInitialized) {

      Alert.alert(
        'Payment',
        'Payment service is still initializing. Please try again.',
      );

      return;
    }


    try {

      // -------------------------------------------------------
      // Step 1: Create PhonePe Order through MDS Backend
      // -------------------------------------------------------

      console.log(
        'CREATING PHONEPE PAYMENT ORDER...',
      );

      const response = await fetch(
        `${API_BASE_URL}/api/payments/phonepe/create`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            booking_id: bookingId,
            reservation_id: reservationId,
            amount: totalAmount,
          }),
        },
      );


      const data = await response.json();


      console.log(
        'PHONEPE CREATE ORDER RESPONSE:',
        data,
      );


      // -------------------------------------------------------
      // Step 2: Check Backend Response
      // -------------------------------------------------------

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Unable to create PhonePe payment order.',
        );
      }


      // -------------------------------------------------------
      // Step 3: Validate PhonePe Response
      // -------------------------------------------------------

      if (!data.order_id) {

        throw new Error(
          'PhonePe order ID was not returned.',
        );
      }

      if (!data.token) {

        throw new Error(
          'PhonePe payment token was not returned.',
        );
      }


      console.log(
        'PHONEPE ORDER ID:',
        data.order_id,
      );

      console.log(
        'PHONEPE STATE:',
        data.state,
      );

      console.log(
        'PHONEPE TOKEN RECEIVED:',
        !!data.token,
      );

      console.log(
        'PHONEPE EXPIRE AT:',
        data.expire_at,
      );


      // -------------------------------------------------------
      // Step 4: Build PhonePe SDK Request
      // -------------------------------------------------------

      const payload = {
        orderId: data.order_id,
        merchantId: PHONEPE_MERCHANT_ID,
        token: data.token,
        paymentMode: {
          type: 'PAY_PAGE',
        },
      };


      const requestBody = JSON.stringify(
        payload,
      );


      console.log(
        'PHONEPE REQUEST BODY CREATED',
      );


      // -------------------------------------------------------
      // Step 5: Start PhonePe Payment SDK
      // -------------------------------------------------------

      const result =
        await PhonePePaymentSDK.startTransaction(
          requestBody,
          null,
        );


      console.log(
        'PHONEPE TRANSACTION RESULT:',
        result,
      );


      // -------------------------------------------------------
      // Step 6: PhonePe SDK returned
      // IMPORTANT:
      // SDK result is NOT our final payment status.
      // We now ask our backend for the authoritative status.
      // -------------------------------------------------------
      console.log(
        'CHECKING PAYMENT STATUS FROM MDS BACKEND...',
      );

      const statusResponse = await fetch(
        `${API_BASE_URL}/api/payments/phonepe/status/${data.merchant_order_id}`,
        {
          method: 'GET',

          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const statusData = await statusResponse.json();

      console.log(
        'MDS PAYMENT STATUS RESPONSE:',
        statusData,
      );

      // -------------------------------------------------------
      // Step 7: Backend status API error
      // -------------------------------------------------------

      if (!statusResponse.ok) {

        throw new Error(
          statusData.detail ||
          'Unable to verify payment status.',
        );
      }

      // -------------------------------------------------------
      // Step 8: SUCCESS
      // -------------------------------------------------------

      if (
        statusData.payment_status === 'SUCCESS'
      ) {

        Alert.alert(
          'Payment Successful',
          `Your payment of ₹${totalAmount.toFixed(2)} was successful.`,
          [
            {
              text: 'OK',

              onPress: () => {

                navigation.replace('Bookings');

              },
            },
          ],
          {
            cancelable: false,
          },
        );

        return;
      }

      // -------------------------------------------------------
      // Step 9: FAILED
      // -------------------------------------------------------

      if (
        statusData.payment_status === 'FAILED'
      ) {

        Alert.alert(
          'Payment Failed',
          'Your payment was not successful. The booking has been cancelled.',
          [
            {
              text: 'OK',

              onPress: () => {

                navigation.replace('Bookings');

              },
            },
          ],
          {
            cancelable: false,
          },
        );

        return;
      }


      // -------------------------------------------------------
      // Step 10: CANCELLED
      // -------------------------------------------------------

      if (
        statusData.payment_status === 'CANCELLED'
      ) {

        Alert.alert(
          'Payment Cancelled',
          'Your payment was cancelled. The booking has been cancelled.',
          [
            {
              text: 'OK',

              onPress: () => {

                navigation.replace('Bookings');

              },
            },
          ],
          {
            cancelable: false,
          },
        );

        return;
      }


      // -------------------------------------------------------
      // Step 11: EXPIRED
      // -------------------------------------------------------

      if (
        statusData.payment_status === 'EXPIRED'
      ) {

        Alert.alert(
          'Payment Expired',
          'The payment window has expired. The booking has been cancelled.',
          [
            {
              text: 'OK',

              onPress: () => {

                navigation.replace('Bookings');

              },
            },
          ],
          {
            cancelable: false,
          },
        );

        return;
      }

      // -------------------------------------------------------
      // Step 12: Still PENDING
      // -------------------------------------------------------

      Alert.alert(
        'Payment Pending',
        'We could not confirm your payment yet. Please check your booking status shortly.',
        [
          {
            text: 'OK',
          },
        ],
      );

    } catch (error) {

      console.error(
        'PHONEPE PAYMENT ERROR:',
        error,
      );

      setIsPaying(false);

      Alert.alert(
        'Payment Error',
        error instanceof Error
          ? error.message
          : 'Unable to process PhonePe payment.',
      );

    } // end catch
  };


  // =========================================================
  // UI
  // =========================================================

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
          PAYMENT
        </Text>

      </View>


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


        <View style={styles.stepActive}>

          <Text style={styles.stepNumberActive}>
            2
          </Text>

          <Text style={styles.stepTextActive}>
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


      {/* <View style={styles.content}> */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >


        {/* Booking Information : start */}
        <View style={styles.card}>

          <TouchableOpacity
            style={styles.amountHeader}
            onPress={() =>
              setIsBookingInfoExpanded(!isBookingInfoExpanded)
            }
          >
            <Text style={styles.sectionTitle}>
              Booking Information
            </Text>

            <Text style={styles.expandIcon}>
              {isBookingInfoExpanded ? '▲' : '▼'}
            </Text>

          </TouchableOpacity>

          {/* Expanded Booking Information */}
          {isBookingInfoExpanded && (
          <>
            <View style={styles.divider} />


            <View style={styles.row}>

              <Text style={styles.label}>
                Booking ID
              </Text>

              <Text style={styles.value}>
                {bookingId}
              </Text>

            </View>


            <View style={styles.row}>

              <Text style={styles.label}>
                Reservation ID
              </Text>

              <Text style={styles.value}>
                {reservationId}
              </Text>

            </View>


            <View style={styles.row}>

              <Text style={styles.label}>
                Item
              </Text>

              <Text style={styles.value}>
                {itemName}
              </Text>

            </View>


            <View style={styles.row}>

              <Text style={styles.label}>
                Quantity
              </Text>

              <Text style={styles.value}>
                {bookingQty} Ltr
              </Text>

            </View>


            <View style={styles.row}>

              <Text style={styles.label}>
                Item Price
              </Text>

              <Text style={styles.value}>
                ₹{itemPrice.toFixed(2)}
              </Text>

            </View>


            <View style={styles.row}>

              <Text style={styles.label}>
                Fulfillment
              </Text>

              <Text style={styles.value}>
                {fulfillmentType}
              </Text>
    
            </View>

          </>
          )}

        </View>
        {/* Booking Information : end */}


        {/* Amount Details */}

        <View style={styles.card}>

          <TouchableOpacity
            style={styles.amountHeader}
            onPress={() =>
              setIsAmountExpanded(
                !isAmountExpanded,
              )
            }
          >

            <Text style={styles.sectionTitle}>
              Amount Details
            </Text>

            <Text style={styles.expandIcon}>
              {isAmountExpanded ? '▲' : '▼'}
            </Text>

          </TouchableOpacity>


          {isAmountExpanded && (

            <>

              <View style={styles.divider} />


              <View style={styles.row}>

                <Text style={styles.label}>
                  Milk Amount
                </Text>

                <Text style={styles.value}>
                  ₹{(bookingQty * itemPrice).toFixed(2)}
                </Text>

              </View>


              <View style={styles.row}>

                <Text style={styles.label}>
                  Delivery Charge
                </Text>

                <Text style={styles.value}>
                  ₹{deliveryCharge.toFixed(2)}
                </Text>

              </View>


              <View style={styles.row}>

                <Text style={styles.label}>
                  Platform Fee
                </Text>

                <Text style={styles.value}>
                  ₹{platformFee.toFixed(2)}
                </Text>

              </View>

            </>

          )}


          {/* Total Amount */}

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>

            <Text style={styles.totalLabel}>
              TOTAL AMOUNT
            </Text>

            <Text style={styles.totalAmount}>
              ₹{totalAmount.toFixed(2)}
            </Text>

          </View>

        </View>


        {/* Payment Method */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Payment Method
          </Text>

          <View style={styles.upiBox}>

            <Text style={styles.upiTitle}>
              UPI
            </Text>

            <Text style={styles.upiText}>
              UPI payment will be available here.
            </Text>

          </View>

        </View>


        {/* Pay Button */}

        <TouchableOpacity
          style={[
            styles.payButton,
            isPaying && styles.payButtonDisabled,
          ]}
          onPress={handlePay}
          disabled={isPaying}
        >

          <Text style={styles.payButtonText}>
            {isPaying
              ? 'PROCESSING...'
              : `PAY ₹${totalAmount.toFixed(2)}`}
          </Text>

        </TouchableOpacity>

        {/* Temporary SDK CHeck UPI Apps Button */}  
        <TouchableOpacity
          style={styles.payButton}
          onPress={checkInstalledUPIApps}
        >
          <Text style={styles.payButtonText}>
            CHECK UPI APPS
          </Text>
        </TouchableOpacity>
        {/* Temporary SDK CHeck UPI Apps Button */}   

        {/* Temporary SDK Test Button */}
        <TouchableOpacity
          style={styles.payButton}
          onPress={initializePhonePe}
        >

          <Text style={styles.payButtonText}>
            TEST PHONEPE SDK
          </Text>
        </TouchableOpacity>




      </ScrollView>

    </SafeAreaView>
  );
};


export default PaymentScreen;



// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#97d9fd',
  },

  contentContainer: {
    paddingBottom: 30,
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

  content: {
    flex: 1,
    padding: 16,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 7,
  },

  label: {
    fontSize: 15,
    color: '#555555',
  },

  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },

  totalDivider: {
    height: 1,
    backgroundColor: '#CCCCCC',
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#333333',
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1769C2',
  },

  upiBox: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    padding: 15,
  },

  upiTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1769C2',
  },

  upiText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666666',
  },

  payButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1769C2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  payButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  payButtonDisabled: {
    opacity: 0.6,
  },

  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  expandIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1769C2',
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

});