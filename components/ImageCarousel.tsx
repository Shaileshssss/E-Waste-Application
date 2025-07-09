import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from 'expo-router'; // Import useRouter

const { width } = Dimensions.get("window");

// Define a type for your specific internal route to MoreProducts.tsx
type MoreProductsRoute = {
  // The pathname now directly points to your file: app/products/MoreProducts.tsx
  pathname: "/products/MoreProducts";
  // No 'params' needed as it's not a dynamic route like '[id]'
};

// Update image list with internal paths to MoreProducts
const images: { id: string; uri: string; path: MoreProductsRoute }[] = [
  // All carousel images will now navigate to app/products/MoreProducts.tsx
  { id: "1", uri: "https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500", path: { pathname: "/products/MoreProducts" } },
  { id: "2", uri: "https://cdn.pixabay.com/photo/2015/05/15/02/07/computer-767781_1280.jpg", path: { pathname: "/products/MoreProducts" } },
  { id: "3", uri: "https://cdn.pixabay.com/photo/2019/11/23/11/33/mobile-phone-4646854_640.jpg", path: { pathname: "/products/MoreProducts" } },
  { id: "4", uri: "https://media.istockphoto.com/id/1270583054/photo/selective-focus-at-router-internet-router-on-working-table-with-blurred-man-connect-the-cable.jpg?s=612x612&w=0&k=20&c=p50-auMwqE02dBP3RicRfZxh3NLyfwFhThBEPsX9Wrg=", path: { pathname: "/products/MoreProducts" } },
  { id: "5", uri: "https://media.istockphoto.com/id/1094166778/photo/close-up-of-an-open-refrigerator.jpg?s=612x612&w=0&k=20&c=5Z6xs_Z25xyDBEg4HYxXf87M3N4vj6a5raxA7kET-Rw=", path: { pathname: "/products/MoreProducts" } },
];

export default function ImageCarousel() {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
      const interval = setInterval(() => {
        let nextIndex = (currentIndex + 1) % images.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      }, 3000);

      return () => clearInterval(interval);
    }, [currentIndex]);

    // handleImagePress now expects the specific MoreProductsRoute type
    const handleImagePress = (path: MoreProductsRoute) => {
      router.push(path); // Pass the object directly to router.push
    };

    const handleScroll = (event: any) => {
      const index = Math.round(
        event.nativeEvent.contentOffset.x / width
      );
      setCurrentIndex(index);
    };

    return (
        <View>
          <FlatList
            ref={flatListRef}
            data={images}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              // Pass item.path (which is now a MoreProductsRoute object) to handleImagePress
              <TouchableOpacity onPress={() => handleImagePress(item.path)}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.uri }} style={styles.image} />
                  <View style={styles.pagination}>
                    {images.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          currentIndex === index && styles.activeDot,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      );
    }

    const styles = StyleSheet.create({
      imageContainer: {
        position: "relative",
        width: width,
        height: 180,
      },
      image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
      },
      pagination: {
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
      },
      dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        marginHorizontal: 4,
      },
      activeDot: {
        backgroundColor: "#fff",
        width: 10,
        height: 10,
      },
    });