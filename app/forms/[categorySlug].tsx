import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/theme";
import { ProductForm } from "@/components/ProductForm";

import Laptop from './components/Laptop';
import Mobile from './components/Mobile';
import Computer from './components/Computer';
import TelePhone from './components/TelePhone';
import Remote from './components/Remote';
import CablesAndWires from './components/Cables';
import WifiRouter from './components/WifiRouter';
import LithiumBattery from './components/LithiumBattery';
import Appliances from './components/Appliances';

const CATEGORY_FORM_CONFIG: { [key: string]: {
    displayName: string;
    osOptions?: string[];
    brandOptions: string[];
}} = {
    "Laptop": {
        displayName: "Laptops & Tablets",
        osOptions: ["Windows", "macOS", "ChromeOS", "Linux"],
        brandOptions: ["Apple", "Dell", "HP", "Lenovo", "Acer", "Asus", "Microsoft", "Samsung", "Other"],
    },
    "Computer": {
        displayName: "Computers & Printers",
        osOptions: ["Windows", "macOS", "Linux", "No OS"],
        brandOptions: ["Dell", "HP", "Canon", "Epson", "Brother", "Intel", "AMD", "Nvidia", "Kingston", "Samsung", "Western Digital", "Seagate", "Corsair", "Asus", "Gigabyte", "MSI", "Other"],
    },
    "Mobile": {
        displayName: "Mobile Phones",
        osOptions: ["Android", "iOS", "KaiOS", "Other"],
        brandOptions: ["Apple", "Samsung", "Xiaomi", "OnePlus", "Google", "Realme", "Oppo", "Vivo", "Nokia", "Other"],
    },
    "Telephone": {
        displayName: "Telephones",
        brandOptions: ["Panasonic", "Gigaset", "Motorola", "Siemens", "Cisco", "Polycom", "Other"],
    },
    "Remote": {
        displayName: "Remotes",
        brandOptions: ["Universal", "LG", "Samsung", "Sony", "Philips", "Tata Sky", "Dish TV", "Airtel", "Other"],
    },
    "Cables": {
        displayName: "Cables & Wires",
        brandOptions: ["Belkin", "Anker", "Cable Matters", "UGreen", "Amazon Basics", "Local Brand", "Other"],
    },
    "WifiRouter": {
        displayName: "WIFI Devices",
        brandOptions: ["TP-Link", "Netgear", "D-Link", "Asus", "Linksys", "Google Nest", "Other"],
    },
    "LithiumBattery": {
        displayName: "Lithium Batteries",
        brandOptions: ["Samsung", "LG", "Panasonic", "Sony", "EVE", "CATL", "Other"],
    },
    "Appliances": {
        displayName: "Micro oven & Fridge",
        brandOptions: ["LG", "Samsung", "Whirlpool", "Bosch", "Panasonic", "Sony", "Philips", "Haier", "Godrej", "Bajaj", "Other"],
    },
};

export default function DynamicCategoryFormScreen() {
    const router = useRouter();
    const { categorySlug, displayCategoryName } = useLocalSearchParams();

    const config = CATEGORY_FORM_CONFIG[categorySlug as string];

    if (!config || typeof displayCategoryName !== 'string') {
        return (
            <SafeAreaView style={styles.container}>
                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)')}
                    style={styles.closeButton}>
                    <Ionicons name="close-circle" size={36} color={COLORS.red} />
                </TouchableOpacity>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Form not available for this category</Text>
                    <Text style={styles.subErrorText}>Category "{categorySlug || 'Unknown'}" not found or data missing.</Text>
                    <Text style={styles.subErrorText}>Please select a valid e-waste category from the list.</Text>
                    <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.errorBackButton}>
                        <Text style={styles.errorBackButtonText}>Go to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const renderForm = () => {
        switch (categorySlug) {
            case "Laptop": return <Laptop displayCategoryName={displayCategoryName} />;
            case "Mobile": return <Mobile displayCategoryName={displayCategoryName} />;
            case "Computer": return <Computer displayCategoryName={displayCategoryName} />;
            case "TelePhone": return <TelePhone displayCategoryName={displayCategoryName} />;
            case "Remote": return <Remote displayCategoryName={displayCategoryName} />;
            case "Cables": return <CablesAndWires displayCategoryName={displayCategoryName} />;
            case "WifiRouter": return <WifiRouter displayCategoryName={displayCategoryName} />;
            case "LithiumBattery": return <LithiumBattery displayCategoryName={displayCategoryName} />;
            case "Appliances":
                return <Appliances />;
            default:
                return (
                    <ProductForm
                        category={config.displayName}
                        osOptions={config.osOptions}
                        brandOptions={config.brandOptions}
                    />
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                onPress={() => router.replace('/(tabs)')}
                style={styles.closeButton}>
                <Ionicons name="close-circle" size={36} color={COLORS.red} />
            </TouchableOpacity>
            {renderForm()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.brand,
        padding: 10,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    },
    closeButton: {
        position: "absolute",
        top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 45,
        right: 15,
        zIndex: 10,
        padding: 5,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.white,
        borderRadius: 15,
        margin: 20,
    },
    errorText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.red,
        textAlign: 'center',
        marginBottom: 10,
    },
    subErrorText: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 5,
    },
    errorBackButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    errorBackButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});