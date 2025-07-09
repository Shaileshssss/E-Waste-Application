import { COLORS } from "@/constants/theme";
import { Image } from "expo-image"; // Ensure Image is imported from expo-image
import { ActivityIndicator, View, Text, StyleSheet } from "react-native"; // Added StyleSheet
import LottieView from "lottie-react-native"; // Ensure LottieView is imported from lottie-react-native

export function Loader() {

const lottieAnimationSource = require("../assets/lottie/loading.json")

    return (
        <View style={loaderStyles.container}>
            <LottieView 
            source={lottieAnimationSource}
            autoPlay
            loop
            style={loaderStyles.lottieAnimation}
            />
            <Text style={loaderStyles.loadingText}>Loading...</Text>
            {/* <ActivityIndicator size="large" color={COLORS.primary} style={loaderStyles.activityIndicator} /> */}
        </View>
    );
}

// --- NEW LOCAL STYLES FOR LOADER COMPONENT ---
const loaderStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white, // Background color for the loader screen
    },
    lottieAnimation: {
        width: 150, // Smaller size for an "illustrated image"
        height: 150,
        marginBottom: 20, // Space below the image
        borderRadius: 10, // Slightly rounded corners for the image
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.gray, // A subtle color for the loading text
        marginBottom: 15, // Space below the text
    },
    activityIndicator: {
        // No specific styles needed here, ActivityIndicator sizes itself
    },
});