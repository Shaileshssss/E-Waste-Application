// import React, { useMemo, useState, useEffect } from 'react';
// import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
// import { Stack, useRouter, useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
// import { Ionicons } from '@expo/vector-icons';

// import { api } from "@/convex/_generated/api"; // This already includes api.mailer
// import { useAuth } from "@clerk/clerk-expo";
// import { useQuery, useMutation, useAction } from "convex/react";
// import { COLORS } from "@/constants/theme";
// import { Id } from "@/convex/_generated/dataModel"; 

// interface CartItemFromConvex {
//   productId: string;
//   quantity: number;
//   productType: "brand" | "refurbished";
//   productDetails: {
//     _id: string;
//     _creationTime: number;
//     name: string;
//     description: string;
//     imageUrl: string;
//     discountPrice: number;
//     originalPrice: number;
//     rating: number;
//     review: number;
//     category: string;
//     delivery: number;
//     brand?: string;
//     galleryImages?: string[];
//     warranty?: number;
//     productType: "brand" | "refurbished";
//   } | null;
// }

// const GST_RATE = 0.18;
// const DELIVERY_CHARGE = 40.00;

// const VALID_COUPONS: { [key: string]: number } = {
//   "SAVE100": 100,
//   "FLAT50": 50,
//   "EWasteLOVE": 200,
// };

// export default function CheckoutScreen() {
//   const router = useRouter();
//   const { userId: clerkUserId } = useAuth();
//   const { selectedIds } = useLocalSearchParams();
//   console.log("CheckoutScreen: Raw selectedIds from params:", selectedIds);

//   const selectedProductIds: Set<string> = useMemo(() => {
//     if (typeof selectedIds === 'string' && selectedIds.length > 0) {
//       return new Set(selectedIds.split(','));
//     }
//     if (Array.isArray(selectedIds)) {
//         return new Set(selectedIds.flatMap(id => typeof id === 'string' ? id.split(',') : []));
//     }
//     return new Set();
//   }, [selectedIds]);

//   console.log("CheckoutScreen: Parsed selectedProductIds (Set):", Array.from(selectedProductIds));

//   const [couponCode, setCouponCode] = useState('');
//   const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);
//   const [couponError, setCouponError] = useState('');
//   const [isProcessingPayment, setIsProcessingPayment] = useState(false); // State for loading/disabled button

//   const currentUser = useQuery(
//     api.users?.getUserByClerkId,
//     clerkUserId ? { clerkId: clerkUserId } : "skip"
//   );

//   const cartItemsFromConvex: CartItemFromConvex[] | undefined = useQuery(
//     api.cart?.getCartItems,
//     currentUser?._id ? { userId: currentUser._id } : "skip"
//   );

//   const createOrderMutation = useMutation(api.orders?.createOrder);
//   // --- NEW: Mailer mutation ---
//   const sendConfirmationEmail = useAction(api.mailer?.sendConfirmationEmail); 

//   const selectedCartItems = useMemo(() => {
//     if (!cartItemsFromConvex || selectedProductIds.size === 0) {
//       return [];
//     }
//     return cartItemsFromConvex.filter(item =>
//       item.productDetails !== null && selectedProductIds.has(item.productDetails._id)
//     );
//   }, [cartItemsFromConvex, selectedProductIds]);

//   const { totalItemsCount, cartTotal, originalCartTotal, savedAmount, gstAmount, subtotalBeforeCoupon, finalPayableAmount } = useMemo(() => {
//     let currentTotalItems = 0;
//     let currentCartTotal = 0;
//     let currentOriginalCartTotal = 0;

//     console.log("CALCULATION START: selectedCartItems for calculation:", selectedCartItems);

//     if (selectedCartItems.length > 0) {
//       selectedCartItems.forEach(item => {
//         console.log(`Processing selected item: ${item.productDetails!.name}, Quantity: ${item.quantity}, Price: ${item.productDetails!.discountPrice}`);
//         currentTotalItems += item.quantity;
//         currentCartTotal += item.productDetails!.discountPrice * item.quantity;
//         currentOriginalCartTotal += item.productDetails!.originalPrice * item.quantity;
//       });
//     } else {
//         console.log("No selected cart items to calculate.");
//     }

