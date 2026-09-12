import React, {useState} from 'react';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Payment'
>;

const PaymentScreen = ({navigation, route}: Props) => {

    const [isAmountExpanded, setIsAmountExpanded] = useState(false);

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

    const handlePay = () => {

        console.log('PAY BUTTON CLICKED');

        console.log('USER ID:', userId);
        console.log('COMMUNITY ID:', communityId);
        console.log('BOOKING ID:', bookingId);
        console.log('RESERVATION ID:', reservationId);
        console.log('TOTAL AMOUNT:', totalAmount);

    };

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
          PAYMENT
        </Text>

      </View>

      {/* Step Indicator */}
      <View style={styles.stepsContainer}>
        
        <View style={styles.stepInactive}>
            <Text style={styles.stepNumberInactive}>
            1
            </Text>

            <Text style={styles.stepTextInactive}>
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


    <View style={styles.content}>

        {/* Reservation information */}
        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Booking Summary
          </Text>

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

        </View>

        {/* Amount */}
        <View style={styles.card}>

          {/* Amount Details Header */}
            <TouchableOpacity
                style={styles.amountHeader}
                onPress={() =>
                setIsAmountExpanded(!isAmountExpanded)
                }
            >

                <Text style={styles.sectionTitle}>
                    Amount Details
                </Text>

                <Text style={styles.expandIcon}>
                    {isAmountExpanded ? '▲' : '▼'}
                </Text>
            </TouchableOpacity>

            {/* Expanded Details */}
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
    
            {/* Total Amount - Always Visible */}
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

        {/* Payment method */}
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

        {/* Pay button */}
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePay}
        >
          <Text style={styles.payButtonText}>
            PAY ₹{totalAmount.toFixed(2)}
          </Text>
        </TouchableOpacity>

    </View>

    </SafeAreaView>
  );
};

export default PaymentScreen;


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