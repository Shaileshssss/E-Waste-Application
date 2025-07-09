// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Modal, TextInput, ScrollView, Alert, Platform } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { useQuery, useMutation } from 'convex/react';
// import { useAuth } from '@clerk/clerk-expo';
// import { api } from '@/convex/_generated/api';
// import { COLORS } from '@/constants/theme';
// import { Doc, Id } from '@/convex/_generated/dataModel';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Corrected import for Android/iOS date picker
// import { format } from 'date-fns';
// import { Image } from 'expo-image';

// interface AvailableProduct extends Doc<"products"> {
//   brand: string[];
//   categoryId: string;
//   model: string;
//   images?: string[];
//   quantity: string;
//   os: string[];
// }

// // User data relevant to pickup details
// interface CurrentUserForPickup extends Doc<"users"> {
//   username: string;
//   image: string;
//   homeAddress?: string;
//   officeAddress?: string;
//   phoneNumber?: string; // User's primary phone number
// }


// export default function SubmitRecyclingRequestScreen() {
//   // console.log('SubmitRecyclingRequestScreen mounted.'); // Debug Log

//   const router = useRouter();
//   const { userId: clerkUserId } = useAuth();

//   // State for the main form
//   const [selectedProductIds, setSelectedProductIds] = useState<Id<"products">[]>([]);
//   const [collectionDate, setCollectionDate] = useState<Date>(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [timeSlot, setTimeSlot] = useState<string>('morning');
//   const [paymentAmount, setPaymentAmount] = useState<number>(0);
//   const [loadingSubmission, setLoadingSubmission] = useState(false);

//   // State for the pre-submission modal
//   // FIX: Initialize showPreSubmissionModal to false so it doesn't show on initial load
//   const [showPreSubmissionModal, setShowPreSubmissionModal] = useState(false);
//   // Using 'undefined' for the initial state aligns with Convex's optional field types.
//   const [confirmedAddressType, setConfirmedAddressType] = useState<"home" | "office" | undefined>(undefined);
//   const [alternativePhoneNumber, setAlternativePhoneNumber] = useState<string>('');
//   const [pickupNotes, setPickupNotes] = useState<string>('');
  
//   // This state tracks if the pickup details have been successfully confirmed in the modal at least once
//   // during the current request setup session.
//   const [isPickupDetailsConfirmed, setIsPickupDetailsConfirmed] = useState(false);


//   // Fetch current user details from Convex.
//   const currentUser = useQuery(
//     api.users.getUserByClerkId,
//     clerkUserId ? { clerkId: clerkUserId } : "skip" // Skip query if clerkUserId is not available
//   );

//   // Fetch available products for the current user from Convex.
//   const availableProducts = useQuery(
//     api.products.getAvailableProductsForUser,
//     currentUser?._id ? undefined : "skip" // Only fetch products if currentUser._id is available
//   );

//   // Mutation to create a recycling request in Convex.
//   const createRecyclingRequest = useMutation(api.recyclingRequests.createRecyclingRequest);

//   // Effect hook to initialize confirmed address type and phone number once user data is loaded.
//   useEffect(() => {
//     if (currentUser) {
//       // console.log('CurrentUser fetched in useEffect:', currentUser); // Debug Log
//       // Prioritize home address, then office, or leave undefined if neither.
//       if (currentUser.homeAddress) {
//         setConfirmedAddressType('home');
//       } else if (currentUser.officeAddress) {
//         setConfirmedAddressType('office');
//       }
//       setAlternativePhoneNumber(currentUser.phoneNumber || ''); // Pre-fill with user's primary phone number or empty string
//     }
//   }, [currentUser]);


//   // Handles adding or removing a product from the list of selected products for recycling.
//   const toggleProductSelection = (productId: Id<"products">, priceValue: number) => {
//     // console.log('toggleProductSelection called for product:', productId); // Debug Log
//     setSelectedProductIds(prev => {
//       const isSelected = prev.includes(productId);
//       // console.log('Previous selectedProductIds:', prev, 'Is currently selected:', isSelected); // Debug Log
//       // console.log('isPickupDetailsConfirmed (before toggle):', isPickupDetailsConfirmed); // Debug Log
//       let newSelectedIds;

//       if (isSelected) {
//         // If the product was already selected, remove it from the list.
//         newSelectedIds = prev.filter(id => id !== productId);
//         setPaymentAmount(prevAmount => prevAmount - priceValue);
//       } else {
//         // If the product was not selected, add it to the list.
//         newSelectedIds = [...prev, productId];
//         setPaymentAmount(prevAmount => prevAmount + priceValue);

