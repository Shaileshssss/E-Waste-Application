import React, { useState, useMemo, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from 'expo-router';
import PagerView from 'react-native-pager-view';

import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { Doc, Id } from "@/convex/_generated/dataModel";

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#5CB85C',
  accent: '#FFD700',
  text: '#333333',
  lightGray: '#F0F0F0',
  darkGray: '#666666',
  red: '#FF6347',
  white: '#FFFFFF',
  black: '#000000',
  addedGreen: '#28A745',
  deliveryGreen: '#28A745',
  scratchCardLime: '#90EE90',
  background: '#F8F8F8',
  brand: '#DFFF8F',
};

// --- Toast Component Definition ---
export interface ToastHandle {
  show: (message: string, type?: 'success' | 'error') => void;
}

const Toast = forwardRef<ToastHandle, {}>(({}, ref) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    show: (msg, msgType = 'success') => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000), // Display duration
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setMessage('')); // Clear message after animation
      setMessage(msg);
      setType(msgType);
    },
  }));

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      style={[
        toastStyles.container,
        type === 'success' ? toastStyles.success : toastStyles.error,
        { opacity: fadeAnim },
      ]}
    >
      <Text style={toastStyles.message}>{message}</Text>
    </Animated.View>
  );
});

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 70, // Adjust for bottom bar
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Ensure it's on top
  },
  success: {
    backgroundColor: COLORS.addedGreen,
  },
  error: {
    backgroundColor: COLORS.red,
  },
  message: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
// --- End Toast Component Definition ---


// Define specific product types with their literal productType
interface RefurbishedProduct extends Doc<"RefurbishedProducts"> {
  galleryImages?: string[]; // Defined as optional in schema
  productType: "refurbished"; // Explicitly add productType literal
}
interface BrandProduct extends Doc<"brandproducts"> {
  galleryImages?: string[]; // Defined as optional in schema
  warranty?: number; // Defined as optional in schema
  productType: "brand"; // Explicitly add productType literal
}
// Union type for the product fetched, allows handling both
type ProductDetail = RefurbishedProduct | BrandProduct;

