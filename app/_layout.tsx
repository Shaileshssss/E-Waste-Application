// app/_layout.tsx
import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClertkAndConvexProvider";
import { useFonts } from "expo-font";
import { SplashScreen, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "@/constants/theme";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import { NetworkProvider } from "@/providers/NetworkProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrainsMonoNL-Regular": require("../assets/fonts/JetBrainsMonoNL-Regular.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("white");
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  const router = useRouter();
  const [guestChecked, setGuestChecked] = useState(false);

  useEffect(() => {
    const checkGuestSession = async () => {
      const isGuest = await AsyncStorage.getItem("guest");
      if (isGuest === "true") {
        console.log("✅ Guest session found. Redirecting to /tabs");
        router.replace("/(tabs)");
      }
      setGuestChecked(true);
    };

    if (!guestChecked && router) {
      checkGuestSession();
    }
  }, [router, guestChecked]);

  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NetworkProvider>
          <ClerkAndConvexProvider>
            <SafeAreaProvider>
              <SafeAreaView
                style={{ flex: 1, backgroundColor: COLORS.brand }}
                onLayout={onLayoutRootView}
              >
                <InitialLayout />
              </SafeAreaView>
            </SafeAreaProvider>
            <StatusBar style="dark" />
          </ClerkAndConvexProvider>
        </NetworkProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  );
}
