// app/category/[id].tsx

import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiImage } from "moti";
import { Easing } from "react-native-reanimated";

import { COLORS } from "@/constants/theme";
import {
  EWASTE_CATEGORIES,
  EwasteCategoryItemData,
} from "@/constants/ewasteCategories";

const { width, height } = Dimensions.get("window");

const FIXED_HEADER_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 50 : 100;

export default function CategoryDetailPage() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const categoryId = params.id as string;
  const categoryData: EwasteCategoryItemData | undefined =
    EWASTE_CATEGORIES.find((item) => item.id === categoryId);

  const displayCategoryName = categoryData?.categoryName || "E-Waste Category";
  const avatar =
    categoryData?.avatar ||
    "https://placehold.co/400x300/F0F0F0/808080?text=No+Image";
  const title = categoryData?.title || "Information not available.";
  const information =
    categoryData?.information || "No detailed information available.";
  const routeSlug = categoryData?.routeSlug;

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, height * 0.1],
    outputRange: [COLORS.lightGray, COLORS.white],
    extrapolate: "clamp",
  });

  const handleFormRedirect = () => {
    if (routeSlug) {
      router.push({
        pathname: `/forms/${routeSlug}` as any,
        params: { displayCategoryName: displayCategoryName },
      });
    } else {
      console.warn("No routeSlug found for this category.");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.fixedHeader, { backgroundColor: headerBackgroundColor }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.fixedHeaderTitle}>{displayCategoryName}</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: FIXED_HEADER_HEIGHT + 20 },
        ]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.contentCard}>
          <MotiImage
            source={{ uri: avatar }}
            style={styles.categoryImage}
            resizeMode="cover"
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "timing",
              duration: 600,
              easing: Easing.out(Easing.exp),
            }}
          />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.information}>{information}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.bottomButton}
        onPress={handleFormRedirect}
      >
        <Text style={styles.buttonText}>Sell your e-waste</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: FIXED_HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 40,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    backgroundColor: COLORS.white,
    elevation: 5,
    zIndex: 10,
  },
  headerBackButton: {
    padding: 4,
  },
  fixedHeaderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginRight: 30, // compensate for back icon space
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
  },
  categoryImage: {
    width: width * 0.4,
    aspectRatio: 1,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  information: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: "center",
  },
  bottomButton: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "600",
  },
});