//         // Crucial FIX: Show the confirmation modal ONLY if this is the very first product
//         // being selected (i.e., 'prev' was empty) AND the pickup details
//         // have not yet been confirmed in this session.
//         if (prev.length === 0 && !isPickupDetailsConfirmed) {
//           // console.log('Triggering pre-submission modal: First product selected and not confirmed.'); // Debug Log
//           setShowPreSubmissionModal(true);
//         }
//       }
//       // console.log('New selectedProductIds:', newSelectedIds); // Debug Log
//       // console.log('Current paymentAmount:', paymentAmount + (isSelected ? -priceValue : priceValue)); // Debug Log
//       return newSelectedIds;
//     });
//   };

//   // Handles the change event from the DateTimePicker for selecting the collection date.
//   const onChangeDate = (event: any, selectedDate?: Date) => {
//     const currentDate = selectedDate || collectionDate;
//     setShowDatePicker(Platform.OS === 'ios'); // On iOS, the picker is inline; on Android, it's a dialog.
//     setCollectionDate(currentDate);
//     // console.log('Collection date changed to:', currentDate); // Debug Log
//   };

//   // Dummy function to provide an estimated value for a product based on its category.
//   const getProductValue = (product: AvailableProduct): number => {
//     switch (product.categoryId) {
//       case 'Smartphone': return 500;
//       case 'Laptop': return 1000;
//       case 'Tablet': return 300;
//       default: return 100; // Default value for other categories
//     }
//   };

//   // Handles the "Confirm Details" button press within the pickup details modal.
//   const handleConfirmPickupDetails = () => {
//     // console.log('handleConfirmPickupDetails called.'); // Debug Log
//     // Validate that either 'home' or 'office' address type has been selected.
//     if (confirmedAddressType === undefined) {
//       // console.log('Validation: Address type not selected in modal.'); // Debug Log
//       Alert.alert('Selection Required', 'Please confirm whether the pickup address is Home or Office.');
//       return;
//     }
//     setShowPreSubmissionModal(false); // Close the modal.
//     setIsPickupDetailsConfirmed(true); // Mark the pickup details as confirmed for the current session.
//     // console.log('Closing pre-submission modal. isPickupDetailsConfirmed set to true.'); // Debug Log
//   };


//   // Handles the main "Submit Recycling Request" button press.
//   const handleSubmit = async () => {
//     // console.log('handleSubmit called.'); // Debug Log
//     // console.log('Current selectedProductIds:', selectedProductIds); // Debug Log
//     // console.log('Current isPickupDetailsConfirmed:', isPickupDetailsConfirmed); // Debug Log

//     // Validation 1: Ensure the user is authenticated.
//     if (!currentUser) {
//       // console.log('Error: User not authenticated.'); // Debug Log
//       Alert.alert('Error', 'User not authenticated.');
//       return;
//     }

//     // Validation 2: Ensure at least one product has been selected for recycling.
//     if (selectedProductIds.length === 0) {
//       // console.log('Validation: No products selected for submission.'); // Debug Log
//       Alert.alert('Validation Error', 'Please select at least one product for recycling.');
//       // FIX: The modal for pickup details should NOT appear here, as no products are selected.
//       return;
//     }

//     // Validation 3: If products are selected, but pickup details haven't been confirmed yet in this session,
//     // prompt the user and explicitly show the modal to force confirmation.
//     if (!isPickupDetailsConfirmed) {
//       // console.log('Validation: Pickup details not confirmed. Re-opening modal.'); // Debug Log
//       Alert.alert(
//         'Pickup Details Required',
//         'Please select and confirm your pickup address details to proceed.'
//       );
//       setShowPreSubmissionModal(true); // Re-open the modal to enforce confirmation.
//       return; // Stop the submission process until details are confirmed.
//     }

//     // Validation 4: Ensure a collection date has been selected.
//     if (!collectionDate) {
//       // console.log('Validation: No collection date selected.'); // Debug Log
//       Alert.alert('Validation Error', 'Please select a collection date.');
//       return;
//     }

//     // Convert the selected JavaScript Date object to a Unix timestamp (milliseconds).
//     const requestedCollectionDateTimestamp = collectionDate.getTime();

