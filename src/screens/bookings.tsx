import React, {useEffect, useState} from 'react';

import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';

import {getUserId} from '../auth/authStorage';
import {API_BASE_URL} from '../api/apiConfig';


type Props = NativeStackScreenProps<
  RootStackParamList,
  'Bookings'
>;

// =========================================================
// BOOKING TYPE
// =========================================================

type Booking = {
  customer_id: number;
  community_id: number;
  community_name: string;

  booking_id: number;
  reservation_id: number;

  current_date_fld: string;
  business_trans_date: string;

  booking_age: number;
  booking_age_category: 'RECENT' | 'PAST';

  item_name: string;
  booking_qty: number;

  item_price: number;

  fulfillment_type: string;

  delivery_charge: number;
  platform_fee: number;

  total_amount: number;

  booking_status: string;
  reservation_status: string;

  payment_id: number;
  payment_provider: string;
  merchant_order_id: string;
  provider_order_id: string;

  payment_amount: number;
  payment_status: string;
  payment_method: string;

  payment_row_number: number;
};


// =========================================================
// API RESPONSE
// =========================================================

type BookingsApiResponse = {
  customer_id: number | null;
  count: number;
  bookings: Booking[];
};


// =========================================================
// COMPONENT
// =========================================================

const BookingsInfo = ({navigation}: Props) => {

  const [activeTab, setActiveTab] = useState<
    'CURRENT' | 'PAST'
  >('CURRENT');

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  // -------------------------------------------------------
  // Expanded booking
  //
  // null = all collapsed
  // booking ID = that booking is expanded
  // -------------------------------------------------------

  const [expandedBookingId, setExpandedBookingId] =
    useState<number | null>(null);


  // =========================================================
  // TEMPORARY CUSTOMER ID
  //
  // Replace later with authenticated customer ID.
  // =========================================================
  // const customerId = 1002;
  const [customerId, setCustomerId] = useState<number | null>(null);


  // =========================================================
  // API BASE URL
  //
  // IMPORTANT:
  // Replace this with your existing backend URL.
  // =========================================================

  // =========================================================
  // GET CUSTOMER BOOKINGS
  // =========================================================
  const fetchBookings = async () => {

    try {

      setLoading(true);
      setError(null);

      // Get the currently logged-in user's ID
      const loggedInUserId = await getUserId();
      //Alert.alert(
      //  'Logged-in User',
      //  `User ID: ${loggedInUserId}`,
      //);
      console.log('Bookings LOGGED-IN USER ID:', loggedInUserId);

      if (!loggedInUserId) {
        throw new Error('Logged-in user ID not found.');
      }

      // Store the logged-in user ID
      setCustomerId(loggedInUserId);

      const response = await fetch(
        `${API_BASE_URL}/api/bookings_info/customer?customer_id=${loggedInUserId}`,
      );

      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`,
        );

      }

      const data: BookingsApiResponse = await response.json();

      setBookings(
        data.bookings ?? [],
      );

      // Start with everything collapsed.
      setExpandedBookingId(null);

    } catch (err) {

      console.error(
        'GET CUSTOMER BOOKINGS ERROR:',
        err,
      );

      setError(
        'Unable to load your bookings.',
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // LOAD BOOKINGS
  // =========================================================

  useEffect(() => {

    fetchBookings();

  }, []);


  // =========================================================
  // CURRENT / RECENT BOOKINGS
  // =========================================================

  const currentBookings =
    bookings.filter(
      booking =>
        booking.booking_age_category ===
        'RECENT',
    );


  // =========================================================
  // PAST BOOKINGS
  // =========================================================

  const pastBookings =
    bookings.filter(
      booking =>
        booking.booking_age_category ===
        'PAST',
    );


  const displayedBookings =
    activeTab === 'CURRENT'
      ? currentBookings
      : pastBookings;


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    dateString: string,
  ) => {

    const parts =
      dateString.split('-');

    if (parts.length !== 3) {

      return dateString;

    }

    const year = parts[0];

    const month = Number(
      parts[1],
    );

    const day = parts[2];

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return `${day}-${monthNames[month - 1]}-${year}`;
  };


  // =========================================================
  // FORMAT QUANTITY
  // =========================================================

  const formatQuantity = (
    quantity: number,
  ) => {

    if (Number.isInteger(quantity)) {

      return `${quantity} Ltr`;

    }

    return `${quantity.toFixed(2)} Ltr`;

  };


  // =========================================================
  // TOGGLE BOOKING
  // =========================================================

  const toggleBooking = (
    bookingId: number,
  ) => {

    setExpandedBookingId(
      currentId =>
        currentId === bookingId
          ? null
          : bookingId,
    );

  };


  // =========================================================
  // BOOKING CARD
  // =========================================================

  const renderBookingCard = (
    booking: Booking,
  ) => {

    const isExpanded =
      expandedBookingId ===
      booking.booking_id;

    const paymentSuccess =
      booking.payment_status ===
      'SUCCESS';


    return (

      <TouchableOpacity
        key={booking.booking_id}
        activeOpacity={0.9}
        style={styles.bookingCard}
        onPress={() =>
          toggleBooking(
            booking.booking_id,
          )
        }
      >

        {/* -------------------------------------------------
            HEADER
        ------------------------------------------------- */}

        <View style={styles.bookingHeader}>

          <View style={styles.headerLeft}>
            {/* Community */}
            <Text style={styles.communityName}>
              {booking.community_name}
            </Text>

            {/* Booking ID */}
            <Text style={styles.bookingId}>
              Booking #{booking.booking_id}
            </Text>

            {/* Date */}
            <Text style={styles.bookingDate}>
              {formatDate(
                booking.business_trans_date,
              )}
            </Text>
          </View>


          {/* Expand / Collapse */}
          <Text style={styles.expandIcon}>
            {isExpanded
              ? '▲'
              : '▼'}
          </Text>

        </View>


        {/* =================================================
            EXPANDED INFORMATION
        ================================================= */}

        {isExpanded && (
          <>
            <View style={styles.divider} />

            {/* -------------------------------------------------
                ITEM
            ------------------------------------------------- */}
            <View style={styles.row}>
              <Text style={styles.label}> {booking.item_name} </Text>
              <Text style={styles.value}>
                {formatQuantity(
                  Number(
                    booking.booking_qty,
                  ),
                )}
              </Text>
            </View>


            {/* -------------------------------------------------
                FULFILLMENT
            ------------------------------------------------- */}
            <View style={styles.row}>
              <Text style={styles.label}>Fulfillment</Text>
              <Text style={styles.value}>
                {booking.fulfillment_type}
              </Text>
            </View>


            {/* -------------------------------------------------
                TOTAL
            ------------------------------------------------- */}
            <View style={styles.row}>
              <Text style={styles.label}>Total</Text>
              <Text style={styles.amount}>
                ₹
                {Number(
                  booking.total_amount,
                ).toFixed(2)}
              </Text>
            </View>

          </>
        )}


        {/* =================================================
            PAYMENT STATUS
        ================================================= */}

        <View
          style={[
            styles.paymentRow,
            isExpanded &&
              styles.paymentRowExpanded,
          ]}
        >

          <Text style={styles.label}>Payment</Text>

          <View
            style={[
              styles.paymentBadge,

              paymentSuccess
                ? styles.successBadge
                : styles.failedBadge,
            ]}
          >

            <Text
              style={[
                styles.paymentText,

                paymentSuccess
                  ? styles.successText
                  : styles.failedText,
              ]}
            >
              {booking.payment_status}
            </Text>

          </View>

        </View>

      </TouchableOpacity>

    );

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* ===================================================
          HEADER : navigation.goBack()
      =================================================== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate('Home')
          }
        >
          <Text style={styles.backIcon}> ← </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY BOOKINGS</Text>
      </View>


      {/* ===================================================
          TABS
      =================================================== */}

      <View style={styles.tabsContainer}>

        <TouchableOpacity
          style={[
            styles.tab,

            activeTab === 'CURRENT' &&
              styles.activeTab,
          ]}
          onPress={() => {
            setActiveTab(
              'CURRENT',
            );

            setExpandedBookingId(
              null,
            );

          }}
        >

          <Text
            style={[
              styles.tabText,

              activeTab === 'CURRENT' &&
                styles.activeTabText,
            ]}
          >
            RECENT
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.tab,

            activeTab === 'PAST' &&
              styles.activeTab,
          ]}
          onPress={() => {

            setActiveTab(
              'PAST',
            );

            setExpandedBookingId(
              null,
            );

          }}
        >

          <Text
            style={[
              styles.tabText,

              activeTab === 'PAST' &&
                styles.activeTabText,
            ]}
          >
            PAST
          </Text>

        </TouchableOpacity>

      </View>


      {/* ===================================================
          BOOKING LIST
      =================================================== */}

      <ScrollView
        style={styles.content}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* -------------------------------------------------
            LOADING
        ------------------------------------------------- */}

        {loading ? (

          <View
            style={
              styles.loadingContainer
            }
          >

            <ActivityIndicator size="large" color="#1769C2" />
            <Text style={styles.loadingText}>Loading bookings...</Text>

          </View>

        ) : error ? (

          /* -------------------------------------------------
             ERROR
          ------------------------------------------------- */

          <View style={styles.emptyCard}>

            <Text style={styles.emptyTitle}>Unable to load bookings</Text>

            <Text style={styles.emptyText}> {error} </Text>


            <TouchableOpacity
              style={
                styles.retryButton
              }
              onPress={
                fetchBookings
              }
            >

              <Text
                style={styles.retryText}
              >
                TRY AGAIN
              </Text>

            </TouchableOpacity>

          </View>

        ) : displayedBookings.length === 0 ? (

          /* -------------------------------------------------
             EMPTY
          ------------------------------------------------- */

          <View
            style={styles.emptyCard}
          >

            <Text
              style={styles.emptyTitle}
            >
              No bookings found
            </Text>

            <Text
              style={styles.emptyText}
            >
              Your{' '}
              {activeTab === 'CURRENT'
                ? 'recent'
                : 'past'}{' '}
              bookings will appear
              here.
            </Text>

          </View>

        ) : (

          /* -------------------------------------------------
             BOOKINGS
          ------------------------------------------------- */

          displayedBookings.map(
            renderBookingCard,
          )

        )}

      </ScrollView>

    </SafeAreaView>

  );

};


export default BookingsInfo;


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#97d9fd',
  },


  // -------------------------------------------------------
  // Header
  // -------------------------------------------------------

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


  // -------------------------------------------------------
  // Tabs
  // -------------------------------------------------------

  tabsContainer: {
    marginTop: 15,
    marginHorizontal: 16,

    padding: 5,

    borderRadius: 12,

    backgroundColor:
      'rgba(255,255,255,0.95)',

    flexDirection: 'row',
  },

  tab: {
    flex: 1,

    paddingVertical: 12,

    borderRadius: 9,

    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#1769C2',
  },

  tabText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#666666',
  },

  activeTabText: {
    color: '#FFFFFF',
  },


  // -------------------------------------------------------
  // Content
  // -------------------------------------------------------

  content: {
    flex: 1,

    paddingHorizontal: 16,
  },

  contentContainer: {
    paddingTop: 15,

    paddingBottom: 30,
  },


  // -------------------------------------------------------
  // Booking Card
  // -------------------------------------------------------

  bookingCard: {
    backgroundColor:
      'rgba(255,255,255,0.95)',

    borderRadius: 16,

    padding: 18,

    marginBottom: 15,

    elevation: 4,
  },


  // -------------------------------------------------------
  // Booking Header
  // -------------------------------------------------------

  bookingHeader: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',
  },

  headerLeft: {
    flex: 1,

    paddingRight: 10,
  },

  communityName: {
    fontSize: 16,

    fontWeight: '800',

    color: '#333333',
  },

  bookingId: {
    marginTop: 5,

    fontSize: 15,

    fontWeight: '700',

    color: '#555555',
  },

  bookingDate: {
    marginTop: 4,

    fontSize: 13,

    color: '#777777',
  },

  expandIcon: {
    fontSize: 16,

    fontWeight: '800',

    color: '#1769C2',

    paddingHorizontal: 5,
  },


  // -------------------------------------------------------
  // Divider
  // -------------------------------------------------------

  divider: {
    height: 1,

    backgroundColor: '#E5E5E5',

    marginVertical: 14,
  },


  // -------------------------------------------------------
  // Rows
  // -------------------------------------------------------

  row: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginVertical: 7,
  },

  label: {
    fontSize: 14,

    color: '#666666',
  },

  value: {
    fontSize: 14,

    fontWeight: '700',

    color: '#333333',
  },

  amount: {
    fontSize: 18,

    fontWeight: '800',

    color: '#1769C2',
  },


  // -------------------------------------------------------
  // Payment
  // -------------------------------------------------------

  paymentRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginTop: 14,
  },

  paymentRowExpanded: {
    marginTop: 8,
  },

  paymentBadge: {
    paddingHorizontal: 10,

    paddingVertical: 5,

    borderRadius: 20,
  },

  successBadge: {
    backgroundColor: '#E4F6E9',
  },

  failedBadge: {
    backgroundColor: '#FDE8E8',
  },

  paymentText: {
    fontSize: 11,

    fontWeight: '800',
  },

  successText: {
    color: '#198754',
  },

  failedText: {
    color: '#D32F2F',
  },


  // -------------------------------------------------------
  // Loading
  // -------------------------------------------------------

  loadingContainer: {
    paddingTop: 50,

    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,

    fontSize: 14,

    color: '#555555',
  },


  // -------------------------------------------------------
  // Empty / Error
  // -------------------------------------------------------

  emptyCard: {
    backgroundColor:
      'rgba(255,255,255,0.95)',

    borderRadius: 16,

    padding: 30,

    alignItems: 'center',

    elevation: 3,
  },

  emptyTitle: {
    fontSize: 18,

    fontWeight: '800',

    color: '#333333',
  },

  emptyText: {
    marginTop: 8,

    fontSize: 14,

    textAlign: 'center',

    color: '#666666',
  },

  retryButton: {
    marginTop: 18,

    paddingHorizontal: 20,

    paddingVertical: 10,

    borderRadius: 8,

    backgroundColor: '#1769C2',
  },

  retryText: {
    color: '#FFFFFF',

    fontSize: 13,

    fontWeight: '800',
  },

});