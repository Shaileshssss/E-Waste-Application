import React, { useState, useRef, useEffect } from 'react'; // Added useRef and useEffect
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Animated, // Import Animated
  Dimensions, // Import Dimensions to get screen height
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from "@/constants/theme";
import LottieView from 'lottie-react-native';

const screenHeight = Dimensions.get('window').height; // Get screen height once

export default function OrderConfirmationScreen() {
  const router = useRouter();
  // State to control whether Lottie animation or the static icon is shown
  const [lottieAnimationFinished, setLottieAnimationFinished] = useState(false);
  const [lottieLoaded, setLottieLoaded] = useState(false); // To show loading while Lottie data loads
  const [showBackgroundAnimation, setShowBackgroundAnimation] = useState(false); // New state to trigger background animation

  // Animated value for the background height
  const animatedBackgroundHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lottieAnimationFinished) {
      // Once Lottie finishes, set state to show background animation
      setShowBackgroundAnimation(true);
      // Start the background height animation
      Animated.timing(animatedBackgroundHeight, {
        toValue: screenHeight, // Animate height to full screen height
        duration: 800, // Duration of the background fill animation
        useNativeDriver: false, // 'height' property does not support native driver
      }).start(() => {
        // Optional: Do something after background animation completes
        // For example, you might want to change text color to white here if it becomes green
      });
    }
  }, [lottieAnimationFinished, animatedBackgroundHeight]); // Re-run effect when lottieAnimationFinished changes

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated Background Overlay - rendered only when triggered */}
      {showBackgroundAnimation && (
        <Animated.View
          style={[
            styles.animatedBackground,
            { height: animatedBackgroundHeight }, // Bind height to animated value
          ]}
        />
      )}

      {/* Main Content - ensure it's above the animated background */}
      <View style={[styles.content, { zIndex: 1 }]}>
        {/* Conditional rendering: Show Lottie until animation finishes, then show Ionicons */}
        {!lottieAnimationFinished ? (
          <View style={styles.lottieIconContainer}>
            <LottieView
              // IMPORTANT: Replace with your actual Lottie JSON file path
              source={require('@/assets/lottie/cart_added_successfully.json')} // Ensure this path is correct
              autoPlay
              loop={false} // Ensure it plays only once
              style={styles.lottieIconAnimation}
              onAnimationFinish={() => {
                setLottieAnimationFinished(true); // Lottie animation is done
              }}
              onLayout={() => setLottieLoaded(true)} // Lottie JSON data has loaded
            />
            {!lottieLoaded && (
              // Show a small activity indicator while Lottie JSON loads
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.lottieLoadingOverlay} />
            )}
          </View>
        ) : (
          // Once Lottie animation is done, display the static checkmark icon
          <Ionicons name="checkmark-circle-outline" size={100} color={COLORS.white} />
        )}

        <Text style={[styles.title, showBackgroundAnimation && styles.whiteText]}>Order Placed Successfully!</Text>
        <Text style={[styles.subtitle, showBackgroundAnimation && styles.whiteText]}>Your order has been confirmed.</Text>
        <Text style={[styles.infoText, showBackgroundAnimation && styles.whiteText]}>You can view your order details in the "Last Order" section of your profile.</Text>

        <TouchableOpacity
          onPress={() => router.replace('/dashboard-details/last-order-screen')}
          style={[styles.viewLastOrderButton, showBackgroundAnimation && styles.darkGrayButton]}
        >
          <Text style={styles.viewLastOrderButtonText}>View My Last Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={[styles.continueShoppingButton, showBackgroundAnimation && styles.whiteButton]}
        >
          <Text style={styles.continueShoppingButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white, // Initial background color
  },
  // New style for the animating background view
  animatedBackground: {
    position: 'absolute',
    bottom: 0, // Starts from the bottom
    left: 0,
    right: 0,
    backgroundColor: COLORS.success, // The color to animate to
    // height will be animated
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // zIndex is crucial to keep this content on top of the absolutely positioned animated background
    zIndex: 1,
  },
  // Styles for the Lottie icon container
  lottieIconContainer: {
    width: 100, // Same width as Ionicons size
    height: 100, // Same height as Ionicons size
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  lottieIconAnimation: {
    width: '100%', // Make Lottie fill its container
    height: '100%', // Make Lottie fill its container
  },
  lottieLoadingOverlay: {
    position: 'absolute', // Overlay the loading indicator
  },
  // Text color adjustments for better contrast after background animation
  whiteText: {
    color: COLORS.white, // Change text to white when background is green
  },
  // Button background color adjustments
  darkGrayButton: {
    backgroundColor: '#333', // A darker shade for contrast, or another suitable color
  },
  whiteButton: {
    backgroundColor: COLORS.white, // White button on green background
  },
  // Existing styles (copied for completeness, modify if needed for contrast)
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.text, // Default color
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray, // Default color
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray, // Default color
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  viewLastOrderButton: {
    backgroundColor: COLORS.darkGray, // Default color
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  viewLastOrderButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueShoppingButton: {
    backgroundColor: COLORS.primary, // Default color
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
});