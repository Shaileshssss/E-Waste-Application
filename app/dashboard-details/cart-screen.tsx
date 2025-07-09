import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Platform, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { COLORS } from "@/constants/theme";

// Import Convex types
import { Id } from "@/convex/_generated/dataModel";
import { Doc } from '@/convex/_generated/dataModel';

// Define the type for the product details that can come from either collection
type ProductDetails = Doc<"RefurbishedProducts"> | Doc<"brandproducts">;

// Interface for a cart item as it comes from the `getCartItems` query
// This now directly includes `productDetails` which CAN BE NULL
interface CartItemWithDetails {
  productId: Id<"RefurbishedProducts"> | Id<"brandproducts">;
  quantity: number;
  productType: "brand" | "refurbished";
  productDetails: ProductDetails | null; // productDetails can still be null from the query
}

const MAX_QUANTITY = 10;

export default function CartScreen() {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();

  const currentUser = useQuery(
    api.users?.getUserByClerkId, // Added optional chaining
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  const cartItemsFromConvex: CartItemWithDetails[] | undefined = useQuery(
    api.cart?.getCartItems, // Added optional chaining
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const removeFromCartMutation = useMutation(api.cart?.removeCartItem); // Added optional chaining
  const updateCartItemQuantityMutation = useMutation(api.cart?.updateCartItemQuantity); // Added optional chaining
  const clearCartMutation = useMutation(api.cart?.clearCart); // Added optional chaining

  // Filter out any items where productDetails might be null (e.g., if a product was deleted)
  const cartItems: CartItemWithDetails[] = useMemo(() => {
    return (cartItemsFromConvex || []).filter((item): item is CartItemWithDetails => item.productDetails !== null);
  }, [cartItemsFromConvex]);

  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newSelectedIds = new Set<string>();
    cartItems.forEach(item => {
      if (item.productDetails) {
        newSelectedIds.add(item.productDetails._id);
      }
    });
    setSelectedItemIds(newSelectedIds);
    console.log("CartScreen: Initialized/Updated selectedItemIds:", newSelectedIds);
  }, [cartItems]);

  const checkboxAnim = useRef(new Animated.Value(1)).current;

  const animateCheckbox = useCallback(() => {
    checkboxAnim.setValue(0.8);
    Animated.spring(checkboxAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [checkboxAnim]);

  const handleToggleSelection = useCallback((productId: string) => {
    setSelectedItemIds(prevSelectedIds => {
      const newSet = new Set(prevSelectedIds);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        console.log(`CartScreen: Deselected item: ${productId}`);
      } else {
        newSet.add(productId);
        console.log(`CartScreen: Selected item: ${productId}`);
        animateCheckbox();
      }
      return newSet;
    });
  }, [animateCheckbox]);

  const { totalItemsCount, cartTotal, originalCartTotal, savedAmount } = useMemo(() => {
    let totalItems = 0;
    let currentCartTotal = 0;
    let currentOriginalCartTotal = 0;

    const selectedCartItems = cartItems.filter(item =>
      item.productDetails && selectedItemIds.has(item.productDetails._id)
    );

    if (selectedCartItems.length > 0) {
      totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

      selectedCartItems.forEach(item => {
        currentCartTotal += item.productDetails!.discountPrice * item.quantity;
        currentOriginalCartTotal += item.productDetails!.originalPrice * item.quantity;
      });
    }

    const currentSavedAmount = currentOriginalCartTotal - currentCartTotal;

    return {
      totalItemsCount: totalItems,
      cartTotal: currentCartTotal,
      originalCartTotal: currentOriginalCartTotal,
      savedAmount: currentSavedAmount,
    };
  }, [cartItems, selectedItemIds]);

  useEffect(() => {
    console.log("--- CartScreen Debugging ---");
    console.log("cartItemsFromConvex (raw from Convex):", cartItemsFromConvex);
    console.log("cartItems (processed for display, nulls filtered):", cartItems);
    console.log("selectedItemIds:", Array.from(selectedItemIds));
    console.log("totalItemsCount (calculated based on selection):", totalItemsCount);
    console.log("--- End CartScreen Debugging ---");
  }, [cartItemsFromConvex, cartItems, totalItemsCount, selectedItemIds]);


  const handleRemoveItem = async (productId: Id<"RefurbishedProducts"> | Id<"brandproducts">) => {
    if (!currentUser?._id) {
      console.warn("User not loaded, cannot remove from cart.");
      return;
    }
    try {
      await removeFromCartMutation({ userId: currentUser._id, productId });
      setSelectedItemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      console.log(`Product ${productId} removed from cart.`);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const handleQuantityChange = async (productId: Id<"RefurbishedProducts"> | Id<"brandproducts">, newQuantity: number) => {
    if (!currentUser?._id) {
      console.warn("User not loaded, cannot update quantity.");
      return;
    }

    const clampedQuantity = Math.max(0, Math.min(newQuantity, MAX_QUANTITY));

    const currentItem = cartItems.find(item => item.productDetails!._id === productId);
    if (!currentItem || currentItem.quantity === clampedQuantity) {
      return;
    }

    try {
      if (clampedQuantity === 0) {
        await removeFromCartMutation({ userId: currentUser._id, productId });
        setSelectedItemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await updateCartItemQuantityMutation({ userId: currentUser._id, productId, quantity: clampedQuantity });
      }
      console.log(`Product ${productId} quantity updated to ${clampedQuantity}.`);
    } catch (error) {
      console.error("Failed to update item quantity:", error);
    }
  };

  const handleClearCart = async () => {
    if (!currentUser?._id) {
      console.warn("User not loaded, cannot clear cart.");
      return;
    }
    try {
      await clearCartMutation({ userId: currentUser._id });
      setSelectedItemIds(new Set()); // Clear selections as well
      console.log("Cart cleared.");
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const handleCheckout = () => {
    if (selectedItemIds.size === 0) {
      alert("Please select at least one item to proceed to checkout.");
      return;
    }
    // Pass the selected item IDs as a comma-separated string
    router.push({
      pathname: '/dashboard-details/checkout-screen',
      params: { selectedIds: Array.from(selectedItemIds).join(',') }
    });
  };

  const renderCartItem = ({ item, index }: { item: CartItemWithDetails, index: number }) => {
    const isSelected = selectedItemIds.has(item.productDetails!._id);
    const deliveryDate = new Date();
    if (item.productDetails && 'delivery' in item.productDetails && typeof item.productDetails.delivery === 'number') {
        deliveryDate.setDate(deliveryDate.getDate() + item.productDetails.delivery);
    } else {
        deliveryDate.setDate(deliveryDate.getDate() + 5);
    }
    const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });

    return (
      <View style={styles.cartItemCard}>
        <View style={newStyles.checkboxSerialWrapper}>
          <TouchableOpacity
            onPress={() => handleToggleSelection(item.productDetails!._id)}
            style={newStyles.checkboxContainer}
          >
            <Animated.View style={{ transform: [{ scale: checkboxAnim }] }}>
              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={isSelected ? COLORS.primary : COLORS.darkGray}
              />
            </Animated.View>
          </TouchableOpacity>
          <Text style={newStyles.serialNumberCompact}>{index + 1}.</Text>
        </View>

        <Image
          source={{ uri: item.productDetails!.imageUrl }}
          style={newStyles.cartItemImageCompact}
          contentFit='contain'
        />

        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemName} numberOfLines={2} ellipsizeMode="tail">
            {item.productDetails!.name}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.discountPrice}>
              ₹{(item.productDetails!.discountPrice * item.quantity).toFixed(2)}
            </Text>
            {item.productDetails!.originalPrice > item.productDetails!.discountPrice && (
              <Text style={styles.originalPrice}>
                ₹{(item.productDetails!.originalPrice * item.quantity).toFixed(2)}
              </Text>
            )}
          </View>

          <Text style={newStyles.deliveryDateText}>
            Delivers by: <Text style={newStyles.deliveryDateValue}>{formattedDeliveryDate}</Text>
          </Text>


          <View style={styles.quantityRemoveRow}>
            <View style={styles.quantityControlsContainer}>
              <TouchableOpacity
                onPress={() => handleQuantityChange(item.productDetails!._id, item.quantity - 1)}
                style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                disabled={item.quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.currentQuantityText}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => handleQuantityChange(item.productDetails!._id, item.quantity + 1)}
                style={[styles.quantityButton, item.quantity >= MAX_QUANTITY && styles.quantityButtonDisabled]}
                disabled={item.quantity >= MAX_QUANTITY}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveItem(item.productDetails!._id)}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.red} />
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (cartItemsFromConvex === undefined || currentUser === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.brand,
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 12, color: COLORS.text }}>
            Your Cart
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading cart...</Text>
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
          <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            marginLeft: 12,
            color: COLORS.text,
            flex: 1,
          }}
        >
          Your Cart
        </Text>
        {totalItemsCount > 0 && (
          <TouchableOpacity style={styles.clearCartButton} onPress={handleClearCart}>
            <Ionicons name="trash-bin-outline" size={18} color={COLORS.red} />
            <Text style={styles.clearCartButtonText}>Clear Cart</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        {totalItemsCount === 0 && cartItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Ionicons name="cart-outline" size={80} color={COLORS.darkGray} />
            <Text style={styles.emptyCartText}>Your cart is empty.</Text>
            <TouchableOpacity
              onPress={() => router.push("/products/MoreProducts")}
              style={styles.shopNowButton}
            >
              <Text style={styles.shopNowButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.cartItemsHeading}>Here's everything you've added to your cart.</Text>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.productDetails!._id}
              contentContainerStyle={styles.cartListContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.cartSummary}>
              {savedAmount > 0 && (
                <Text style={styles.savedAmountText}>
                  You saved ₹{savedAmount.toFixed(2)} on this order!
                </Text>
              )}
              <View style={styles.totalPriceContainer}>
                <Text style={styles.totalText}>Total ({totalItemsCount} items selected): </Text>
                <Text style={styles.totalAmount}>₹{cartTotal.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.checkoutButton, selectedItemIds.size === 0 && newStyles.checkoutButtonDisabled]}
                onPress={handleCheckout}
                disabled={selectedItemIds.size === 0}
              >
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout ({totalItemsCount} items)
                </Text>
              </TouchableOpacity>
            </View>
          </>
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
  content: {
    flex: 1,
    padding: 10,
  },
  clearCartButton: {
    marginLeft: 'auto',
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clearCartButtonText: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.darkGray,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginTop: 15,
    marginBottom: 20,
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
  cartItemsHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  cartListContent: {
    paddingBottom: 20,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 10,
    padding: 8,
    alignItems: 'flex-start',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serialNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginRight: 8,
    minWidth: 20,
    textAlign: 'right',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 5,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 13,
    color: COLORS.darkGray,
    textDecorationLine: 'line-through',
  },
  quantityRemoveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  quantityControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 5,
    overflow: 'hidden',
    height: 35,
    width: 100,
    marginRight: 10,
    backgroundColor: COLORS.white,
  },
  quantityButton: {
    backgroundColor: COLORS.lightGray,
    width: 30,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  currentQuantityText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    backgroundColor: COLORS.white,
    height: '100%',
    lineHeight: 35,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    marginLeft: 5,
    fontSize: 12,
    color: COLORS.red,
    fontWeight: '600',
  },
  cartSummary: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedAmountText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  }
});

const newStyles = StyleSheet.create({
  checkboxSerialWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 5,
    minWidth: 35,
  },
  checkboxContainer: {
    padding: 2,
    marginBottom: 2,
  },
  serialNumberCompact: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  cartItemImageCompact: {
    width: 65,
    height: 65,
    borderRadius: 8,
    marginRight: 8,
  },
  deliveryDateText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
    marginBottom: 0,
  },
  deliveryDateValue: {
    fontWeight: 'bold',
    color: COLORS.deliveryGreen || COLORS.primary,
  },
  checkoutButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    opacity: 0.7,
  }
});
