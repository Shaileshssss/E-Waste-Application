// components/GuestLoginButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";
import { markGuestSessionStarted } from "@/utils/guestToken";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GuestLoginButton = () => {
  const router = useRouter();

  const handleGuestAccess = () => {
    console.log("Guest access initiated");

    // Navigate to tabs or home
    router.replace("/(tabs)");

    // Optional: You could set a flag in async storage or context
    // to indicate guest access
  };

  return (
<TouchableOpacity
  onPress={async () => {
    markGuestSessionStarted();
    await AsyncStorage.setItem("guestToken", "guest");
    console.log("🔵 Guest access initiated");
    router.replace("/(tabs)");
  }}
>
  <Text>Continue as Guest</Text>
</TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.success,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default GuestLoginButton;
