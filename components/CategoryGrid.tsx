// components/CategoryGrid.tsx
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router"; // Import useRouter
import { COLORS } from "@/constants/theme"; // Assuming COLORS is defined here

const categories = [
  { name: "Laptops", Image: require("../assets/categories/71qiPf4GlIL.jpg") },
  { name: "Smartphones", Image: require("../assets/categories/oneplus-6.png") },
  { name: "Accessories", Image: require("../assets/categories/accessories.png") },
  { name: "PC Components", Image: require("../assets/categories/Pc_components.jpg") },
  { name: "Audio", Image: require("../assets/categories/audio-speaker-21.png") },
  { name: "Cameras", Image: require("../assets/categories/photo_camera_PNG7850.png") },
];

export default function CategoryGrid() {
  const router = useRouter(); // Initialize the router hook

  // Function to handle category press and navigate
  const handleCategoryPress = (categoryName: string) => {
    console.log("Navigating to:", "/products/MoreProducts", "with category:", categoryName);
    router.push({
      // --- IMPORTANT: This pathname must match your file structure ---
      // If your MoreProducts.tsx is at app/products/MoreProducts.tsx, this is correct.
      // If it's at app/MoreProducts.tsx, change to "/MoreProducts".
      pathname: "/products/MoreProducts",
      params: { category: categoryName }, // Pass the category name as a parameter
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Categories</Text>
      <Text style={styles.subtitle}>Quickly find out our Refurbished Product's</Text>

      <View style={styles.grid}>
        {categories.map((item, index) => (
          <TouchableOpacity // Make each category tile clickable
            key={index}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(item.name)} // Call handler with category name
          >
            <Image source={item.Image} style={styles.categoryImage} resizeMode="cover" />
            <Text style={styles.categoryName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* "View More..." button to show all products */}
      <TouchableOpacity
        style={styles.viewMoreButton}
        onPress={() => handleCategoryPress("All")} // Pass "All" to display all products
      >
        <Text style={styles.viewMoreText}>View More...</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryItem: {
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
  },
  categoryImage: {
    width: 125,
    height: 110,
    borderRadius: 2,
  },
  categoryName: {
    marginTop: 8,
    fontWeight: "600",
    textAlign: 'center',
  },
  viewMoreButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  viewMoreText: {
    color: "#007bff",
    fontWeight: "bold",
  },
});
