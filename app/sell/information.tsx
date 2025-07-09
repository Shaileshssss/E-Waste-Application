import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router"; // Import Link and useRouter for navigation
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for an icon
import { COLORS } from "@/constants/theme"; // Assuming COLORS is defined here

export default function Information() {
    const router = useRouter(); // Initialize router for navigation

    return (
        <SafeAreaView style={infoStyles.safeArea}>
            <View style={infoStyles.container}>
                <View style={infoStyles.card}>
                    <Text style={infoStyles.heading}>Sell Your Old Products To Us...</Text>
                    <Text style={infoStyles.infoText}>
                        Have old electronics, gadgets, or appliances gathering dust? Don't just trash them!
                        By selling your pre-loved items, you not only declutter your space but also
                        contribute to a sustainable future.
                    </Text>
                    <Text style={infoStyles.infoText}>
                        We ensure that your old products are either given a new life through resale
                        or are properly recycled, preventing harmful materials from polluting our environment.
                        It's good for your wallet, and great for the planet!
                    </Text>

                    {/* The Link button to navigate to the selling page */}
                    <Link href="/sell/informationList" asChild>
                        <TouchableOpacity style={infoStyles.sellButton}>
                            <Ionicons name="add-circle-outline" size={22} color={COLORS.white} />
                            <Text style={infoStyles.sellButtonText}>List Your Product Now</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}

// --- NEW LOCAL STYLES FOR INFORMATION SCREEN ---
const infoStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.brand, // Set background color for the entire screen
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5, // Padding around the card
    },
    card: {
        backgroundColor: COLORS.white, // White background for the box
        borderRadius: 15,
        padding: 25,
        alignItems: 'center', // Center content horizontally within the card
        shadowColor: COLORS.black, // Shadow for depth
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6, // Android shadow
        maxWidth: 400, // Max width for larger screens
        width: '100%', // Take full width up to maxWidth
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
        textAlign: 'center',
    },
    icon: {
        marginBottom: 20,
    },
    infoText: {
        fontSize: 15,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 15, // Space between paragraphs
        lineHeight: 22, // Improve readability
    },
    sellButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary, // Button background color
        paddingVertical: 14,
        paddingHorizontal: 25,
        borderRadius: 10,
        marginTop: 20, // Space above the button
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    sellButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: 'bold',
        marginLeft: 10, // Space between icon and text
    },
});