//     setLoadingSubmission(true); // Set loading state to true to show activity indicator.
//     // console.log('Attempting to create recycling request...'); // Debug Log
//     try {
//       // Call the Convex mutation to persist the recycling request data.
//       const requestId = await createRecyclingRequest({
//         userId: currentUser._id,
//         productIds: selectedProductIds,
//         requestedCollectionDate: requestedCollectionDateTimestamp,
//         requestedCollectionTimeSlot: timeSlot,
//         paymentAmount: paymentAmount,
//         pickupAddressType: confirmedAddressType, // This will be 'home' or 'office' (guaranteed by previous validation)
//         alternativePhoneNumber: alternativePhoneNumber || undefined, // Pass 'undefined' if the field is empty
//         pickupNotes: pickupNotes || undefined, // Pass 'undefined' if the field is empty
//       });
//       // Display success message with a partial request ID.
//       Alert.alert('Success', `Recycling request submitted! Request ID: ${requestId.slice(-6).toUpperCase()}`);
//       router.back(); // Navigate back to the previous screen (e.g., "My Recycling Requests").
//     } catch (error: any) {
//       // Log and display any errors that occur during the submission process.
//       // console.error("Error submitting recycling request:", error); // Debug Log
//       Alert.alert('Error', error.message || 'Failed to submit recycling request.');
//     } finally {
//       setLoadingSubmission(false); // Reset loading state.
//       // console.log('Submission process finished.'); // Debug Log
//     }
//   };

//   // Render a loading screen while essential data (user profile, available products) is being fetched.
//   if (currentUser === undefined || availableProducts === undefined) {
//     // console.log('Rendering loading state: currentUser or availableProducts is undefined.'); // Debug Log
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Loading products and user data...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Functional component to render the pickup details confirmation modal.
//   const renderPreSubmissionModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={showPreSubmissionModal} // Modal visibility controlled by this state.
//       onRequestClose={() => {
//         // console.log('Modal onRequestClose triggered.'); // Debug Log
//         // Prompt user if they want to cancel the entire request setup when trying to close the modal.
//         Alert.alert(
//           "Cancel Request Setup",
//           "Are you sure you want to cancel setting up this request? Your selected products will be deselected.",
//           [
//             { text: "No", style: "cancel" },
//             {
//               text: "Yes, Cancel",
//               onPress: () => {
//                 setShowPreSubmissionModal(false); // Hide the modal.
//                 setSelectedProductIds([]); // Clear any products that were selected before opening the modal.
//                 setPaymentAmount(0); // Reset the payment total.
//                 setIsPickupDetailsConfirmed(false); // Reset confirmation status as user cancelled.
//                 setConfirmedAddressType(undefined); // Clear selected address type.
//                 setAlternativePhoneNumber(''); // Clear alternative phone.
//                 setPickupNotes(''); // Clear notes.
//                 router.back(); // Navigate back to the previous screen.
//                 // console.log('User cancelled modal, navigating back and resetting state.'); // Debug Log
//               }
//             }
//           ]
//         );
//       }}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>Confirm Pickup Details</Text>
//           <Text style={styles.modalSubtitle}>Please confirm your pickup address and provide any additional details for the agent.</Text>

//           {currentUser ? ( // Ensure currentUser data is available before rendering details.
//             <ScrollView style={styles.modalScrollView}>
//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Your Username:</Text>
//                 <Text style={styles.modalUserInfoText}>{currentUser.username}</Text>
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Home Address:</Text>
//                 <Text style={styles.modalAddressText}>
//                   {currentUser.homeAddress || 'Not Provided'} {/* Display home address or 'Not Provided' */}
//                 </Text>
//               </View>

//               {/* Conditionally render office address if it exists */}
//               {currentUser.officeAddress ? (
//                 <View style={styles.inputGroup}>
//                   <Text style={styles.label}>Office Address:</Text>
//                   <Text style={styles.modalAddressText}>
//                     {currentUser.officeAddress}
//                   </Text>
//                 </View>
//               ) : null}

//               <Text style={styles.label}>Select Pickup Address Type:</Text>
//               <View style={styles.radioGroup}>
//                 {currentUser.homeAddress && ( // Only show option if home address exists
//                   <TouchableOpacity
//                     style={styles.radioButton}
//                     onPress={() => setConfirmedAddressType('home')}
//                   >
//                     <Ionicons
//                       name={confirmedAddressType === 'home' ? 'radio-button-on' : 'radio-button-off'}
//                       size={20}
//                       color={COLORS.primary}
//                     />
//                     <Text style={styles.radioLabel}>Home</Text>
//                   </TouchableOpacity>
//                 )}
//                 {currentUser.officeAddress && ( // Only show option if office address exists
//                   <TouchableOpacity
//                     style={styles.radioButton}
//                     onPress={() => setConfirmedAddressType('office')}
//                   >
//                     <Ionicons
//                       name={confirmedAddressType === 'office' ? 'radio-button-on' : 'radio-button-off'}
//                       size={20}
//                       color={COLORS.primary}
//                     />
//                     <Text style={styles.radioLabel}>Office</Text>
//                   </TouchableOpacity>
//                 )}
//                 {/* Warning if no addresses are provided in the user profile */}
//                 {!currentUser.homeAddress && !currentUser.officeAddress && (
//                   <Text style={styles.noAddressWarning}>
//                     Please update your profile with at least one address to proceed.
//                   </Text>
//                 )}
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Alternative Phone Number (Optional):</Text>
//                 <TextInput
//                   style={styles.textInput}
//                   value={alternativePhoneNumber}
//                   onChangeText={setAlternativePhoneNumber}
//                   placeholder="e.g., +91 9876543210"
//                   keyboardType="phone-pad"
//                 />
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Pickup Notes / Instructions (Optional):</Text>
//                 <TextInput
//                   style={[styles.textInput, styles.multilineInput]}
//                   value={pickupNotes}
//                   onChangeText={setPickupNotes}
//                   placeholder="e.g., 'Ring bell twice', 'Flat 3B near elevator'"
//                   multiline
//                   numberOfLines={3}
//                   textAlignVertical="top"
//                 />
//               </View>
//             </ScrollView>
//           ) : (
//             <Text style={styles.loadingText}>Loading user profile...</Text> // Display loading if user data not ready
//           )}

