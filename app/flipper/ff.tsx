import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AnimatedReanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Assuming COLORS is available from your theme constants.
const COLORS = {
  primary: '#4CAF50', // Green
  accent: '#FFC107',  // Amber/Orange for emphasis
  text: '#333333',
  lightText: '#666666',
  background: '#F0F4F8',
  white: '#FFFFFF',
  red: '#F44336',
  info: '#2196F3',
};

interface CoverageAndLeadershipCardProps {
  // Props remain the same
}

const CoverageAndLeadershipCard: React.FC<CoverageAndLeadershipCardProps> = () => {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current; // For the outlet text pulse

  // Animation values for the small flag icon's subtle wave and pulse
  const flagWaveTranslateX = useSharedValue(0);
  const flagScale = useSharedValue(1);

  // Pulse animation for the outlet count text
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1, // Slightly larger pulse
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, // Back to normal
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  // Waving and pulsing animation for the small flag icon
  useEffect(() => {
    // Horizontal wave
    flagWaveTranslateX.value = withRepeat(
      withTiming(5, { duration: 1000, easing: Easing.linear }), // Move right by 5 units
      -1, // Repeat indefinitely
      true // Reverse direction
    );

    // Subtle scale pulse for the flag
    flagScale.value = withRepeat(
      withTiming(1.05, { duration: 800, easing: Easing.ease }), // Scale up slightly
      -1, // Repeat indefinitely
      true // Reverse direction
    );
  }, [flagWaveTranslateX, flagScale]);


  const handleLearnMorePress = () => {
    router.push('/dashboard-details/collection-points-map');
  };

  const animatedFlagStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: flagWaveTranslateX.value },
        { scale: flagScale.value },
      ],
    };
  });

  return (
    <View style={cardStyles.container}>
      <Text style={cardStyles.mainHeading}>
        We are the Leading E-waste Recycler in India!
      </Text>

      <View style={cardStyles.contentWrapper}>
        <Text style={cardStyles.subText}>
          Making a greener India possible with our extensive network.
        </Text>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Text style={cardStyles.outletTextContainer}> {/* Use a View to wrap text and flag */}

            {' '}<Text style={cardStyles.outletCount} onPress={handleLearnMorePress}>80+</Text> Outlets Across   India {' '}
            <AnimatedReanimated.Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png' }} // REPLACE THIS URL WITH YOUR ACTUAL FLAG IMAGE
              style={[cardStyles.flagIcon, animatedFlagStyle]}
              resizeMode="contain"
            />
          </Text>
        </Animated.View>
        <Text style={cardStyles.subTextSmall}>
            Find a convenient location near you to recycle responsibly.
        </Text>
      </View>

      <TouchableOpacity
        style={cardStyles.button}
        onPress={handleLearnMorePress}
      >
        <Text style={cardStyles.buttonText}>Find Out More</Text>
      </TouchableOpacity>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    overflow: 'visible', // Changed to visible so animated flag doesn't get clipped if it moves too far
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 32,
  },
  contentWrapper: {
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  subText: {
    fontSize: 16,
    color: COLORS.lightText,
    textAlign: 'center',
    marginBottom: 10,
  },
  outletTextContainer: { // New style for the wrapper around text and flags
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20, // Base font size
    fontWeight: 'bold',
    color: COLORS.accent,
    textAlign: 'center',
    paddingVertical: 5,
  },
  outletCount: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '900',
  },
  flagIcon: {
    width: 49,  // Size of the flag icon
    height: 40, // Size of the flag icon
    marginHorizontal: 5, // Space around the flag
  },
  subTextSmall: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 5,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '700',
  },
});

export default CoverageAndLeadershipCard;
