import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Modal,
    Platform,
    Animated,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';

import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Toast, { ToastHandle } from "@/components/Toast"; // Assuming Toast component is available

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

// Type definition for product (matches Convex Doc<"RefurbishedProducts">)
interface Product extends Doc<"RefurbishedProducts"> {}

const filterCategories = ["All", "Laptops", "Smartphones", "Accessories", "PC Components", "Audio", "Cameras", "Tablets", "Gaming Consoles", "Smart Home"];
const sortOptions = [
    { label: "None", value: "none" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Rating: High to Low", value: "rating_desc" },
];

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 30 : 50;
const HEADER_TITLE_FONT_SIZE = 22;
const HEADER_TITLE_MARGIN_BOTTOM = 15;
const FILTER_SORT_PADDING_VERTICAL = 8;
const FILTER_SORT_MARGIN_BOTTOM = 18;
const FILTER_SORT_ICON_SIZE = 16;

const HEADER_TITLE_EFFECTIVE_HEIGHT = HEADER_TITLE_FONT_SIZE + HEADER_TITLE_MARGIN_BOTTOM;
const FILTER_SORT_CONTAINER_EFFECTIVE_HEIGHT = (FILTER_SORT_PADDING_VERTICAL * 2) + FILTER_SORT_ICON_SIZE + 1;

const INITIAL_HEADER_HEIGHT = STATUS_BAR_HEIGHT + HEADER_TITLE_EFFECTIVE_HEIGHT + FILTER_SORT_CONTAINER_EFFECTIVE_HEIGHT + FILTER_SORT_MARGIN_BOTTOM + 10;
const COLLAPSED_HEADER_HEIGHT = STATUS_BAR_HEIGHT + FILTER_SORT_CONTAINER_EFFECTIVE_HEIGHT + 5;


export default function MoreProducts() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const initialCategoryFromParams = (params.category as string) || "All";
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFromParams);
    
    const [selectedSortOption, setSelectedSortOption] = useState<string>("none");

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortForModal] = useState(false);

    const { userId: clerkUserId } = useAuth();
    const currentUser = useQuery(
        api.users.getUserByClerkId,
        clerkUserId ? { clerkId: clerkUserId } : "skip"
    );
    const addToCartMutation = useMutation(api.cart.addToCart);
    const [addedProducts, setAddedProducts] = useState<Set<Id<"RefurbishedProducts"> | Id<"brandproducts">>>(new Set());
    const [playingLottieId, setPlayingLottieId] = useState<Id<"RefurbishedProducts"> | Id<"brandproducts"> | null>(null);

    const toastRef = useRef<ToastHandle>(null);
    const showToastNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        toastRef.current?.show(message, type);
    }, []);

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [showGoToTopButton, setShowGoToTopButton] = useState(false);

    const categoryForConvexQuery = selectedCategory === "All" ? undefined : selectedCategory;
    const allProductsFromConvex: Product[] | undefined = useQuery(
        api.RefurbishedProducts.getRefurbishedProductsByCategory,
        categoryForConvexQuery ? { category: categoryForConvexQuery } : {}
    );

    useEffect(() => {
        if (params.category && params.category !== selectedCategory) {
            setSelectedCategory(params.category as string);
        } else if (!params.category && selectedCategory !== "All") {
            setSelectedCategory("All");
        }
    }, [params.category, selectedCategory]);

    const userCart = useQuery(
        api.cart.getCartItems,
        currentUser?._id ? { userId: currentUser._id } : "skip"
    );

    useEffect(() => {
        if (userCart) {
            const newAddedSet = new Set<Id<"RefurbishedProducts"> | Id<"brandproducts">>();
            userCart.forEach(item => {
                if (item.productDetails) {
                    newAddedSet.add(item.productDetails._id);
                }
            });
            setAddedProducts(newAddedSet);
        }
    }, [userCart]);


    const filteredAndSortedProducts: Product[] | undefined = useMemo(() => {
        if (!allProductsFromConvex) {
            return undefined;
        }

        let currentProducts = [...allProductsFromConvex];

        switch (selectedSortOption) {
            case "price_asc":
                currentProducts.sort((a, b) => a.discountPrice - b.discountPrice);
                break;
            case "price_desc":
                currentProducts.sort((a, b) => b.discountPrice - a.discountPrice);
                break;
            case "rating_desc":
                currentProducts.sort((a, b) => b.rating - a.rating);
                break;
            case "none":
            default:
                currentProducts.sort((a, b) => a._creationTime - b._creationTime);
                break;
        }

        return currentProducts;
    }, [allProductsFromConvex, selectedSortOption]);

    const handleAddToCart = async (productToAdd: Product) => {
        if (!currentUser?._id) {
            showToastNotification("Please log in to add items to cart.", 'error');
            return;
        }

        try {
            const isCurrentlyAdded = addedProducts.has(productToAdd._id);
            if (isCurrentlyAdded) {
                showToastNotification("This product is already in your cart!", 'error');
                return;
            }

            await addToCartMutation({
                userId: currentUser._id,
                productId: productToAdd._id,
                quantity: 1,
                productType: "refurbished", // Explicitly set productType for RefurbishedProducts
            });

            setAddedProducts(prevAddedProducts => {
                const newSet = new Set(prevAddedProducts);
                newSet.add(productToAdd._id);
                return newSet;
            });

            setPlayingLottieId(productToAdd._id);
            showToastNotification(`${productToAdd.name} added to cart!`, 'success');
            setTimeout(() => {
                setPlayingLottieId(null);
            }, 1200);

        } catch (error) {
            console.error("Failed to add product to cart:", error);
            showToastNotification("Failed to add product to cart. Please try again.", 'error');
        }
    };

    const handleFilter = () => {
        setShowFilterModal(true);
    };

    const handleSort = () => {
        setShowSortForModal(true);
    };

    const handleProductPress = (productId: Id<"RefurbishedProducts">) => {
        router.push({
            pathname: "/products/details/[id]",
            params: { id: productId, productType: "refurbished" }, // <-- ADDED productType HERE
        });
    };

    const titleCollapseStart = 0;
    const titleCollapseEnd = HEADER_TITLE_EFFECTIVE_HEIGHT;

    const headerTitleOpacity = scrollY.interpolate({
        inputRange: [titleCollapseStart, titleCollapseEnd],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const headerTitleTranslateY = scrollY.interpolate({
        inputRange: [titleCollapseStart, titleCollapseEnd],
        outputRange: [10, -HEADER_TITLE_EFFECTIVE_HEIGHT],
        extrapolate: 'clamp',
    });

    const filterSortMovePoint = HEADER_TITLE_EFFECTIVE_HEIGHT;

    const filterSortContainerTranslateY = scrollY.interpolate({
        inputRange: [filterSortMovePoint, filterSortMovePoint + 1],
        outputRange: [0, -HEADER_TITLE_EFFECTIVE_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerHeight = scrollY.interpolate({
        inputRange: [0, INITIAL_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT],
        outputRange: [INITIAL_HEADER_HEIGHT, COLLAPSED_HEADER_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerBackgroundColor = scrollY.interpolate({
        inputRange: [0, INITIAL_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT - 20, INITIAL_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT],
        outputRange: [COLORS.white, COLORS.white, COLORS.lightGray],
        extrapolate: 'clamp',
    });

    const filterSortTextOpacity = scrollY.interpolate({
        inputRange: [
            HEADER_TITLE_EFFECTIVE_HEIGHT * 0.5,
            INITIAL_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT - 10
        ],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const handleScroll = (event: any) => {
        scrollY.setValue(event.nativeEvent.contentOffset.y);

        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const scrollEndThreshold = contentSize.height - layoutMeasurement.height - (height * 0.2);
        const hasScrolledDownEnough = contentOffset.y > (height * 0.5);

        if (contentOffset.y > scrollEndThreshold && hasScrolledDownEnough) {
            setShowGoToTopButton(true);
        } else {
            setShowGoToTopButton(false);
        }
    };

    const goToTop = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    if (allProductsFromConvex === undefined || filteredAndSortedProducts === undefined || currentUser === undefined || userCart === undefined) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading products...</Text>
            </View>
        );
    }

    return (
        <View style={styles.fullScreenContainer}>
            <Animated.View
                style={[
                    styles.fixedHeader,
                    {
                        height: headerHeight,
                        backgroundColor: COLORS.brand,
                    },
                ]}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-circle" size={36} color={COLORS.primary} />
                </TouchableOpacity>

                <Animated.Text
                    style={[
                        styles.headerTitle,
                        { opacity: headerTitleOpacity, transform: [{ translateY: headerTitleTranslateY }] },
                    ]}
                >
                    Refurbished Product's
                </Animated.Text>

                <Animated.View
                    style={[
                        styles.filterSortContainer,
                        {
                            transform: [{ translateY: filterSortContainerTranslateY }],
                        },
                        { backgroundColor: COLORS.white }
                    ]}
                >
                    <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
                        <Ionicons name="filter-outline" size={FILTER_SORT_ICON_SIZE} color={COLORS.text} />
                        <Animated.Text style={[styles.filterSortText, { opacity: filterSortTextOpacity }]}>
                            Filter
                        </Animated.Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortButton} onPress={handleSort}>
                        <Ionicons name="swap-vertical-outline" size={FILTER_SORT_ICON_SIZE} color={COLORS.text} />
                        <Animated.Text style={[styles.filterSortText, { opacity: filterSortTextOpacity }]}>
                            Sort
                        </Animated.Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>

            <Animated.ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[
                    styles.scrollViewContent,
                    { paddingTop: INITIAL_HEADER_HEIGHT },
                ]}
                scrollEventThrottle={16}
                onScroll={handleScroll}
            >
                {filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map((product) => {
                        const discountPercentage = product.originalPrice > 0
                            ? ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
                            : 0;

                        const isAdded = addedProducts.has(product._id);

                        const deliveryDate = new Date();
                        deliveryDate.setDate(deliveryDate.getDate() + product.delivery);
                        const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });

                        return (
                            <TouchableOpacity
                                key={product._id}
                                style={styles.productCard}
                                onPress={() => handleProductPress(product._id)}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{ uri: product.imageUrl }}
                                    style={styles.productImage}
                                    resizeMode="contain"
                                />
                                <View style={styles.productDetails}>
                                    <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">
                                        {product.name}
                                    </Text>

                                    <Text style={styles.productDescription} numberOfLines={2} ellipsizeMode="tail">
                                        {product.description}
                                    </Text>

                                    <View style={styles.fullPriceAndCartInfo}>
                                        <View style={styles.priceAndCartRow}>
                                            <View style={styles.priceContainer}>
                                                <Text style={styles.discountPrice}>
                                                    ₹{product.discountPrice.toFixed(2)}
                                                </Text>
                                                {product.originalPrice > product.discountPrice && (
                                                    <View style={styles.originalPriceAndDiscount}>
                                                        <Text style={styles.originalPrice}>
                                                            ₹{product.originalPrice.toFixed(2)}
                                                        </Text>
                                                        {discountPercentage > 0 && (
                                                            <Text style={styles.discountBadge}>
                                                                {discountPercentage.toFixed(0)}% OFF
                                                            </Text>
                                                        )}
                                                    </View>
                                                )}
                                            </View>

                                            <TouchableOpacity
                                                style={[
                                                    styles.cartButton,
                                                    isAdded && styles.cartButtonAdded
                                                ]}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                                disabled={isAdded}
                                            >
                                                <Ionicons
                                                    name={isAdded ? "checkmark-circle-outline" : "cart-outline"}
                                                    size={16}
                                                    color={isAdded ? COLORS.white : COLORS.text}
                                                />
                                                <Text
                                                    style={[
                                                        styles.cartButtonText,
                                                        isAdded && styles.cartButtonTextAdded
                                                    ]}
                                                >
                                                    {isAdded ? "Added" : "Add"}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.buyNowWrapper}>
                                            <Text style={styles.buyNowText}>Buy Now and win Scratch Card</Text>
                                        </View>

                                        <Text style={styles.deliveryText}>
                                            Free delivery by <Text style={styles.deliveryDate}>{formattedDeliveryDate}</Text>
                                        </Text>

                                    </View>

                                    <Text style={styles.productRating}>
                                        <Ionicons name="star" size={12} color={COLORS.accent} />
                                        <Text> {product.rating.toFixed(1)} ({product.review} reviews)</Text>
                                    </Text>
                                </View>
                                {playingLottieId === product._id && isAdded && (
                                    <LottieView
                                        source={require("../../assets/lottie/Cart+.json")}
                                        autoPlay
                                        loop={false}
                                        style={styles.cartLottie}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <Text style={styles.noResultsText}>No products found matching your criteria.</Text>
                )}

                <View style={{ height: 100 }} />
            </Animated.ScrollView>

            {showGoToTopButton && (
                <TouchableOpacity style={styles.goToTopButton} onPress={goToTop}>
                    <Ionicons name="arrow-up" size={24} color={COLORS.white} />
                </TouchableOpacity>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={showFilterModal}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filter by Category</Text>
                        {filterCategories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.modalOptionButton,
                                    selectedCategory === category && styles.modalOptionButtonSelected,
                                ]}
                                onPress={() => {
                                    setSelectedCategory(category);
                                    setShowFilterModal(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        selectedCategory === category && styles.modalOptionTextSelected,
                                    ]}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showSortModal}
                onRequestClose={() => setShowSortForModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sort by</Text>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.modalOptionButton,
                                    selectedSortOption === option.value && styles.modalOptionButtonSelected,
                                ]}
                                onPress={() => {
                                    setSelectedSortOption(option.value);
                                    setShowSortForModal(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        selectedSortOption === option.value && styles.modalOptionTextSelected,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowSortForModal(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Toast ref={toastRef} />
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: COLORS.brand,
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
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 10,
        paddingTop: Platform.OS === 'android' ? 8 : 50,
        backgroundColor: COLORS.red,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1,
        overflow: 'hidden',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingBottom: 10,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 25 : 45,
        left: 10,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: HEADER_TITLE_FONT_SIZE,
        fontWeight: "bold",
        marginBottom: HEADER_TITLE_MARGIN_BOTTOM,
        color: COLORS.text,
        textAlign: 'center',
    },
    filterSortContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: FILTER_SORT_MARGIN_BOTTOM,
        borderRadius: 8,
        paddingVertical: FILTER_SORT_PADDING_VERTICAL,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    filterSortText: {
        marginLeft: 6,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    productCard: {
        flexDirection: "row",
        backgroundColor: COLORS.white,
        borderRadius: 10,
        marginBottom: 12,
        top: 8,
        overflow: "hidden",
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 4,
        position: 'relative',
    },
    productImage: {
        width: width * 0.32,
        height: "auto",
        aspectRatio: 1,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        left: 2,
        top: 25,
    },
    productDetails: {
        flex: 1,
        padding: 10,
        justifyContent: "space-between",
    },
    productName: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.text,
        marginBottom: 2,
        lineHeight: 20,
    },
    productDescription: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginBottom: 6,
        lineHeight: 16,
    },
    fullPriceAndCartInfo: {
        flexDirection: 'column',
        marginBottom: 6,
    },
    priceAndCartRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    originalPriceAndDiscount: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    originalPrice: {
        fontSize: 12,
        color: COLORS.darkGray,
        textDecorationLine: "line-through",
        marginRight: 6,
    },
    discountBadge: {
        backgroundColor: COLORS.red,
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
        overflow: 'hidden',
    },
    cartButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.accent,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    cartButtonAdded: {
        backgroundColor: COLORS.addedGreen,
    },
    cartButtonText: {
        marginLeft: 3,
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "600",
    },
    cartButtonTextAdded: {
        color: COLORS.white,
    },
    cartLottie: {
        position: 'absolute',
        width: 160,
        height: 160,
        bottom: 50,
        right: 105,
        zIndex: 5,
    },
    buyNowWrapper: {
        backgroundColor: COLORS.scratchCardLime,
        borderRadius: 5,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        marginTop: 4,
        marginBottom: 4,
    },
    buyNowText: {
        fontSize: 12,
        color: COLORS.darkGray,
        fontWeight: '500',
    },
    deliveryText: {
        fontSize: 11,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    deliveryDate: {
        fontWeight: 'bold',
        color: COLORS.deliveryGreen,
    },
    productRating: {
        fontSize: 13,
        color: COLORS.darkGray,
        marginTop: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    noResultsText: {
        textAlign: "center",
        marginTop: 30,
        fontSize: 14,
        color: COLORS.darkGray,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        width: "85%",
        maxHeight: "60%",
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: COLORS.text,
    },
    modalOptionButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    modalOptionButtonSelected: {
        backgroundColor: COLORS.primary,
        borderRadius: 6,
    },
    modalOptionText: {
        fontSize: 15,
        color: COLORS.text,
    },
    modalOptionTextSelected: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        marginTop: 15,
        backgroundColor: COLORS.darkGray,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    modalCloseButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "bold",
    },
    goToTopButton: {
        position: 'absolute',
        bottom: 45,
        right: 20,
        backgroundColor: COLORS.primary,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        zIndex: 2,
        borderWidth: 1,
        borderColor: COLORS.addedGreen,
    },
});