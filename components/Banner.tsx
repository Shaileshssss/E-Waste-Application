import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet, Dimensions, ImageSourcePropType } from 'react-native';

const { width } = Dimensions.get('window');

// --- Define your images for the marquee here ---
// IMPORTANT: Adjust these paths to your actual image locations.
// These are placeholders for demonstration.
const marqueeImages: ImageSourcePropType[] = [
  require("../assets/logo/hewlett-packard.png"), // Example: Laptop icon
  require("../assets/logo/intel.jpg"), // Example: Smartphone icon
  require("../assets/logo/acer.jpg"), // Example: Camera icon
  require("../assets/logo/LG_symbol.svg.png"), // Example: Generic icon
  // Add more images as needed for your banner
];

// Define a fixed width for each image in the marquee
const IMAGE_WIDTH = 80; // Adjust as needed
const IMAGE_MARGIN = 10; // Space between images

export default function MarqueeBanner() {
  // Calculate the total width of all images + their margins
  const totalContentWidth = marqueeImages.length * (IMAGE_WIDTH + IMAGE_MARGIN);

  // Animated value for horizontal scroll
  const scrollAnim = useRef(new Animated.Value(width)).current; // Start off-screen to the right

  useEffect(() => {
    const startMarquee = () => {
      // Animate from right (width) to left (-totalContentWidth)
      Animated.loop(
        Animated.timing(scrollAnim, {
          toValue: -totalContentWidth, // Scroll until all images have passed
          duration: totalContentWidth * 50, // Adjust duration based on content width for consistent speed
          useNativeDriver: true,
        })
      ).start();
    };

    startMarquee();
  }, [scrollAnim, totalContentWidth]); // Add totalContentWidth to dependencies

  return (
    <View style={styles.container}>
      {/* NEW: Heading for client partners */}
      <Text style={styles.clientPartnersHeading}>Our Client Partners</Text>

      <View style={styles.marqueeWrapper}>
        <Animated.View
          style={[
            styles.marqueeContent,
            { transform: [{ translateX: scrollAnim }] },
          ]}
        >
          {marqueeImages.map((imageSource, index) => (
            <Animated.Image
              key={index}
              source={imageSource}
              style={styles.marqueeImage}
              resizeMode="contain"
            />
          ))}
          {/* Duplicate images to create a seamless loop */}
          {marqueeImages.map((imageSource, index) => (
            <Animated.Image
              key={`duplicate-${index}`} // Use a different key for duplicates
              source={imageSource}
              style={styles.marqueeImage}
              resizeMode="contain"
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120, // Increased height to accommodate heading and images
    overflow: 'hidden',
    backgroundColor: '#def7e5',
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginVertical: 10,
  },
  clientPartnersHeading: { // NEW STYLE FOR THE HEADING
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
    textAlign: 'center',
    marginBottom: 10, // Space between heading and marquee
  },
  marqueeWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    marginHorizontal: IMAGE_MARGIN / 2,
    borderRadius: 8,
  },
});