//     const currentSavedAmount = currentOriginalCartTotal - currentCartTotal;
//     const currentGSTAmount = currentCartTotal * GST_RATE;

//     const currentDeliveryCharge = currentTotalItems > 0 ? DELIVERY_CHARGE : 0;

//     const currentSubtotalBeforeCoupon = currentCartTotal + currentGSTAmount + currentDeliveryCharge;

//     const currentFinalPayableAmount = Math.max(0, currentSubtotalBeforeCoupon - appliedCouponDiscount);

//     console.log("CALCULATION END: totalItemsCount:", currentTotalItems);
//     console.log("CALCULATION END: cartTotal (discounted):", currentCartTotal.toFixed(2));
//     console.log("CALCULATION END: originalCartTotal:", currentOriginalCartTotal.toFixed(2));
//     console.log("CALCULATION END: savedAmount (product discounts):", currentSavedAmount.toFixed(2));
//     console.log("CALCULATION END: gstAmount:", currentGSTAmount.toFixed(2));
//     console.log("CALCULATION END: deliveryCharge:", currentDeliveryCharge.toFixed(2));
//     console.log("CALCULATION END: subtotalBeforeCoupon:", currentSubtotalBeforeCoupon.toFixed(2));
//     console.log("CALCULATION END: appliedCouponDiscount:", appliedCouponDiscount.toFixed(2));
//     console.log("CALCULATION END: finalPayableAmount:", currentFinalPayableAmount.toFixed(2));

//     return {
//       totalItemsCount: currentTotalItems,
//       cartTotal: currentCartTotal,
//       originalCartTotal: currentOriginalCartTotal,
//       savedAmount: currentSavedAmount,
//       gstAmount: currentGSTAmount,
//       subtotalBeforeCoupon: currentSubtotalBeforeCoupon,
//       finalPayableAmount: currentFinalPayableAmount,
//     };
//   }, [selectedCartItems, appliedCouponDiscount]);

//   const handleApplyCoupon = () => {
//     setCouponError('');
//     const couponValue = VALID_COUPONS[couponCode.toUpperCase()];

//     if (couponCode.trim() === '') {
//       setCouponError('Please enter a coupon code.');
//       setAppliedCouponDiscount(0);
//       return;
//     }
    
//     if (selectedCartItems.length === 0) {
//         setCouponError('Please select items in your cart before applying a coupon.');
//         setAppliedCouponDiscount(0);
//         return;
//     }

//     if (couponValue !== undefined) {
//       if (couponValue >= subtotalBeforeCoupon && subtotalBeforeCoupon > 0) {
//         Alert.alert('Invalid Coupon', 'Coupon value cannot be equal to or greater than the order total (before coupon). Please ensure your selected items have enough value to apply this coupon.');
//         setAppliedCouponDiscount(0);
//         return;
//       }
//       setAppliedCouponDiscount(couponValue);
//       Alert.alert('Coupon Applied', `Coupon "${couponCode.toUpperCase()}" applied successfully! You saved ₹${couponValue.toFixed(2)}.`);
//     } else {
//       setCouponError('Invalid or expired coupon code.');
//       setAppliedCouponDiscount(0);
//     }
//   };

//   const handlePayNow = async () => {
//     // Basic validation
//     if (selectedCartItems.length === 0 || finalPayableAmount <= 0 || !currentUser?._id || !createOrderMutation || !sendConfirmationEmail) {
//       console.warn("Payment conditions not met: No items selected, final amount zero, or user/mutation/email-mutation not loaded.");
//       Alert.alert("Cannot Proceed", "No items selected for checkout or the final amount is zero. Please go back to cart and select items.");
//       return;
//     }

//     // Ensure we have current user's email and fullname for the confirmation mail
//     if (!currentUser.email || !currentUser.fullname) {
//         console.error("Current user email or fullname missing, cannot send confirmation email.");
//         Alert.alert("Error", "User profile data (email/name) is incomplete. Cannot send confirmation email.");
//         return;
//     }