export default function ProductDetailScreen() {
  console.log("ProductDetailScreen: Component Render Cycle. Hooks called.");

  const router = useRouter();
  const { id, productType: productTypeFromParams } = useLocalSearchParams<{ id: string; productType?: "brand" | "refurbished" }>();

  // Add console.log here to see raw params
  console.log("ProductDetailScreen: Raw useLocalSearchParams:", { id, productTypeFromParams });


  const productId = typeof id === 'string' ? id : undefined;
  const productType = typeof productTypeFromParams === 'string' ? productTypeFromParams : undefined;

  console.log("ProductDetailScreen: Resolved Product ID:", productId);
  console.log("ProductDetailScreen: Resolved Product Type:", productType);

  // --- START: All hooks declared unconditionally at the top level ---

  // For refurbished product query
  const refurbishedQueryParams = (productId && productType === "refurbished")
    ? { productId: productId as Id<"RefurbishedProducts"> }
    : "skip"; // Explicitly pass "skip"

  console.log("ProductDetailScreen: Refurbished Query Params:", refurbishedQueryParams);
  const refurbishedProductQuery = useQuery(
    api.RefurbishedProducts.getRefurbishedProductById,
    refurbishedQueryParams
  );
  console.log("ProductDetailScreen: Refurbished Query Result (raw):", refurbishedProductQuery);

  // For brand product query
  const brandQueryParams = (productId && productType === "brand")
    ? { productId: productId as Id<"brandproducts"> }
    : "skip"; // Explicitly pass "skip"

  console.log("ProductDetailScreen: Brand Query Params:", brandQueryParams);
  const brandProductQuery = useQuery(
    api.brandproducts.getBrandProductById,
    brandQueryParams
  );
  console.log("ProductDetailScreen: Brand Query Result (raw):", brandProductQuery);

  const { userId: clerkUserId } = useAuth();
  console.log("ProductDetailScreen: Clerk User ID (raw):", clerkUserId);

  const currentUserQueryParams = clerkUserId
    ? { clerkId: clerkUserId }
    : "skip"; // Explicitly pass "skip"

  console.log("ProductDetailScreen: Current User Query Params:", currentUserQueryParams);
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    currentUserQueryParams
  );
  console.log("ProductDetailScreen: Current User Query Result:", currentUser);

  const userCartQueryParams = currentUser?._id
    ? { userId: currentUser._id }
    : "skip"; // Explicitly pass "skip"

  console.log("ProductDetailScreen: User Cart Query Params:", userCartQueryParams);
  const userCart = useQuery(
    api.cart.getCartItems,
    userCartQueryParams
  );
  console.log("ProductDetailScreen: User Cart Query Result:", userCart);

  const product: ProductDetail | null = useMemo(() => {
    console.log("ProductDetailScreen: Memoizing product with conditions:", {
        productId,
        productType,
        refurbishedProductQueryIsUndefined: refurbishedProductQuery === undefined,
        brandProductQueryIsUndefined: brandProductQuery === undefined
    });

    if (!productId || !productType ||
        (productType === "refurbished" && refurbishedProductQuery === undefined) ||
        (productType === "brand" && brandProductQuery === undefined)
    ) {
        return null; // Represents 'loading' or 'not ready' state
    }

    if (productType === "refurbished") {
        return refurbishedProductQuery ? { ...refurbishedProductQuery, productType: "refurbished" } : null;
    } else if (productType === "brand") {
        return brandProductQuery ? { ...brandProductQuery, productType: "brand" } : null;
    }

    return null;
  }, [productId, productType, refurbishedProductQuery, brandProductQuery]);

  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const addToCartMutation = useMutation(api.cart.addToCart);

  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  const toastRef = useRef<ToastHandle>(null);

  const showToastNotification = useCallback((message: string, type?: 'success' | 'error') => {
    toastRef.current?.show(message, type);
  }, []);

  useEffect(() => {
    if (userCart) {
      const newAddedSet = new Set<string>();
      userCart.forEach(item => {
        if (item.productDetails) {
            newAddedSet.add(item.productDetails._id);
        }
      });
      setAddedProducts(newAddedSet);
      console.log("ProductDetailScreen: Updated addedProducts state:", newAddedSet);
    }
  }, [userCart]);

  const handleAddToCart = useCallback(async () => {
    console.log("ProductDetailScreen: handleAddToCart called.");
    if (!product) { // Handles both null (not found) and the initial loading null state.
      console.warn("ProductDetailScreen: handleAddToCart: Product not available or loading.");
      showToastNotification("Product data not loaded. Cannot add to cart.", 'error');
      return;
    }
    
    if (!clerkUserId || currentUser === null) {
      console.warn("ProductDetailScreen: handleAddToCart: User not logged in or user data missing.");
      Alert.alert("Login Required", "Please log in to add items to your cart.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }
    if (!currentUser?._id) { // Use optional chaining for currentUser._id
        console.warn("ProductDetailScreen: handleAddToCart: Current user _id not available.");
        showToastNotification("User data not fully loaded. Please try again.", 'error');
        return;
    }

    const typeToSend = product.productType;
    console.log(`ProductDetailScreen: Adding to cart: Product ID: ${product._id}, Type: ${typeToSend}, User ID: ${currentUser._id}`);

    try {
      await addToCartMutation({
        userId: currentUser._id,
        productId: product._id,
        quantity: 1,
        productType: typeToSend,
      });

      setAddedProducts(prevAddedProducts => {
        const newSet = new Set(prevAddedProducts);
        newSet.add(product._id);
        return newSet;
      });

      console.log(`ProductDetailScreen: Product ${product.name} (ID: ${product._id}) added to cart successfully.`);
      showToastNotification(`${product.name} added to cart!`, 'success');
    } catch (error) {
      console.error("ProductDetailScreen: Failed to add product to cart:", error);
      Alert.alert("Error", `Failed to add product to cart: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`);
    }
  }, [product, clerkUserId, currentUser, addToCartMutation, showToastNotification, router]);

  const openImageViewer = useCallback((initialImageIndex: number) => {
    console.log("ProductDetailScreen: openImageViewer: Attempting to open viewer for index", initialImageIndex);
    const imagesToView: string[] = [];
    if (product) { // Product is ProductDetail | null, so this check is needed
      if (product.imageUrl && typeof product.imageUrl === 'string') {
        imagesToView.push(product.imageUrl);
      } else {
        console.warn("ProductDetailScreen: openImageViewer: Main image URL is missing or invalid:", product.imageUrl);
      }
      if ('galleryImages' in product && Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
        imagesToView.push(...product.galleryImages.filter(img => typeof img === 'string'));
      } else {
        console.log("ProductDetailScreen: openImageViewer: No valid gallery images found or property missing.");
      }
    }
    const uniqueImages = Array.from(new Set(imagesToView));
    console.log("ProductDetailScreen: openImageViewer: Images prepared for viewer:", uniqueImages);

    if (uniqueImages.length > 0) {
      setSelectedImageIndex(initialImageIndex);
      setIsImageViewerVisible(true);
      console.log("ProductDetailScreen: openImageViewer: Image viewer opened with images:", uniqueImages);
    } else {
      console.warn("ProductDetailScreen: openImageViewer: No images found for this product.");
      showToastNotification("No additional images available for this product.", 'error');
    }
  }, [product, showToastNotification]);

  const closeImageViewer = useCallback(() => {
    setIsImageViewerVisible(false);
    setSelectedImageIndex(0);
    console.log("ProductDetailScreen: closeImageViewer: Image viewer closed.");
  }, []);

  // Get all images for the viewer: main image + gallery images if available
  const allImagesForViewer = useMemo(() => {
    const images: string[] = [];
    // Only access product properties if product is not null.
    // This useMemo depends on 'product' which can be null initially,
    // but the array will be empty until 'product' is resolved.
    if (product) {
      if (product.imageUrl && typeof product.imageUrl === 'string') {
        images.push(product.imageUrl);
      }
      if ('galleryImages' in product && Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
        images.push(...product.galleryImages.filter(img => typeof img === 'string'));
      }
    }
    return Array.from(new Set(images)); // Remove duplicates
  }, [product]);

  const isLoading = useMemo(() => {
    console.log("ProductDetailScreen: isLoading conditions check:", {
        hasProductId: !!productId,
        hasProductType: !!productType,
        isCurrentUserLoading: clerkUserId && currentUser === undefined,
        isProductNull: product === null
    });
    return (
      !productId ||
      !productType ||
      (clerkUserId && currentUser === undefined) ||
      product === null // 'product' is null if it's still loading or not found
    );
  }, [productId, productType, clerkUserId, currentUser, product]);

  // --- END: All hooks declared unconditionally at the top level ---


  // --- CONDITIONAL RENDERING (now after all hooks) ---

  if (isLoading) {
    console.log(`ProductDetailScreen: Currently Loading...`);
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (product === null) {
    console.log("ProductDetailScreen: Product not found, rendering error state.");
    return (
      <View style={styles.fullScreenContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-circle" size={36} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.errorText}>Product not found or invalid product type specified!</Text>
      </View>
    );
  }

  // NOW, TypeScript is guaranteed that 'product' is of type ProductDetail
  // You can safely access product.name, product.imageUrl, etc., without the 'possibly undefined/null' error.

  console.log("ProductDetailScreen: Product data is ready, rendering details for:", product.name, product._id);
  console.log("ProductDetailScreen: Main image URL:", product.imageUrl);
  console.log("ProductDetailScreen: Gallery images:", product.galleryImages);

  const discountPercentage = product.originalPrice > 0
    ? ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
    : 0;

  const isAdded = addedProducts.has(product._id);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + product.delivery);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });


  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-circle" size={36} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {product.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity style={styles.imageContainer} onPress={() => openImageViewer(0)}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
              onError={(e) => console.error("ProductDetailScreen: Main Product Image Failed to Load:", e.nativeEvent.error, "URL:", product.imageUrl)}
              onLoad={() => console.log("ProductDetailScreen: Main Product Image Loaded Successfully:", product.imageUrl)}
            />
          ) : (
            <Ionicons name="image-outline" size={width * 0.4} color={COLORS.darkGray} />
          )}

          {allImagesForViewer.length > 0 && (
            <View style={styles.galleryIndicator}>
              <Ionicons name="images-outline" size={20} color={COLORS.white} />
              <Text style={styles.galleryCount}>
                {allImagesForViewer.length} image{allImagesForViewer.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          <View style={styles.priceSection}>
            <Text style={styles.discountPrice}>₹{product.discountPrice.toFixed(2)}</Text>
            {product.originalPrice > product.discountPrice && (
              <View style={styles.originalPriceAndDiscount}>
                <Text style={styles.originalPrice}>₹{product.originalPrice.toFixed(2)}</Text>
                {discountPercentage > 0 && (
                  <Text style={styles.discountBadge}>{discountPercentage.toFixed(0)}% OFF</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={COLORS.accent} />
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.review} reviews)
            </Text>
          </View>

          <Text style={styles.deliveryText}>
            Free delivery by <Text style={styles.deliveryDate}>{formattedDeliveryDate}</Text>
          </Text>

          <View style={styles.buyNowWrapper}>
            <Text style={styles.buyNowText}>Buy Now and win Scratch Card 🎉</Text>
          </View>
        </View>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceTitle}>Shop with confidence</Text>
          <View style={styles.confidenceRow}>
            <View style={styles.confidenceItem}>
              <Ionicons name="car-outline" size={24} color={COLORS.primary} />
              <Text style={styles.confidenceText}>Free Delivery</Text>
            </View>
            <View style={styles.confidenceItem}>
              <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
              <Text style={styles.confidenceText}>Pay on Delivery</Text>
            </View>
          </View>
          <View style={styles.confidenceRow}>
            <View style={styles.confidenceItem}>
              <Ionicons name="reload-outline" size={24} color={COLORS.primary} />
              <Text style={styles.confidenceText}>10 days Returnable</Text>
            </View>
            <View style={styles.confidenceItem}>
              <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
              <Text style={styles.confidenceText}>Amazon Delivered</Text>
            </View>
          </View>
          <View style={styles.confidenceRow}>
            <View style={styles.confidenceItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
              <Text style={styles.confidenceText}>3 Year Warranty</Text>
            </View>
            <View style={styles.confidenceItem}>
              <Ionicons name="ribbon-outline" size={24} color={COLORS.primary} />
              <Text style={styles.confidenceText}>Top Brand</Text>
            </View>
          </View>
          <View style={styles.confidenceRow}>
            <View style={styles.confidenceItem}>
              <Ionicons name="lock-closed-outline" size={24} color={COLORS.primary} />
              <Text style={styles.confidenceText}>Secure transaction</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomBarPriceContainer}>
          <Text style={styles.bottomBarPriceLabel}>Total Price:</Text>
          <Text style={styles.bottomBarPriceValue}>₹{product.discountPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartButton, isAdded && styles.addToCartButtonAdded]}
          onPress={handleAddToCart}
          disabled={isAdded}
        >
          <Ionicons
            name={isAdded ? "checkmark-circle-outline" : "cart-outline"}
            size={20}
            color={isAdded ? COLORS.white : COLORS.text}
          />
          <Text style={[styles.addToCartButtonText, isAdded && styles.addToCartButtonTextAdded]}>
            {isAdded ? "Added to Cart" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>

      <Toast ref={toastRef} />

      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <ImageViewer
          images={allImagesForViewer}
          selectedIndex={selectedImageIndex}
          onRequestClose={closeImageViewer}
        />
      </Modal>
    </View>
  );
}

interface ImageViewerProps {
  images: string[];
  selectedIndex: number;
  onRequestClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, selectedIndex, onRequestClose }) => {
  const pagerRef = useRef<PagerView>(null);
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  useEffect(() => {
    if (pagerRef.current && selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < images.length) {
      requestAnimationFrame(() => {
        if (pagerRef.current && pagerRef.current.setPageWithoutAnimation) {
          pagerRef.current.setPageWithoutAnimation(selectedIndex);
        }
      });
    }
    setCurrentIndex(selectedIndex);
  }, [selectedIndex, images.length]);

  const handlePageChange = useCallback((event: { nativeEvent: { position: number } }) => {
    setCurrentIndex(event.nativeEvent.position);
  }, []);

  if (!images || images.length === 0) {
    return (
      <View style={imageViewerStyles.modalContainer}>
        <View style={imageViewerStyles.header}>
          <TouchableOpacity onPress={onRequestClose} style={imageViewerStyles.closeButton}>
            <Ionicons name="close-circle" size={36} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={imageViewerStyles.title}>No images</Text>
        </View>
        <View style={imageViewerStyles.noImagesContainer}>
          <Text style={imageViewerStyles.noImagesText}>No images available to display.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={imageViewerStyles.modalContainer}>
      <View style={imageViewerStyles.header}>
        <TouchableOpacity onPress={onRequestClose} style={imageViewerStyles.closeButton}>
          <Ionicons name="close-circle" size={36} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={imageViewerStyles.title}>{currentIndex + 1} / {images.length}</Text>
      </View>
      <PagerView
        ref={pagerRef}
        style={imageViewerStyles.pagerView}
        initialPage={selectedIndex}
        onPageSelected={handlePageChange}
        scrollEnabled={true}
      >
        {images.map((imageSource, index) => {
          return <ZoomableImage key={index} imageSource={imageSource} />;
        })}
      </PagerView>
    </View>
  );
};

interface ZoomableImageProps {
  imageSource: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ imageSource }) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const animatedImageSource = useMemo(() => {
    return { uri: imageSource };
  }, [imageSource]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      const maxTranslateX = (width * scale.value - width) / 2;
      const maxTranslateY = (height * scale.value - height) / 2;

      if (scale.value > 1) {
        translateX.value = withTiming(
          Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value))
        );
        translateY.value = withTiming(
          Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value))
        );
      } else {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      } else if (scale.value > 3) {
        scale.value = withTiming(3);
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      } else {
        scale.value = withTiming(2);
      }
    });

  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.Image
        source={animatedImageSource}
        style={[imageViewerStyles.zoomableImage, animatedStyle]}
        resizeMode="contain"
        onError={(e) => console.error("ZoomableImage: Failed to load image. Source:", imageSource, "Error:", e.nativeEvent.error)}
        onLoad={() => console.log("ZoomableImage: Image loaded successfully. Source:", imageSource)}
      />
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.brand,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.red,
    textAlign: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 20 : 50,
    paddingBottom: 15,
    backgroundColor: COLORS.brand,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.lightGray,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === 'android' ? 18 : 45,
    zIndex: 11,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 40,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  productImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  galleryIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  galleryCount: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 15,
    color: COLORS.darkGray,
    lineHeight: 22,
    marginBottom: 15,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  discountPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 10,
  },
  originalPriceAndDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 16,
    color: COLORS.darkGray,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: COLORS.red,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: 'hidden',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 15,
    color: COLORS.darkGray,
    marginLeft: 5,
  },
  deliveryText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  deliveryDate: {
    fontWeight: 'bold',
    color: COLORS.deliveryGreen,
  },
  buyNowWrapper: {
    backgroundColor: COLORS.scratchCardLime,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buyNowText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  confidenceContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 10,
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  confidenceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  confidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  confidenceText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 8,
    flexShrink: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.brand,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.lightGray,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bottomBarPriceContainer: {
    alignItems: 'flex-start',
  },
  bottomBarPriceLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  bottomBarPriceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "orange",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    minWidth: 150,
  },
  addToCartButtonAdded: {
    backgroundColor: COLORS.addedGreen,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  addToCartButtonTextAdded: {
    color: COLORS.white,
  },
});

const imageViewerStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  pagerView: {
    flex: 1,
  },
  zoomableImage: {
    width: width,
    height: height,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  noImagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagesText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
  }
});
