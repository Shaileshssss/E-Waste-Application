import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-expo';
import { api } from '@/convex/_generated/api';
import { COLORS } from '@/constants/theme';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { Doc, Id } from '@/convex/_generated/dataModel';

// Interfaces (same as before)
interface RecycledProductDetail {
  _id: Id<"products">;
  model: string;
  images?: string[];
  status?: "available" | "pending_request" | "recycled" | "sold";
}

interface DeliveryAgent {
  _id: Id<"deliveryAgents">;
  _creationTime: number;
  name: string;
  photoUrl: string;
  contactNumber: string;
  vehicleType: string;
  vehicleNumber: string;
}

interface DetailedRecyclingRequest extends Doc<"recyclingRequests"> {
  products: (RecycledProductDetail | null)[];
  deliveryAgent?: DeliveryAgent | null;
}

interface AvailableProduct extends Doc<"products"> {
  brand: string[];
  categoryId: string;
  model: string;
  quantity: string;
  os: string[]; // No '?' here, as backend ensures it's always an array
}


export default function MyRecyclingRequestsScreen() {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<DetailedRecyclingRequest | null>(null);
  
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'not_applicable'>('pending');

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  const recyclingRequests = useQuery(
    api.recyclingRequests.getDetailedRecyclingRequestsForUser,
    currentUser?._id ? undefined : "skip"
  );

  const availableProducts = useQuery(
    api.products.getAvailableProductsForUser,
    currentUser?._id ? undefined : "skip" 
  );

  const markRequestAsCompleted = useMutation(api.recyclingRequests.markRequestAsCompleted);

  const handleCompletePress = (request: DetailedRecyclingRequest) => {
    setSelectedRequestForAction(request);
    setPaymentStatus(request.paymentStatus || 'pending');
    setShowCompleteModal(true);
  };

  const handleViewOrderDetails = (requestId: Id<"recyclingRequests">) => {
    router.push({
      // CRITICAL CHANGE: New path includes 'details' folder
      pathname: `/recycling-flow/details/${requestId}` as any, 
      params: { requestId: requestId },
    });
  };

  const submitComplete = async () => {
    if (!selectedRequestForAction) return;

    try {
      await markRequestAsCompleted({
        requestId: selectedRequestForAction._id,
        paymentStatus: paymentStatus,
      });
      Alert.alert('Success', 'Recycling request marked as completed!');
      setShowCompleteModal(false);
      setSelectedRequestForAction(null);
      setPaymentStatus('pending');
    } catch (error: any) {
      console.error("Error marking request complete:", error);
      Alert.alert('Error', error.message || 'Failed to mark as completed.');
    }
  };


  if (recyclingRequests === undefined || currentUser === undefined || availableProducts === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Recycling</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderProductItemInRequest = ({ item }: { item: RecycledProductDetail | null }) => {
    if (!item) {
      return null;
    }
    return (
      <View style={styles.productItem}>
        {item.images && item.images.length > 0 && (
          <Image
            source={item.images[0]}
            style={styles.productImage}
            contentFit="cover"
            transition={200}
          />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productModel}>{item.model}</Text>
          {item.status && (
            <Text style={styles.productStatus}>Status: {item.status.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderAvailableProductItem = ({ item }: { item: AvailableProduct }) => (
    <View style={styles.availableProductCard}>
      {item.images && item.images.length > 0 && (
        <Image source={item.images[0]} style={styles.availableProductImage} contentFit="cover" />
      )}
      <View style={styles.availableProductDetails}>
        <Text style={styles.availableProductDetailText}>
          <Text style={styles.detailLabel}>Brand:</Text> {item.brand.join(', ')}
        </Text>
        <Text style={styles.availableProductDetailText}>
          <Text style={styles.detailLabel}>Category:</Text> {item.categoryId}
        </Text>
        <Text style={styles.availableProductDetailText}>
          <Text style={styles.detailLabel}>Model:</Text> {item.model}
        </Text>
        <Text style={styles.availableProductDetailText}>
          <Text style={styles.detailLabel}>Quantity:</Text> {item.quantity}
        </Text>
        <Text style={styles.availableProductDetailText}>
          <Text style={styles.detailLabel}>OS:</Text> {item.os.length > 0 ? item.os.join(', ') : 'N/A'}
        </Text>
      </View>
    </View>
  );


  const renderRequestCard = ({ item: request, index }: { item: DetailedRecyclingRequest, index: number }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.requestSlNo}>Sl. No. {index + 1}</Text>
        <Text style={styles.requestId}>Request ID: #{request._id.slice(-6).toUpperCase()}</Text>
        {/* Button to navigate to Order Details Screen */}
        {(request.status === 'scheduled' || request.status === 'collected' || request.status === 'completed') && (
            <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => handleViewOrderDetails(request._id)}
            >
                <Ionicons name="information-circle-outline" size={24} color={COLORS.black} />
            </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.requestDetails}>
        <Text style={styles.detailText}>
          Requested: {format(new Date(request.requestedCollectionDate), 'MMM dd,yyyy')} ({request.requestedCollectionTimeSlot})
        </Text>
        <Text style={styles.detailText}>
          Status: <Text style={[styles.statusText, styles[`status_${request.status}` as keyof typeof styles]]}>
                      {request.status.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())}
                    </Text>
        </Text>
        <Text style={styles.detailText}>
          Payment: <Text style={[styles.paymentStatusText, styles[`payment_${request.paymentStatus}` as keyof typeof styles]]}>
                      ₹{request.paymentAmount.toFixed(2)} ({request.paymentStatus.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())})
                    </Text>
        </Text>
        
        {request.deliveryAgent && (
          <Text style={styles.detailText}>
            Agent: {request.deliveryAgent.name} ({request.deliveryAgent.vehicleType})
          </Text>
        )}
        {request.createdAt && (
          <Text style={styles.detailText}>
            Submitted: {format(new Date(request.createdAt), 'MMM dd,yyyy hh:mm a')}
          </Text>
        )}
        {request.updatedAt && request.status !== 'pending_approval' && (
          <Text style={styles.detailText}>
            Last Updated: {format(new Date(request.updatedAt), 'MMM dd,yyyy hh:mm a')}
          </Text>
        )}
      </View>

      <Text style={styles.productsHeader}>Products in this Request:</Text>
      {request.products && request.products.length > 0 ? (
        <FlatList
          data={request.products.filter(Boolean)}
          renderItem={renderProductItemInRequest}
          keyExtractor={(product) => product!._id}
          scrollEnabled={false}
          contentContainerStyle={styles.productsList}
        />
      ) : (
        <Text style={styles.noProductsText}>No products found for this request.</Text>
      )}

      <View style={styles.actionButtonsContainer}>
        {(request.status === 'scheduled' || request.status === 'collected') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleCompletePress(request)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Mark Completed</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Recycling</Text>
      </View>
      <ScrollView contentContainerStyle={styles.mainScrollViewContent}>
        {/* Section 1: Available Products for Recycling */}
        <Text style={styles.mainSectionTitle}>My Products Available for Recycling</Text>
        {availableProducts.length > 0 ? (
          <FlatList
            data={availableProducts}
            renderItem={renderAvailableProductItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.availableProductsList}
          />
        ) : (
          <View style={styles.noProductsContainer}>
            <Ionicons name="cube-outline" size={60} color={COLORS.darkGray} />
            <Text style={styles.noProductsText}>You have no products available for recycling.</Text>
            <Text style={styles.noProductsSubText}>List new products on your profile to recycle them.</Text>
          </View>
        )}

        {/* THIS IS THE CRITICAL BUTTON for the static submit screen */}
        <TouchableOpacity
          style={styles.newRequestButton}
          onPress={() => router.push("/recycling-flow/submit-recycling-request-screen")} // This path for the static screen remains unchanged
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
          <Text style={styles.newRequestButtonText}>Request Pickup for My Products</Text>
        </TouchableOpacity>

        {/* Section 2: My Recycling Request History */}
        <Text style={styles.mainSectionTitle}>My Recycling Request History</Text>
        {recyclingRequests.length > 0 ? (
          <FlatList
            data={recyclingRequests}
            renderItem={renderRequestCard}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.requestsListContainer}
          />
        ) : (
          <View style={styles.noRequestsContainer}>
            <Ionicons name="receipt-outline" size={80} color={COLORS.darkGray} />
            <Text style={styles.noRequestsText}>You haven't made any recycling requests yet.</Text>
          </View>
        )}
      </ScrollView>

      {/* Mark Completed Modal (remains) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCompleteModal}
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mark Request Completed</Text>
            <Text style={styles.modalSubtitle}>Request ID: {selectedRequestForAction?._id.slice(-6).toUpperCase()}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Status:</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setPaymentStatus('pending')}
                >
                  <Ionicons
                    name={paymentStatus === 'pending' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.radioLabel}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setPaymentStatus('paid')}
                >
                  <Ionicons
                    name={paymentStatus === 'paid' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.radioLabel}>Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setPaymentStatus('not_applicable')}
                >
                  <Ionicons
                    name={paymentStatus === 'not_applicable' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.radioLabel}>N/A</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setShowCompleteModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalConfirmButton]} onPress={submitComplete}>
                <Text style={styles.modalButtonText}>Confirm Completion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  mainScrollViewContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  mainSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    marginTop: 25,
    textAlign: 'center',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  requestsListContainer: {
    paddingBottom: 20,
  },
  requestCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  requestSlNo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  requestId: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: 'bold',
  },
  requestDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  statusText: {
    fontWeight: 'bold',
  },
  status_pending_approval: { color: COLORS.warning },
  status_scheduled: { color: COLORS.blue },
  status_collected: { color: COLORS.primary },
  status_completed: { color: COLORS.green },
  status_cancelled: { color: COLORS.error },
  
  paymentStatusText: {
    fontWeight: 'bold',
  },
  payment_pending: { color: COLORS.warning },
  payment_paid: { color: COLORS.green },
  payment_not_applicable: { color: COLORS.darkGray },

  productsHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 5,
  },
  productsList: {
    // No specific padding needed here if productItem has its own
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
  noRequestsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 15,
  },
  availableProductsList: {
    // No specific padding needed here if productItem has its own
  },
  availableProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  availableProductImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  availableProductDetails: {
    flex: 1,
  },
  availableProductDetailText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  newRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: 'stretch',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  newRequestButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.lightGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 25,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: COLORS.gray,
  },
  modalConfirmButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
  },
  viewDetailsButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
});