//     setIsProcessingPayment(true); // Disable button and show processing
//     try {
//       // 1. Create the Order in Convex
//       const productsForOrder = selectedCartItems
//         .map(item => ({
//           productId: item.productId as Id<"RefurbishedProducts"> | Id<"brandproducts">,
//           name: item.productDetails!.name,
//           image: item.productDetails!.imageUrl,
//           discountPrice: item.productDetails!.discountPrice,
//           originalPrice: item.productDetails!.originalPrice,
//           quantity: item.quantity,
//         }));
      
//       const orderId = await createOrderMutation({ // Capture orderId if your mutation returns it
//         userId: currentUser._id,
//         products: productsForOrder,
//         totalAmount: finalPayableAmount,
//         savedAmount: (savedAmount + appliedCouponDiscount),
//         orderDate: Date.now(),
//         status: 'completed',
//       });
//       console.log("Order created successfully in Convex. Order ID:", orderId);

//       // 2. Send Confirmation Email via Convex mutation -> Node.js backend
//       try {
//         console.log("Attempting to send confirmation email...");
//         const emailResult = await sendConfirmationEmail({
//           recipientEmail: currentUser.email,
//           recipientName: currentUser.fullname,
//           // You can pass more details here to include in the email, e.g., orderId, amount
//           // orderId: orderId ? String(orderId) : "N/A", // Convert Id to string if necessary
//           // finalAmount: finalPayableAmount.toFixed(2),
//         });

//         if (emailResult.success) {
//           console.log("Confirmation email request sent successfully to backend.");
//           Alert.alert(
//             "Payment Successful!",
//             `Your order for ₹${finalPayableAmount.toFixed(2)} has been placed. A confirmation email has been sent to ${currentUser.email}.`,
//             [{ text: "OK", onPress: () => router.replace('/dashboard-details/order-confirmation') }]
//           );
//         } else {
//           // Order was placed, but email sending failed
//           console.error("Failed to send confirmation email:", emailResult.message);
//           Alert.alert(
//             "Payment Successful, But Email Failed",
//             `Your order for ₹${finalPayableAmount.toFixed(2)} has been placed, but we could not send the confirmation email: ${emailResult.message}.`,
//             [{ text: "OK", onPress: () => router.replace('/dashboard-details/order-confirmation') }]
//           );
//         }
//       } catch (emailError: any) {
//         // This catches errors if the Convex mutation to send email itself fails
//         console.error("Error calling Convex email mutation:", emailError);
//         Alert.alert(
//           "Payment Successful, But Email Error",
//           `Your order for ₹${finalPayableAmount.toFixed(2)} has been placed, but there was an error with email service: ${emailError.message}.`,
//           [{ text: "OK", onPress: () => router.replace('/dashboard-details/order-confirmation') }]
//         );
//       }

//     } catch (paymentError: any) {
//       console.error("Payment or order creation failed:", paymentError);
//       Alert.alert("Payment Failed", `There was an error processing your payment: ${paymentError.message}. Please try again.`);
//     } finally {
//       setIsProcessingPayment(false); // Re-enable button
//     }
//   };

//   if (cartItemsFromConvex === undefined || currentUser === undefined) {
//     console.log("Loading state active: cartItemsFromConvex or currentUser is undefined.");
//     return (
//       <SafeAreaView style={styles.container}>
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             paddingHorizontal: 16,
//             paddingVertical: 12,
//             backgroundColor: COLORS.brand,
//             borderBottomWidth: 1,
//             borderBottomColor: "#ccc",
//           }}
//         >
//           <TouchableOpacity onPress={() => router.back()}>
//             <Ionicons name="arrow-back" size={22} color={COLORS.text} />
//           </TouchableOpacity>
//           <Text
//             style={{
//               fontSize: 20,
//               fontWeight: "600",
//               marginLeft: 12,
//               color: COLORS.text,
//             }}
//           >
//             Checkout
//           </Text>
//         </View>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loadingText}>Loading cart summary...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (selectedCartItems.length === 0) {
//     console.log("Empty cart or no items selected for checkout.");
//     return (
//       <SafeAreaView style={styles.container}>
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             paddingHorizontal: 16,
//             paddingVertical: 12,
//             backgroundColor: COLORS.brand,
//             borderBottomWidth: 1,
//             borderBottomColor: "#ccc",
//           }}
//         >
//           <TouchableOpacity onPress={() => router.back()}>
//             <Ionicons name="arrow-back" size={22} color={COLORS.text} />
//           </TouchableOpacity>
          
