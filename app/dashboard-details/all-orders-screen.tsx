import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { COLORS } from "@/constants/theme";
import { format } from 'date-fns';

// Define the interfaces for the order and its products
interface OrderProduct {
  productId: string;
  name: string;
  image: string;
  discountPrice: number;
  originalPrice: number;
  quantity: number;
}

interface Order {
  _id: string;
  _creationTime: number;
  userId: string;
  orderDate: number;
  totalAmount: number;
  savedAmount: number;
  products: OrderProduct[];
  status: string;
}

export default function AllOrdersScreen() {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();

  // Fetch current user to get Convex _id
  const currentUser = useQuery(
    api.users?.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  // Fetch all orders for the current user
  const allOrders = useQuery(
    api.orders?.getAllOrders,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // --- Helper function to convert number to Indian words with "Only" suffix ---
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWordsLessThan100 = (num: number): string => {
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  };

  const numToWordsLessThan1000 = (num: number): string => {
    let result = '';
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred';
      num %= 100;
      if (num !== 0) result += ' ';
    }
    result += numToWordsLessThan100(num);
    return result.trim();
  };

  const convertNumberToWords = (amount: number): string => {
    if (amount === 0) return "Zero Rupees Only";

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = '';
    const lakh = 100000;
    const crore = 10000000;

    if (rupees >= crore) {
      result += numToWordsLessThan100(Math.floor(rupees / crore)) + ' Crore ';
      result += numToWordsLessThan1000(Math.floor((rupees % crore) / lakh)) + ' Lakh ';
      result += numToWordsLessThan1000(Math.floor((rupees % lakh) / 1000)) + ' Thousand ';
      result += numToWordsLessThan1000(rupees % 1000);
    } else if (rupees >= lakh) {
      result += numToWordsLessThan100(Math.floor(rupees / lakh)) + ' Lakh ';
      result += numToWordsLessThan1000(Math.floor((rupees % lakh) / 1000)) + ' Thousand ';
      result += numToWordsLessThan1000(rupees % 1000);
    } else if (rupees >= 1000) {
      result += numToWordsLessThan1000(Math.floor(rupees / 1000)) + ' Thousand ';
      result += numToWordsLessThan1000(rupees % 1000);
    } else if (rupees > 0) {
      result += numToWordsLessThan1000(rupees);
    } else {
      result = 'Zero';
    }

    result = result.trim();
    if (result) {
        result += ' Rupees';
    } else {
      result = 'Zero Rupees';
    }

    if (paise > 0) {
      result += ' and ' + numToWordsLessThan100(paise) + ' Paise';
    }

    return result.trim() + ' Only';
  };
  // --- END Helper function ---


  // Show loading indicator if data is not yet available
  if (allOrders === undefined || currentUser === undefined) {
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
              <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                marginLeft: 12,
                color: COLORS.text,
              }}
            >
              My Orders
            </Text>
          </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your order history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderOrderItem = ({ item }: { item: OrderProduct }) => (
    <View style={styles.orderItemCard}>
      <Text style={styles.orderItemNameText}>{item.name}</Text>
      <View style={styles.orderItemQtyPriceRow}>
        <Text style={styles.orderItemQuantityText}>Qty: {String(item.quantity)}</Text>
        <Text style={styles.orderItemPriceText}>@ ₹{String(item.discountPrice.toFixed(2))}</Text>
      </View>
      <Text style={styles.orderItemSubtotalText}>Subtotal: ₹{String((item.discountPrice * item.quantity).toFixed(2))}</Text>
    </View>
  );

  const OrderCardComponent = ({ order }: { order: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order ID: #{order._id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.orderDate}>{format(new Date(order.orderDate), 'MMM dd,yyyy')}</Text>
      </View>
      <View style={styles.orderStatusContainer}>
         <Text style={styles.orderStatusLabel}>Status:</Text>
         <Text style={[styles.orderStatusValue, order.status === 'completed' && styles.statusCompleted]}>
           {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
         </Text>
      </View>
      <FlatList
        data={order.products}
        renderItem={renderOrderItem}
        keyExtractor={(product) => product.productId}
        contentContainerStyle={styles.productsList}
        scrollEnabled={false}
      />
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotalLabel}>Total:</Text>
        <Text style={styles.orderTotalValue}>₹{order.totalAmount.toFixed(2)}</Text>
      </View>
      <Text style={styles.orderTotalWords}>
        Amount in words: {convertNumberToWords(order.totalAmount)}
      </Text>
      {order.savedAmount > 0.01 && (
        <Text style={styles.orderSavedAmount}>You saved ₹{order.savedAmount.toFixed(2)} on this order!</Text>
      )}
    </View>
  );

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
            <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
      
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              marginLeft: 12,
              color: COLORS.text,
            }}
          >
            My Orders
          </Text>
        </View>
      <View style={styles.content}>
        <Text style={styles.mainTitle}>Your Order History</Text>

        {allOrders.length > 0 ? (
          <FlatList
            data={allOrders}
            renderItem={({ item, index }) => (
              <View style={styles.orderCardWrapper}>
                <Text style={styles.orderSlNoExternal}>Sl. No. {index + 1}</Text>
                <OrderCardComponent order={item} />
              </View>
            )}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.ordersListContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noOrdersContainer}>
            <Ionicons name="cube-outline" size={80} color={COLORS.darkGray} />
            <Text style={styles.noOrdersText}>You haven't placed any orders yet.</Text>
            <TouchableOpacity
              onPress={() => router.push('/')}
              style={styles.shopNowButton}
            >
              <Text style={styles.shopNowButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
    textAlign: 'center',
  },
  backButton: {
    marginLeft: 10,
    padding: 5,
  },
  ordersListContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  orderCardWrapper: {
    marginBottom: 20,
    width: '100%',
  },
  orderSlNoExternal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
    textAlign: 'left',
    marginLeft: 5,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'left',
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 10,
  },
  orderStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderStatusLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 5,
  },
  orderStatusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  statusCompleted: {
    color: COLORS.green,
  },
  productsList: {
    paddingTop: 5,
  },
  orderItemCard: {
    flexDirection: 'column',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  orderItemNameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  orderItemQtyPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 2,
  },
  orderItemQuantityText: {
    fontSize: 13,
    color: COLORS.darkGray,
    flex: 1,
  },
  orderItemPriceText: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: 'right',
    flex: 1,
  },
  orderItemSubtotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'right',
    marginTop: 4,
    width: '100%',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGray,
    marginTop: 10,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  orderTotalWords: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    textAlign: 'right',
    marginTop: 5,
    
  },
  orderSavedAmount: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green,
    textAlign: 'center',
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noOrdersText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  shopNowButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  shopNowButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});