//           <TouchableOpacity
//             style={styles.modalConfirmButton}
//             onPress={handleConfirmPickupDetails}
//             // Disable button if no address type is selected or user data isn't loaded
//             disabled={confirmedAddressType === undefined || !currentUser}
//           >
//             <Text style={styles.modalButtonText}>Confirm Details</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );


//   // console.log('Rendering SubmitRecyclingRequestScreen. showPreSubmissionModal:', showPreSubmissionModal, 'availableProducts.length:', availableProducts?.length || 0); // Debug Log

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>New Recycling Request</Text>
//       </View>

//       {/* The modal is rendered conditionally based on the 'showPreSubmissionModal' state. */}
//       {showPreSubmissionModal && renderPreSubmissionModal()}

//       {/* Main form content - Only render if modal is not shown, to ensure focus on modal when it's open */}
//       {!showPreSubmissionModal && (
//         <ScrollView contentContainerStyle={styles.scrollViewContent}>
//           {/* Section: Select Products */}
//           <View style={styles.sectionCard}>
//             <Text style={styles.cardTitle}>Select Products to Recycle</Text>
//             {availableProducts.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Ionicons name="cube-outline" size={50} color={COLORS.darkGray} />
//                 <Text style={styles.emptyStateText}>No available products for recycling.</Text>
//                 <Text style={styles.emptyStateSubText}>List new products in your profile to recycle them.</Text>
//               </View>
//             ) : (
//               // Map through available products and render each as a selectable item
//               availableProducts.map(product => {
//                 const isSelected = selectedProductIds.includes(product._id);
//                 const productValue = getProductValue(product);
//                 return (
//                   <TouchableOpacity
//                     key={product._id}
//                     style={[styles.productItem, isSelected && styles.productItemSelected]}
//                     onPress={() => toggleProductSelection(product._id, productValue)}
//                   >
//                     {product.images && product.images.length > 0 && (
//                       <Image source={product.images[0]} style={styles.productImage} contentFit="cover" />
//                     )}
//                     <View style={styles.productInfo}>
//                       <Text style={styles.productModel}>{product.model}</Text>
//                       <Text style={styles.productBrandCategory}>{product.brand.join(', ')} - {product.categoryId}</Text>
//                       <Text style={styles.productValue}>Est. Value: ₹{productValue}</Text>
//                     </View>
//                     <Ionicons
//                       name={isSelected ? 'checkbox-outline' : 'square-outline'}
//                       size={24}
//                       color={isSelected ? COLORS.primary : COLORS.gray}
//                     />
//                   </TouchableOpacity>
//                 );
//               })
//             )}
//           </View>

//           {/* Section: Collection Details */}
//           <View style={styles.sectionCard}>
//             <Text style={styles.cardTitle}>Collection Details</Text>

//             <Text style={styles.label}>Requested Collection Date:</Text>
//             <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
//               <Text style={styles.datePickerButtonText}>
//                 {format(collectionDate, 'MMM dd,PPPP')}
//               </Text>
//               <Ionicons name="calendar-outline" size={20} color={COLORS.darkGray} />
//             </TouchableOpacity>
//             {showDatePicker && (
//               <DateTimePicker
//                 testID="datePicker"
//                 value={collectionDate}
//                 mode="date"
//                 display="default"
//                 onChange={onChangeDate}
//                 minimumDate={new Date()} // Prevent selecting past dates
//               />
//             )}

