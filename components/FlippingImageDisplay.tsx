// components/FlippingImageDisplay.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, StyleSheet, Dimensions, ImageSourcePropType, Easing, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter

const { width } = Dimensions.get('window');

// --- Images for the flipping display with associated categories ---
// IMPORTANT: Update these paths and categories to your actual data.
// The 'category' field MUST match the categories in your allProducts.ts
const displayImages = [
  { image: require("../assets/images/red-usb-charger.jpg"), category: "Accessories" },
  { image: require("../assets/images/loudspeaker-soundbar.png"), category: "Audio" },
  { image: require("../assets/images/galaxys21.jpg"), category: "Smartphones" },
  { image: require("../assets/images/ChatGPT.png"), category: "Laptops" }, // Example: assuming this is a laptop image
  { image: require("../assets/images/battery.jpg"), category: "Accessories" },
  { image: require("../assets/images/12.png"), category: "PC Components" }, // Example: assuming this is a PC component image
];

const CARD_SIZE = 200; // Desired size for the square flipping card (width and height)
const FLIP_DURATION = 1200; // Duration of one flip animation (1.2 seconds)
const PAUSE_DURATION = 1300; // Time the card stays "flipped" before resetting for the next flip (Added this line)
const INTERVAL_TIME = 3500; // Time between the start of each flip (3.5 seconds, > FLIP_DURATION)

export default function FlippingImageDisplay() {
  const router = useRouter(); // Initialize useRouter
  const [currentIndex, setCurrentIndex] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimationCycle = () => {
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: FLIP_DURATION,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
        flipAnim.setValue(0);
        setTimeout(startAnimationCycle, PAUSE_DURATION); // Use PAUSE_DURATION
      });
    };

    // Corrected to use TOTAL_CYCLE_DURATION for initial interval, then self-perpetuating setTimeout
    // Note: TOTAL_CYCLE_DURATION was not defined, so using INTERVAL_TIME for the initial delay
    const initialTimeout = setTimeout(startAnimationCycle, INTERVAL_TIME);

    return () => clearTimeout(initialTimeout); // Clear initial timeout on unmount
  }, [flipAnim, displayImages.length]);

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const rotateX = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.51, 1],
    outputRange: [1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.51, 1],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp',
  });

  const currentItem = displayImages[currentIndex];
  const nextItem = displayImages[(currentIndex + 1) % displayImages.length];

  // --- Handle image press to navigate ---
  const handleImagePress = () => {
    console.log("Flipping image clicked. Navigating to category:", currentItem.category);
    router.push({
      pathname: "/flipper/FlippingImageDetailScreen",
      params: { category: currentItem.category }, // Pass the category of the currently displayed image
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sponsered Items</Text>

      <TouchableOpacity // --- NEW: Wrap the Animated.View with TouchableOpacity ---
        style={styles.cardWrapper}
        onPress={handleImagePress} // Add the press handler
        activeOpacity={0.7} // Visual feedback on press
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { perspective: 1000 },
                { rotateY: rotateY },
                { rotateX: rotateX },
              ],
            },
          ]}
        >
          {/* Front Face: Displays the current image */}
          <Animated.Image
            source={currentItem.image} // Access image from currentItem
            style={[
              styles.face,
              styles.frontFace,
              { opacity: frontOpacity },
            ]}
            resizeMode="contain"
          />

          {/* Back Face: Displays the next image */}
          <Animated.Image
            source={nextItem.image} // Access image from nextItem
            style={[
              styles.face,
              styles.backFace,
              { opacity: backOpacity },
            ]}
            resizeMode="contain"
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 5,
    padding: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  cardWrapper: { // This style is now applied to TouchableOpacity
    width: CARD_SIZE,
    height: CARD_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  face: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f0f0f0',
  },
  frontFace: {
    // No additional transform needed
  },
  backFace: {
    transform: [{ rotateY: '180deg' }, { rotateX: '180deg' }],
  },
});