//           <Text
//             style={{
//               fontSize: 20,
//               fontWeight: "600",
//               marginLeft: 12,
//               color: COLORS.text,
//             }}
//           >
//             Checkout
//           </Text>
//         </View>
//         <View style={styles.loadingContainer}>
//           <Text style={styles.loadingText}>No items selected for checkout. Please select items in your cart.</Text>
//           <TouchableOpacity
//             onPress={() => router.push('/dashboard-details/cart-screen')}
//             style={[styles.continueShoppingButton, {marginTop: 20}]}
//           >
//             <Text style={styles.continueShoppingButtonText}>Go to Cart</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           paddingHorizontal: 16,
//           paddingVertical: 12,
//           backgroundColor: COLORS.brand,
//           borderBottomWidth: 1,
//           borderBottomColor: "#ccc",
//         }}
//       >
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={22} color={COLORS.text} />
//         </TouchableOpacity>
        
//         <Text
//           style={{
//             fontSize: 20,
//             fontWeight: "600",
//             marginLeft: 12,
//             color: COLORS.text,
//           }}
//         >
//           Checkout
//         </Text>
//       </View>
//       <ScrollView contentContainerStyle={styles.scrollViewContent}>
//         <View style={styles.content}>
//           <Ionicons name="checkmark-circle-outline" size={80} color={COLORS.primary} />
//           <Text style={styles.title}>Proceeding to Checkout!</Text>
//           <Text style={styles.subtitle}>Review your order details below.</Text>

//           <View style={styles.couponContainer}>
//             <TextInput
//               style={styles.couponInput}
//               placeholder="Enter coupon code"
//               placeholderTextColor={COLORS.darkGray}
//               value={couponCode}
//               onChangeText={setCouponCode}
//               autoCapitalize="characters"
//             />
//             <TouchableOpacity style={styles.applyCouponButton} onPress={handleApplyCoupon}>
//               <Text style={styles.applyCouponButtonText}>Apply</Text>
//             </TouchableOpacity>
//           </View>
//           {couponError ? <Text style={styles.couponErrorText}>{couponError}</Text> : null}

//           <View style={styles.summaryDetailsContainer}>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Total Items:</Text>
//               <Text style={styles.summaryValue}>
//                 {String(totalItemsCount)}
//               </Text>
//             </View>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Cart Value:</Text>
//               <Text style={styles.summaryValue}>
//                 ₹{String(cartTotal.toFixed(2))}
//               </Text>
//             </View>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>GST (18%):</Text>
//               <Text style={styles.summaryValue}>
//                 ₹{String(gstAmount.toFixed(2))}
//               </Text>
//             </View>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Delivery Charge:</Text>
//               <Text style={styles.summaryValue}>
//                 ₹{String(DELIVERY_CHARGE.toFixed(2))}
//               </Text>
//             </View>
//             {appliedCouponDiscount > 0 && (
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>Coupon Discount:</Text>
//                 <Text style={styles.summaryValueDiscount}>
//                   - ₹{String(appliedCouponDiscount.toFixed(2))}
//                 </Text>
//               </View>
//             )}
//             <View style={styles.totalBreakdownRow}>
//               <Text style={styles.totalBreakdownLabel}>Total Payable Amount:</Text>
//               <Text style={styles.totalBreakdownValue}>
//                 ₹{String(finalPayableAmount.toFixed(2))}
//               </Text>
//             </View>
//           </View>

//           <TouchableOpacity
//             onPress={handlePayNow}
//             style={[styles.payNowButton, (finalPayableAmount === 0 || totalItemsCount === 0 || isProcessingPayment) ? styles.payNowButtonDisabled : {}]}
//             disabled={finalPayableAmount === 0 || totalItemsCount === 0 || isProcessingPayment} // --- Disabled when processing ---
//           >
//             <Text style={styles.payNowButtonText}>
//               {isProcessingPayment ? "Processing..." : `Pay Now ₹${String(finalPayableAmount.toFixed(2))}`}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => router.push('/')}
//             style={styles.continueShoppingButton}
//           >
//             <Text style={styles.continueShoppingButtonText}>Continue Shopping</Text>
//           </TouchableOpacity>