//             <Text style={styles.label}>Preferred Time Slot:</Text>
//             <View style={styles.timeSlotContainer}>
//               {/* Radio buttons for time slot selection */}
//               {['morning', 'afternoon', 'evening'].map(slot => (
//                 <TouchableOpacity
//                   key={slot}
//                   style={[styles.timeSlotButton, timeSlot === slot && styles.timeSlotButtonSelected]}
//                   onPress={() => setTimeSlot(slot)}
//                 >
//                   <Text style={[styles.timeSlotButtonText, timeSlot === slot && styles.timeSlotButtonTextSelected]}>
//                     {slot.charAt(0).toUpperCase() + slot.slice(1)} {/* Capitalize first letter */}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           {/* Section: Payment Summary */}
//           <View style={styles.sectionCard}>
//             <Text style={styles.cardTitle}>Payment Summary</Text>
//             <View style={styles.paymentRow}>
//               <Text style={styles.paymentLabel}>Estimated Payment:</Text>
//               <Text style={styles.paymentValue}>₹{paymentAmount.toFixed(2)}</Text>
//             </View>
//             <Text style={styles.infoText}>This is an estimated payment. Final amount will be confirmed during collection.</Text>
//           </View>

//           {/* Submit Button */}
//           <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loadingSubmission}>
//             {loadingSubmission ? (
//               <ActivityIndicator color={COLORS.white} /> // Show loading spinner when submitting
//             ) : (
//               <>
//                 <Text style={styles.submitButtonText}>Submit Recycling Request</Text>
//                 <Ionicons name="arrow-forward-circle-outline" size={24} color={COLORS.white} style={styles.submitButtonIcon} />
//               </>
//             )}
//           </TouchableOpacity>
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.lightGray,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: COLORS.brand,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   backButton: {
//     marginRight: 10,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: COLORS.darkGray,
//   },
//   scrollViewContent: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//     paddingBottom: 40,
//   },
//   sectionCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 20,
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.lightGray,
//     paddingBottom: 5,
//   },
//   // Product Selection Styles
//   productItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.background,
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 1,
//     elevation: 1,
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   productItemSelected: {
//     borderColor: COLORS.primary,
//     backgroundColor: COLORS.primaryLight,
//   },
//   productImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   productInfo: {
//     flex: 1,
//   },
//   productModel: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   productBrandCategory: {
//     fontSize: 13,
//     color: COLORS.darkGray,
//     marginTop: 2,
//   },
//   productValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.green,
//     marginTop: 5,
//   },
//   emptyState: {
//     alignItems: 'center',
//     paddingVertical: 30,
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: COLORS.darkGray,
//     marginTop: 10,
//     textAlign: 'center',
//   },
//   emptyStateSubText: {
//     fontSize: 13,
//     color: COLORS.gray,
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   // Collection Details Styles
//   label: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: COLORS.text,
//     marginBottom: 8,
//   },
//   datePickerButton: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.lightGray,
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     backgroundColor: COLORS.background,
//   },
//   datePickerButtonText: {
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   timeSlotContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 15,
//   },
//   timeSlotButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: COLORS.gray,
//   },
//   timeSlotButtonSelected: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   timeSlotButtonText: {
//     color: COLORS.text,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   timeSlotButtonTextSelected: {
//     color: COLORS.white,
//   },
//   // Payment Summary Styles
//   paymentRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   paymentLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   paymentValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.green,
//   },
//   infoText: {
//     fontSize: 12,
//     color: COLORS.darkGray,
//     fontStyle: 'italic',
//     textAlign: 'center',
//   },
//   // Submit Button
//   submitButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: 15,
//     borderRadius: 10,
//     marginTop: 20,
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 6,
//   },
//   submitButtonText: {
//     color: COLORS.white,
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginRight: 10,
//   },
//   submitButtonIcon: {
//     marginLeft: 5,
//   },
//   // Modal styles
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay
//   },
//   modalContent: {
//     backgroundColor: COLORS.white,
//     borderRadius: 15,
//     padding: 25,
//     width: '90%', // Wider modal
//     maxHeight: '80%', // Limit height
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 12,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: COLORS.darkGray,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   modalScrollView: {
//     maxHeight: '70%', // Adjust max height for scrollable content
//     marginBottom: 15,
//   },
//   modalUserInfoText: {
//     fontSize: 16,
//     color: COLORS.text,
//     marginBottom: 10,
//     fontWeight: 'bold',
//   },
//   modalAddressText: {
//     fontSize: 14,
//     color: COLORS.darkGray,
//     marginBottom: 10,
//     lineHeight: 20,
//   },
//   inputGroup: {
//     marginBottom: 10, // Added for better spacing between input sections
//   },
//   radioGroup: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start', // Align to start for radio buttons
//     marginBottom: 15,
//     paddingLeft: 5, // Small padding for radios
//   },
//   radioButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 20,
//     paddingVertical: 5,
//   },
//   radioLabel: {
//     marginLeft: 8,
//     fontSize: 15,
//     color: COLORS.text,
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: COLORS.lightGray,
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     color: COLORS.text,
//     backgroundColor: COLORS.background,
//     marginBottom: 5, // Keep small margin, inputGroup has more
//   },
//   multilineInput: {
//     minHeight: 80, // Slightly smaller for notes, adjust as needed
//   },
//   modalConfirmButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 10,
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 6,
//   },
//   modalButtonText: {
//     color: COLORS.white,
//     fontSize: 17,
//     fontWeight: 'bold',
//   },
//   noAddressWarning: {
//     fontSize: 14,
//     color: COLORS.error,
//     textAlign: 'center',
//     marginTop: 10,
//   }
// });













import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Modal, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-expo';
import { api } from '@/convex/_generated/api';
import { COLORS } from '@/constants/theme';
import { Doc, Id } from '@/convex/_generated/dataModel';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Image } from 'expo-image';

interface Address {
  street: string;
  city: string;
  state: string; // NEW: Required State field
  landmark?: string;
  pincode: number; // Required number
}

// Updated interface to reflect the new data structure (addresses are now nested under userAddress)
interface UserAddressDoc extends Doc<"userAddresses"> {
  homeAddress: Address;
  officeAddress?: Address;
}

interface AvailableProduct extends Doc<"products"> {
  brand: string[];
  categoryId: string;
  model: string;
  images?: string[];
  quantity: string;
  os: string[];
}

// User data relevant to pickup details - UPDATED to include the nested userAddress
interface CurrentUserForPickup extends Doc<"users"> {
  username: string;
  image: string;
  phoneNumber?: string;
  userAddress: UserAddressDoc | null; // Now includes the entire userAddress document, or null if not found
}


export default function SubmitRecyclingRequestScreen() {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();

  const [selectedProductIds, setSelectedProductIds] = useState<Id<"products">[]>([]);
  const [collectionDate, setCollectionDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string>('morning');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  const [showPreSubmissionModal, setShowPreSubmissionModal] = useState(false);
  const [confirmedAddressType, setConfirmedAddressType] = useState<"home" | "office" | undefined>(undefined);
  const [alternativePhoneNumber, setAlternativePhoneNumber] = useState<string>('');
  const [pickupNotes, setPickupNotes] = useState<string>('');
  
  const [isPickupDetailsConfirmed, setIsPickupDetailsConfirmed] = useState(false);


  const currentUser = useQuery(
    api.users.getUserByClerkId, // This query now returns user with nested userAddress
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  ) as CurrentUserForPickup | undefined; // Cast to new interface

  const availableProducts = useQuery(
    api.products.getAvailableProductsForUser,
    currentUser?._id ? undefined : "skip"
  );

  const createRecyclingRequest = useMutation(api.recyclingRequests.createRecyclingRequest);

  useEffect(() => {
    if (currentUser && currentUser.userAddress) {
      // Initialize address type based on the presence of home/office addresses
      if (currentUser.userAddress.homeAddress) {
        setConfirmedAddressType('home');
      } else if (currentUser.userAddress.officeAddress) {
        setConfirmedAddressType('office');
      }
      setAlternativePhoneNumber(currentUser.phoneNumber || ''); // Still use user's primary phone
    }
  }, [currentUser]);


  const toggleProductSelection = (productId: Id<"products">, priceValue: number) => {
    setSelectedProductIds(prev => {
      const isSelected = prev.includes(productId);
      let newSelectedIds;

      if (isSelected) {
        newSelectedIds = prev.filter(id => id !== productId);
        setPaymentAmount(prevAmount => prevAmount - priceValue);
      } else {
        newSelectedIds = [...prev, productId];
        setPaymentAmount(prevAmount => prevAmount + priceValue);
        if (prev.length === 0 && !isPickupDetailsConfirmed) {
          setShowPreSubmissionModal(true);
        }
      }
      return newSelectedIds;
    });
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || collectionDate;
    setShowDatePicker(Platform.OS === 'ios');
    setCollectionDate(currentDate);
  };

  const getProductValue = (product: AvailableProduct): number => {
    switch (product.categoryId) {
      case 'Smartphone': return 500;
      case 'Laptop': return 1000;
      case 'Tablet': return 300;
      default: return 100;
    }
  };

  const handleConfirmPickupDetails = () => {
    // Ensure currentUser and its userAddress exist
    if (!currentUser || !currentUser.userAddress) {
        Alert.alert('Profile Error', 'User address details are not loaded. Please ensure your profile has addresses set up.');
        return;
    }

    // Validate that an address type has been selected.
    if (confirmedAddressType === undefined) {
      Alert.alert('Selection Required', 'Please confirm whether the pickup address is Home or Office.');
      return;
    }
    // Check if the selected address type actually has data
    if (confirmedAddressType === 'home' && !currentUser.userAddress.homeAddress) {
        Alert.alert('Address Missing', 'Your home address is not set in your profile. Please update your profile or select office address.');
        return;
    }
    if (confirmedAddressType === 'office' && !currentUser.userAddress.officeAddress) {
        Alert.alert('Address Missing', 'Your office address is not set in your profile. Please update your profile or select home address.');
        return;
    }

    setShowPreSubmissionModal(false);
    setIsPickupDetailsConfirmed(true);
  };


  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
    if (selectedProductIds.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one product for recycling.');
      return;
    }

    if (!isPickupDetailsConfirmed) {
      Alert.alert(
        'Pickup Details Required',
        'Please select and confirm your pickup address details to proceed.'
      );
      setShowPreSubmissionModal(true);
      return;
    }

    if (!collectionDate) {
      Alert.alert('Validation Error', 'Please select a collection date.');
      return;
    }

    const requestedCollectionDateTimestamp = collectionDate.getTime();

    setLoadingSubmission(true);
    try {
      const requestId = await createRecyclingRequest({
        userId: currentUser._id,
        productIds: selectedProductIds,
        requestedCollectionDate: requestedCollectionDateTimestamp,
        requestedCollectionTimeSlot: timeSlot,
        paymentAmount: paymentAmount,
        pickupAddressType: confirmedAddressType,
        alternativePhoneNumber: alternativePhoneNumber || undefined,
        pickupNotes: pickupNotes || undefined,
      });
      Alert.alert('Success', `Recycling request submitted! Request ID: ${requestId.slice(-6).toUpperCase()}`);
      router.back();
    } catch (error: any) {
      console.error("Error submitting recycling request:", error);
      Alert.alert('Error', error.message || 'Failed to submit recycling request.');
    } finally {
      setLoadingSubmission(false);
    }
  };

  if (currentUser === undefined || availableProducts === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading products and user data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderPreSubmissionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPreSubmissionModal}
      onRequestClose={() => {
        Alert.alert(
          "Cancel Request Setup",
          "Are you sure you want to cancel setting up this request? Your selected products will be deselected.",
          [
            { text: "No", style: "cancel" },
            {
              text: "Yes, Cancel",
              onPress: () => {
                setShowPreSubmissionModal(false);
                setSelectedProductIds([]);
                setPaymentAmount(0);
                setIsPickupDetailsConfirmed(false);
                setConfirmedAddressType(undefined);
                setAlternativePhoneNumber('');
                setPickupNotes('');
                router.back();
              }
            }
          ]
        );
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Pickup Details</Text>
          <Text style={styles.modalSubtitle}>Please confirm your pickup address and provide any additional details for the agent.</Text>

          {currentUser ? (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Username:</Text>
                <Text style={styles.modalUserInfoText}>{currentUser.username}</Text>
              </View>
              
              {/* Conditional rendering for user address information */}
              {currentUser.userAddress ? (
                <>
                  {/* Display Home Address with Landmark, City, State, and PinCode */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Home Address:</Text>
                    <Text style={styles.modalAddressText}>
                      {currentUser.userAddress.homeAddress ? (
                        <>
                          {currentUser.userAddress.homeAddress.street}, {currentUser.userAddress.homeAddress.city}, {currentUser.userAddress.homeAddress.state}
                          {currentUser.userAddress.homeAddress.landmark ? `, ${currentUser.userAddress.homeAddress.landmark}` : ''}
                          {` - ${currentUser.userAddress.homeAddress.pincode}`}
                        </>
                      ) : 'Not Provided'}
                    </Text>
                  </View>

                  {/* Display Office Address with Landmark, City, State, and PinCode */}
                  {currentUser.userAddress.officeAddress ? (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Office Address:</Text>
                      <Text style={styles.modalAddressText}>
                        {currentUser.userAddress.officeAddress.street}, {currentUser.userAddress.officeAddress.city}, {currentUser.userAddress.officeAddress.state}
                        {currentUser.userAddress.officeAddress.landmark ? `, ${currentUser.userAddress.officeAddress.landmark}` : ''}
                        {` - ${currentUser.userAddress.officeAddress.pincode}`}
                      </Text>
                    </View>
                  ) : null}

                  <Text style={styles.label}>Select Pickup Address Type:</Text>
                  <View style={styles.radioGroup}>
                    {currentUser.userAddress.homeAddress && (
                      <TouchableOpacity
                        style={styles.radioButton}
                        onPress={() => setConfirmedAddressType('home')}
                        disabled={!currentUser.userAddress.homeAddress}
                      >
                        <Ionicons
                          name={confirmedAddressType === 'home' ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={COLORS.primary}
                        />
                        <Text style={styles.radioLabel}>Home</Text>
                      </TouchableOpacity>
                    )}
                    {currentUser.userAddress.officeAddress && (
                      <TouchableOpacity
                        style={styles.radioButton}
                        onPress={() => setConfirmedAddressType('office')}
                        disabled={!currentUser.userAddress.officeAddress}
                      >
                        <Ionicons
                          name={confirmedAddressType === 'office' ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={COLORS.primary}
                        />
                        <Text style={styles.radioLabel}>Office</Text>
                      </TouchableOpacity>
                    )}
                    {!currentUser.userAddress.homeAddress && !currentUser.userAddress.officeAddress && (
                      <Text style={styles.noAddressWarning}>
                        Please update your profile with at least one address to proceed.
                      </Text>
                    )}
                  </View>
                </>
              ) : (
                <Text style={styles.noAddressWarning}>
                    No address information found. Please add an address to your profile to proceed with a pickup request.
                </Text>
              )}


              <View style={styles.inputGroup}>
                <Text style={styles.label}>Alternative Phone Number (Optional):</Text>
                <TextInput
                  style={styles.textInput}
                  value={alternativePhoneNumber}
                  onChangeText={setAlternativePhoneNumber}
                  placeholder="e.g., +91 9876543210"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pickup Notes / Instructions (Optional):</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={pickupNotes}
                  onChangeText={setPickupNotes}
                  placeholder="e.g., 'Ring bell twice', 'Flat 3B near elevator'"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.loadingText}>Loading user profile...</Text>
          )}

          <TouchableOpacity
            style={styles.modalConfirmButton}
            onPress={handleConfirmPickupDetails}
            disabled={
                confirmedAddressType === undefined || !currentUser ||
                (!currentUser.userAddress?.homeAddress && !currentUser.userAddress?.officeAddress)
            }
          >
            <Text style={styles.modalButtonText}>Confirm Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Recycling Request</Text>
      </View>

      {showPreSubmissionModal && renderPreSubmissionModal()}

      {!showPreSubmissionModal && (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.sectionCard}>
            <Text style={styles.cardTitle}>Select Products to Recycle</Text>
            {availableProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={50} color={COLORS.darkGray} />
                <Text style={styles.emptyStateText}>No available products for recycling.</Text>
                <Text style={styles.emptyStateSubText}>List new products in your profile to recycle them.</Text>
              </View>
            ) : (
              availableProducts.map(product => {
                const isSelected = selectedProductIds.includes(product._id);
                const productValue = getProductValue(product);
                return (
                  <TouchableOpacity
                    key={product._id}
                    style={[styles.productItem, isSelected && styles.productItemSelected]}
                    onPress={() => toggleProductSelection(product._id, productValue)}
                  >
                    {product.images && product.images.length > 0 && (
                      <Image source={product.images[0]} style={styles.productImage} contentFit="cover" />
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productModel}>{product.model}</Text>
                      <Text style={styles.productBrandCategory}>{product.brand.join(', ')} - {product.categoryId}</Text>
                      <Text style={styles.productValue}>Est. Value: ₹{productValue}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkbox-outline' : 'square-outline'}
                      size={24}
                      color={isSelected ? COLORS.primary : COLORS.gray}
                    />
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.cardTitle}>Collection Details</Text>

            <Text style={styles.label}>Requested Collection Date:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>
                {format(collectionDate, 'MMM dd,PPPP')}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="datePicker"
                value={collectionDate}
                mode="date"
                display="default"
                onChange={onChangeDate}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Preferred Time Slot:</Text>
            <View style={styles.timeSlotContainer}>
              {['morning', 'afternoon', 'evening'].map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeSlotButton, timeSlot === slot && styles.timeSlotButtonSelected]}
                  onPress={() => setTimeSlot(slot)}
                >
                  <Text style={[styles.timeSlotButtonText, timeSlot === slot && styles.timeSlotButtonTextSelected]}>
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.cardTitle}>Payment Summary</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Estimated Payment:</Text>
              <Text style={styles.paymentValue}>₹{paymentAmount.toFixed(2)}</Text>
            </View>
            <Text style={styles.infoText}>This is an estimated payment. Final amount will be confirmed during collection.</Text>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loadingSubmission}>
            {loadingSubmission ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Recycling Request</Text>
                <Ionicons name="arrow-forward-circle-outline" size={24} color={COLORS.white} style={styles.submitButtonIcon} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  productItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.black,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productModel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  productBrandCategory: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  productValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green,
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 5,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: COLORS.background,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  timeSlotButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  timeSlotButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  timeSlotButtonTextSelected: {
    color: COLORS.white,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paymentValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  submitButtonIcon: {
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
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
  modalScrollView: {
    maxHeight: '70%',
    marginBottom: 15,
  },
  modalUserInfoText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  modalAddressText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 10,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 15,
    paddingLeft: 5,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 5,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
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
    marginBottom: 5,
  },
  multilineInput: {
    minHeight: 80,
  },
  modalConfirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  noAddressWarning: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 10,
  }
});