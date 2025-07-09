import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { COLORS } from '@/constants/theme';
import { format } from 'date-fns';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { Image } from 'expo-image';

// Interfaces to match the data structure from getRecyclingRequestById
interface ProductInOrderDetails {
  _id: Id<"products">;
  model: string;
  images?: string[];
  status?: string;
}

interface DeliveryAgentInDetails {
  _id: Id<"deliveryAgents">;
  name: string;
  photoUrl: string;
  contactNumber: string;
  vehicleType: string;
  vehicleNumber: string;
}

interface RequestingUserInDetails {
  _id: Id<"users">;
  username: string;
  image: string;
  homeAddress?: string;
  officeAddress?: string;
  phoneNumber?: string;
}

interface SingleRecyclingRequestDetails extends Doc<"recyclingRequests"> {
  products: ProductInOrderDetails[];
  deliveryAgent?: DeliveryAgentInDetails | null;
  requestingUser?: RequestingUserInDetails | null;
  // New fields from recyclingRequests schema
  pickupAddressType?: "home" | "office";
  alternativePhoneNumber?: string;
  pickupNotes?: string;
}

export default function RecyclingOrderDetailsScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();

  const orderId = typeof requestId === 'string' ? requestId : null;

  const recyclingOrder = useQuery(
    api.recyclingRequests.getRecyclingRequestById,
    orderId ? { requestId: orderId as Id<"recyclingRequests"> } : "skip"
  );

  // Function to handle calling a phone number
  const handleCall = (phoneNumber: string | undefined) => {
    if (phoneNumber) {
      const url = `tel:${phoneNumber.replace(/\s/g, '')}`; // Remove spaces for dialing
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Call Failed', 'Phone dialing is not supported on this device or emulator.');
        }
      }).catch(err => console.error('An error occurred', err));
    } else {
      Alert.alert('Error', 'Phone number not available.');
    }
  };

  if (recyclingOrder === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (recyclingOrder === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
          <Text style={styles.errorText}>Order not found or unauthorized.</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonErrorText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { requestingUser, deliveryAgent, pickupAddressType, alternativePhoneNumber, pickupNotes } = recyclingOrder;

  // Determine the primary pickup address based on selection
  const primaryPickupAddress =
    pickupAddressType === 'home'
      ? requestingUser?.homeAddress
      : pickupAddressType === 'office'
      ? requestingUser?.officeAddress
      : 'Not Specified';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Order Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Request ID:</Text>
            <Text style={styles.detailValue}>#{recyclingOrder._id.slice(-6).toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, styles[`status_${recyclingOrder.status}` as keyof typeof styles]]}>
              {recyclingOrder.status.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted On:</Text>
            <Text style={styles.detailValue}>{format(new Date(recyclingOrder.createdAt), 'MMM dd,yyyy hh:mm a')}</Text>
          </View>
          {recyclingOrder.updatedAt && recyclingOrder.status !== 'pending_approval' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Updated:</Text>
              <Text style={styles.detailValue}>{format(new Date(recyclingOrder.updatedAt), 'MMM dd,yyyy hh:mm a')}</Text>
            </View>
          )}
        </View>

        {/* NEW SECTION: Pickup Contact Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Pickup Contact Information</Text>
          {requestingUser ? (
            <>
              <View style={styles.userProfileContainer}>
                {requestingUser.image && (
                  <Image
                    source={requestingUser.image}
                    style={styles.userProfileImage}
                    contentFit="cover"
                    transition={200}
                  />
                )}
                <Text style={styles.usernameText}>{requestingUser.username}</Text>
              </View>

              {/* User's Primary Phone Number (as plain text) */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone Number:</Text>
                <Text style={styles.detailValue}>
                  {requestingUser.phoneNumber || 'N/A'}
                </Text>
              </View>

              {/* User's Alternative Phone Number (optional) */}
              {alternativePhoneNumber ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Alt. Phone No.:</Text>
                  <Text style={styles.detailValue}>
                    {alternativePhoneNumber}
                  </Text>
                </View>
              ) : null}

              {/* Pickup Address Type */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pickup Location:</Text>
                <Text style={styles.detailValue}>
                  {pickupAddressType ? pickupAddressType.charAt(0).toUpperCase() + pickupAddressType.slice(1) : 'Not Specified'}
                </Text>
              </View>

              {/* Confirmed Pickup Address */}
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Confirmed Address:</Text>
                <Text style={styles.addressText}>{primaryPickupAddress || 'Not Provided'}</Text>
              </View>

              {/* Pickup Notes (optional) */}
              {pickupNotes ? (
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Pickup Notes:</Text>
                  <Text style={styles.addressText}>{pickupNotes}</Text>
                </View>
              ) : null}
              
            </>
          ) : (
            <Text style={styles.noInfoText}>User information not available.</Text>
          )}
        </View>

        {/* Collection Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Collection Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Requested Date:</Text>
            <Text style={styles.detailValue}>{format(new Date(recyclingOrder.requestedCollectionDate), 'MMM dd,yyyy')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time Slot:</Text>
            <Text style={styles.detailValue}>{recyclingOrder.requestedCollectionTimeSlot}</Text>
          </View>
          {/* Display full delivery agent details */}
          {deliveryAgent && (
            <View style={styles.agentDetailsContainer}>
              <Image
                source={deliveryAgent.photoUrl}
                style={styles.agentPhoto}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>
                  <Text style={styles.detailLabel}>Agent:</Text> {deliveryAgent.name}
                </Text>
                {/* Agent's contact number remains clickable */}
                <TouchableOpacity onPress={() => handleCall(deliveryAgent.contactNumber)}>
                  <Text style={[styles.agentContact, styles.clickableText]}>
                    <Ionicons name="call-outline" size={14} color={COLORS.black} />{' '}
                    {deliveryAgent.contactNumber}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.agentVehicle}>
                  <Text style={styles.detailLabel}>Vehicle:</Text> {deliveryAgent.vehicleType}{' '}
                  ({deliveryAgent.vehicleNumber})
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Payment Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Payable:</Text>
            <Text style={styles.detailValue}>₹{recyclingOrder.paymentAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status:</Text>
            <Text style={[styles.detailValue, styles[`payment_${recyclingOrder.paymentStatus}` as keyof typeof styles]]}>
              {recyclingOrder.paymentStatus.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())}
            </Text>
          </View>
        </View>

        {/* Products in Request */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Products in This Order</Text>
          {recyclingOrder.products && recyclingOrder.products.length > 0 ? (
            recyclingOrder.products.map((product, index) => (
              product && (
                <View key={product._id} style={styles.productItem}>
                  {product.images && product.images.length > 0 && (
                    <Image source={product.images[0]} style={styles.productImage} contentFit="cover" />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productModel}>{product.model}</Text>
                    <Text style={styles.productStatus}>Status: {product.status?.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())}</Text>
                  </View>
                </View>
              )
            ))
          ) : (
            <Text style={styles.noProductsText}>No products found for this order.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.brand,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonErrorText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Keeps label and value on opposite ends
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: COLORS.darkGray,
    fontWeight: '500',
    flexBasis: '45%', // Give label enough space
    textAlign: 'left',
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
    flexBasis: '55%', // Give value remaining space
    textAlign: 'right',
    marginLeft: 10, // Add a bit of margin if label is short
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productModel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  productStatus: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  noProductsText: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  status_pending_approval: { color: COLORS.warning },
  status_scheduled: { color: COLORS.black },
  status_collected: { color: COLORS.primary },
  status_completed: { color: COLORS.green },
  status_cancelled: { color: COLORS.error },
  payment_pending: { color: COLORS.warning },
  payment_paid: { color: COLORS.green },
  payment_not_applicable: { color: COLORS.darkGray },

  agentDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  agentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  agentContact: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  agentVehicle: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  // New styles for pickup contact information
  userProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  userProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addressContainer: {
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.text,
  },
  clickableText: {
    color: COLORS.black, // Using a distinct color for clickable elements
    textDecorationLine: 'underline',
  },
  infoTextSmall: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
  noInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  }
});