//           {savedAmount > 0.01 && (
//             <Text style={styles.savedAmountText}>
//               You saved ₹{String(savedAmount.toFixed(2))} on product discounts!
//             </Text>
//           )}
//           {appliedCouponDiscount > 0 && (
//             <Text style={styles.savedAmountText}>
//               You also saved ₹{String(appliedCouponDiscount.toFixed(2))} with coupon!
//             </Text>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.lightGray,
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
//     flexGrow: 1,
//     justifyContent: 'center',
//     paddingBottom: 20,
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: COLORS.text,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: COLORS.darkGray,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   couponContainer: {
//     flexDirection: 'row',
//     width: '100%',
//     marginBottom: 10,
//     backgroundColor: COLORS.white,
//     borderRadius: 8,
//     overflow: 'hidden',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   couponInput: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     fontSize: 16,
//     color: COLORS.text,
//   },
//   applyCouponButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderTopRightRadius: 8,
//     borderBottomRightRadius: 8,
//   },
//   applyCouponButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   couponErrorText: {
//     color: COLORS.red,
//     fontSize: 13,
//     marginBottom: 10,
//     textAlign: 'center',
//     width: '100%',
//   },
//   summaryDetailsContainer: {
//     width: '100%',
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     fontSize: 16,
//     color: COLORS.darkGray,
//   },
//   summaryValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   summaryValueDiscount: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: COLORS.red,
//   },
//   totalBreakdownRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 15,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.lightGray,
//   },
//   totalBreakdownLabel: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.text,
//   },
//   totalBreakdownValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//   },
//   payNowButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     paddingHorizontal: 25,
//     borderRadius: 8,
//     marginTop: 10,
//     marginBottom: 15,
//     width: '100%',
//     alignItems: 'center',
//   },
//   payNowButtonDisabled: {
//     opacity: 0.6,
//     backgroundColor: COLORS.darkGray,
//   },
//   payNowButtonText: {
//     color: COLORS.white,
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   continueShoppingButton: {
//     backgroundColor: COLORS.darkGray,
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 8,
//     marginTop: 10,
//     width: '100%',
//     alignItems: 'center',
//   },
//   continueShoppingButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   savedAmountText: {
//     marginTop: 15,
//     fontSize: 15,
//     fontWeight: '600',
//     color: COLORS.primary,
//     textAlign: 'center',
//     width: '100%',
//   },
// });
















// src/screens/CheckoutScreen.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation, useAction } from "convex/react";
import { COLORS } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel"; 

interface CartItemFromConvex {
  productId: string;
  quantity: number;
  productType: "brand" | "refurbished";
  productDetails: {
    _id: string;
    _creationTime: number;
    name: string;
    description: string;
    imageUrl: string;
    discountPrice: number;
    originalPrice: number;
    rating: number;
    review: number;
    category: string;
    delivery: number;
    brand?: string;
    galleryImages?: string[];
    warranty?: number;
    productType: "brand" | "refurbished";
  } | null;
}

// Define the structure for purchase items passed to the email action
interface PurchaseItemForEmail {
  id: string; // Product ID
  name: string; // Product Name
  price: number; // Price per item (after discount if applicable)
  quantity: number; // Quantity purchased
}

const GST_RATE = 0.18;
const DELIVERY_CHARGE = 40.00;

const VALID_COUPONS: { [key: string]: number } = {
  "SAVE100": 100,
  "FLAT50": 50,
  "EWasteLOVE": 200,
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();
  const { selectedIds } = useLocalSearchParams();
  console.log("CheckoutScreen: Raw selectedIds from params:", selectedIds);

  const selectedProductIds: Set<string> = useMemo(() => {
    if (typeof selectedIds === 'string' && selectedIds.length > 0) {
      return new Set(selectedIds.split(','));
    }
    if (Array.isArray(selectedIds)) {
        return new Set(selectedIds.flatMap(id => typeof id === 'string' ? id.split(',') : []));
    }
    return new Set();
  }, [selectedIds]);

  console.log("CheckoutScreen: Parsed selectedProductIds (Set):", Array.from(selectedProductIds));

  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // State for loading/disabled button

  const currentUser = useQuery(
    api.users?.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  const cartItemsFromConvex: CartItemFromConvex[] | undefined = useQuery(
    api.cart?.getCartItems,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const createOrderMutation = useMutation(api.orders?.createOrder);
  const sendConfirmationEmail = useAction(api.mailer?.sendConfirmationEmail); 

  const selectedCartItems = useMemo(() => {
    if (!cartItemsFromConvex || selectedProductIds.size === 0) {
      return [];
    }
    return cartItemsFromConvex.filter(item =>
      item.productDetails !== null && selectedProductIds.has(item.productDetails._id)
    );
  }, [cartItemsFromConvex, selectedProductIds]);

  const { totalItemsCount, cartTotal, originalCartTotal, savedAmount, gstAmount, subtotalBeforeCoupon, finalPayableAmount } = useMemo(() => {
    let currentTotalItems = 0;
    let currentCartTotal = 0;
    let currentOriginalCartTotal = 0;

    console.log("CALCULATION START: selectedCartItems for calculation:", selectedCartItems);

    if (selectedCartItems.length > 0) {
      selectedCartItems.forEach(item => {
        console.log(`Processing selected item: ${item.productDetails!.name}, Quantity: ${item.quantity}, Price: ${item.productDetails!.discountPrice}`);
        currentTotalItems += item.quantity;
        currentCartTotal += item.productDetails!.discountPrice * item.quantity;
        currentOriginalCartTotal += item.productDetails!.originalPrice * item.quantity;
      });
    } else {
        console.log("No selected cart items to calculate.");
    }

    const currentSavedAmount = currentOriginalCartTotal - currentCartTotal;
    const currentGSTAmount = currentCartTotal * GST_RATE;

    const currentDeliveryCharge = currentTotalItems > 0 ? DELIVERY_CHARGE : 0;

    const currentSubtotalBeforeCoupon = currentCartTotal + currentGSTAmount + currentDeliveryCharge;

    const currentFinalPayableAmount = Math.max(0, currentSubtotalBeforeCoupon - appliedCouponDiscount);

    console.log("CALCULATION END: totalItemsCount:", currentTotalItems);
    console.log("CALCULATION END: cartTotal (discounted):", currentCartTotal.toFixed(2));
    console.log("CALCULATION END: originalCartTotal:", currentOriginalCartTotal.toFixed(2));
    console.log("CALCULATION END: savedAmount (product discounts):", currentSavedAmount.toFixed(2));
    console.log("CALCULATION END: gstAmount:", currentGSTAmount.toFixed(2));
    console.log("CALCULATION END: deliveryCharge:", currentDeliveryCharge.toFixed(2));
    console.log("CALCULATION END: subtotalBeforeCoupon:", currentSubtotalBeforeCoupon.toFixed(2));
    console.log("CALCULATION END: appliedCouponDiscount:", appliedCouponDiscount.toFixed(2));
    console.log("CALCULATION END: finalPayableAmount:", currentFinalPayableAmount.toFixed(2));

    return {
      totalItemsCount: currentTotalItems,
      cartTotal: currentCartTotal,
      originalCartTotal: currentOriginalCartTotal,
      savedAmount: currentSavedAmount,
      gstAmount: currentGSTAmount,
      subtotalBeforeCoupon: currentSubtotalBeforeCoupon,
      finalPayableAmount: currentFinalPayableAmount,
    };
  }, [selectedCartItems, appliedCouponDiscount]);

  const handleApplyCoupon = () => {
    setCouponError('');
    const couponValue = VALID_COUPONS[couponCode.toUpperCase()];

    if (couponCode.trim() === '') {
      setCouponError('Please enter a coupon code.');
      setAppliedCouponDiscount(0);
      return;
    }
    
    if (selectedCartItems.length === 0) {
        setCouponError('Please select items in your cart before applying a coupon.');
        setAppliedCouponDiscount(0);
        return;
    }

    if (couponValue !== undefined) {
      if (couponValue >= subtotalBeforeCoupon && subtotalBeforeCoupon > 0) {
        Alert.alert('Invalid Coupon', 'Coupon value cannot be equal to or greater than the order total (before coupon). Please ensure your selected items have enough value to apply this coupon.');
        setAppliedCouponDiscount(0);
        return;
      }
      setAppliedCouponDiscount(couponValue);
      Alert.alert('Coupon Applied', `Coupon "${couponCode.toUpperCase()}" applied successfully! You saved ₹${couponValue.toFixed(2)}.`);
    } else {
      setCouponError('Invalid or expired coupon code.');
      setAppliedCouponDiscount(0);
    }
  };

  const handlePayNow = async () => {
    // Basic validation
    if (selectedCartItems.length === 0 || finalPayableAmount <= 0 || !currentUser?._id || !createOrderMutation || !sendConfirmationEmail) {
      console.warn("Payment conditions not met: No items selected, final amount zero, or user/mutation/email-mutation not loaded.");
      Alert.alert("Cannot Proceed", "No items selected for checkout or the final amount is zero. Please go back to cart and select items.");
      return;
    }

    // Ensure we have current user's email and fullname for the confirmation mail
    if (!currentUser.email || !currentUser.fullname) {
        console.error("Current user email or fullname missing, cannot send confirmation email.");
        Alert.alert("Error", "User profile data (email/name) is incomplete. Cannot send confirmation email.");
        return;
    }

    setIsProcessingPayment(true); // Disable button and show processing
    try {
      // 1. Create the Order in Convex
      const productsForOrder = selectedCartItems
        .map(item => ({
          productId: item.productId as Id<"RefurbishedProducts"> | Id<"brandproducts">,
          name: item.productDetails!.name,
          image: item.productDetails!.imageUrl,
          discountPrice: item.productDetails!.discountPrice,
          originalPrice: item.productDetails!.originalPrice,
          quantity: item.quantity,
        }));
      
      const orderId = await createOrderMutation({ // Capture orderId if your mutation returns it
        userId: currentUser._id,
        products: productsForOrder,
        totalAmount: finalPayableAmount,
        savedAmount: (savedAmount + appliedCouponDiscount),
        orderDate: Date.now(),
        status: 'completed',
      });
      console.log("Order created successfully in Convex. Order ID:", orderId);

      // 2. Send Confirmation Email via Convex action -> Node.js backend
      try {
        console.log("Attempting to send confirmation email...");

        // Prepare purchase details for the email, matching the expected structure in mailer.ts and server.js
        const purchaseDetailsForEmail: PurchaseItemForEmail[] = selectedCartItems
          .map(item => ({
            id: item.productDetails!._id, // Use productDetails._id as the item ID
            name: item.productDetails!.name,
            price: item.productDetails!.discountPrice, // Use the discounted price for the email
            quantity: item.quantity,
          }));

        const emailResult = await sendConfirmationEmail({
          recipientEmail: currentUser.email,
          recipientName: currentUser.fullname,
          purchaseDetails: purchaseDetailsForEmail,
          totalPrice: finalPayableAmount,
        });

        if (emailResult.success) {
          console.log("Confirmation email request sent successfully to backend.");
          Alert.alert(
            "Payment Successful!",
            `Your order for ₹${finalPayableAmount.toFixed(2)} has been placed. A confirmation email has been sent to ${currentUser.email}.`,
            [{ text: "OK", onPress: () => router.replace('/dashboard-details/order-confirmation') }]
          );
        } else {
          // Order was placed, but email sending failed
          console.error("Failed to send confirmation email:", emailResult.message);
          Alert.alert(
            "Payment Successful, But Email Failed",
            `Your order for ₹${finalPayableAmount.toFixed(2)} has been placed, but we could not send the confirmation email: ${emailResult.message}.`,
            [{ text: "OK", onPress: () => router.replace('/dashboard-details/order-confirmation') }]
          );
        }
      } catch (emailError: any) {
        // This catches errors if the Convex action to send email itself fails
        console.error("Error calling Convex email action:", emailError); // Changed mutation to action in log message
        Alert.alert(
          "Payment Successful, But Email Error",
          `Your order for ₹${finalPayableAmount.toFixed(2)} has been placed, but there was an error with email service: ${emailError.message}.`,
          [{ text: "OK", onPress: () => router.replace('/dashboard-details/order-confirmation') }]
        );
      }

    } catch (paymentError: any) {
      console.error("Payment or order creation failed:", paymentError);
      Alert.alert("Payment Failed", `There was an error processing your payment: ${paymentError.message}. Please try again.`);
    } finally {
      setIsProcessingPayment(false); // Re-enable button
    }
  };

  if (cartItemsFromConvex === undefined || currentUser === undefined) {
    console.log("Loading state active: cartItemsFromConvex or currentUser is undefined.");
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: COLORS.brand,
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              marginLeft: 12,
              color: COLORS.text,
            }}
          >
            Checkout
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading cart summary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedCartItems.length === 0) {
    console.log("Empty cart or no items selected for checkout.");
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: COLORS.brand,
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              marginLeft: 12,
              color: COLORS.text,
            }}
          >
            Checkout
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No items selected for checkout. Please select items in your cart.</Text>
          <TouchableOpacity
            onPress={() => router.push('/dashboard-details/cart-screen')}
            style={[styles.continueShoppingButton, {marginTop: 20}]}
          >
            <Text style={styles.continueShoppingButtonText}>Go to Cart</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.brand,
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            marginLeft: 12,
            color: COLORS.text,
          }}
        >
          Checkout
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          <Ionicons name="checkmark-circle-outline" size={80} color={COLORS.primary} />
          <Text style={styles.title}>Proceeding to Checkout!</Text>
          <Text style={styles.subtitle}>Review your order details below.</Text>

          <View style={styles.couponContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              placeholderTextColor={COLORS.darkGray}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyCouponButton} onPress={handleApplyCoupon}>
              <Text style={styles.applyCouponButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {couponError ? <Text style={styles.couponErrorText}>{couponError}</Text> : null}

          <View style={styles.summaryDetailsContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items:</Text>
              <Text style={styles.summaryValue}>
                {String(totalItemsCount)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cart Value:</Text>
              <Text style={styles.summaryValue}>
                ₹{String(cartTotal.toFixed(2))}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%):</Text>
              <Text style={styles.summaryValue}>
                ₹{String(gstAmount.toFixed(2))}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charge:</Text>
              <Text style={styles.summaryValue}>
                ₹{String(DELIVERY_CHARGE.toFixed(2))}
              </Text>
            </View>
            {appliedCouponDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Coupon Discount:</Text>
                <Text style={styles.summaryValueDiscount}>
                  - ₹{String(appliedCouponDiscount.toFixed(2))}
                </Text>
              </View>
            )}
            <View style={styles.totalBreakdownRow}>
              <Text style={styles.totalBreakdownLabel}>Total Payable Amount:</Text>
              <Text style={styles.totalBreakdownValue}>
                ₹{String(finalPayableAmount.toFixed(2))}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handlePayNow}
            style={[styles.payNowButton, (finalPayableAmount === 0 || totalItemsCount === 0 || isProcessingPayment) ? styles.payNowButtonDisabled : {}]}
            disabled={finalPayableAmount === 0 || totalItemsCount === 0 || isProcessingPayment}
          >
            <Text style={styles.payNowButtonText}>
              {isProcessingPayment ? "Processing..." : `Pay Now ₹${String(finalPayableAmount.toFixed(2))}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.continueShoppingButton}
          >
            <Text style={styles.continueShoppingButtonText}>Continue Shopping</Text>
          </TouchableOpacity>

          {savedAmount > 0.01 && (
            <Text style={styles.savedAmountText}>
              You saved ₹{String(savedAmount.toFixed(2))} on product discounts!
            </Text>
          )}
          {appliedCouponDiscount > 0 && (
            <Text style={styles.savedAmountText}>
              You also saved ₹{String(appliedCouponDiscount.toFixed(2))} with coupon!
            </Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  couponContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  couponInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  applyCouponButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  applyCouponButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  couponErrorText: {
    color: COLORS.red,
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  summaryDetailsContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryValueDiscount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.red,
  },
  totalBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalBreakdownLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalBreakdownValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  payNowButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  payNowButtonDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.darkGray,
  },
  payNowButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueShoppingButton: {
    backgroundColor: COLORS.darkGray,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  continueShoppingButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedAmountText: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    width: '100%',
  },
});