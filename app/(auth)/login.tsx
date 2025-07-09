import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import { COLORS } from "@/constants/theme";
import Toast, { ToastHandle } from "@/components/Toast";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const toastRef = useRef<ToastHandle>(null);
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [eyePressed, setEyePressed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);

  const toggleVisibility = () => {
    setVisible((prev) => !prev);
    setEyePressed(true);
    setTimeout(() => setEyePressed(false), 300);
  };

  const showToast = (msg: string, type: "success" | "error" = "success") =>
    toastRef.current?.show(msg, type);

  const validateEmail = (inputEmail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inputEmail.trim()) {
      setEmailError("Email cannot be empty.");
      return false;
    } else if (!emailRegex.test(inputEmail)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmail = async () => {
    if (!signInLoaded) {
      showToast("Auth service loading...", "error");
      return;
    }

    const isEmailValid = validateEmail(email);
    if (!password) {
      showToast("Please enter your password.", "error");
      return;
    }
    if (!isEmailValid) {
      showToast(emailError || "Please fix email errors.", "error");
      return;
    }

    setLoading(true);
    try {
      const signInAttempt = await signIn.create({ identifier: email });

      if (signInAttempt.status === "needs_first_factor") {
        const result = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });

        if (result.status === "complete" && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          showToast("Welcome back!", "success");
          router.replace("/(tabs)");
        } else {
          showToast("Sign-in incomplete.", "error");
        }
      } else {
        showToast("Unexpected sign-in flow.", "error");
      }
    } catch (e: any) {
      let errorMessage = "Invalid credentials. Please try again.";
      if (e.errors?.[0]?.code === "form_password_incorrect") {
        errorMessage = "Incorrect password.";
      }
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive: active } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (createdSessionId && active) {
        await active({ session: createdSessionId });
        router.replace("/(tabs)");
      } else {
        showToast("Google sign-in incomplete.", "error");
      }
    } catch (e: any) {
      console.error("Google sign-in failed:", e);
      showToast(e.message || "Google sign-in failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    console.log("Guest access initiated");
    await AsyncStorage.setItem("guestUser", "true"); // Optional: store guest flag
    requestAnimationFrame(() => {
      router.replace("/(tabs)");
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Branding */}
          <View style={styles.brandSection}>
            <Text style={styles.appName}>E‑Waste♻️</Text>
            <Text style={styles.tagline}>Where old tech finds new purpose</Text>
          </View>

          {/* Illustration */}
          <Image
            source={require("../../assets/images/E-Wate_login_auth.png")}
            style={styles.illustration}
            resizeMode="contain"
          />

          {/* Login Section */}
          <View style={styles.loginSection}>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="Email"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onBlur={() => validateEmail(email)}
              editable={!loading}
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            <View
              style={[
                styles.passwordContainer,
                eyePressed && styles.passwordContainerActive,
              ]}
            >
              <TextInput
                style={styles.inputFlex}
                placeholder="Password"
                placeholderTextColor={COLORS.darkGray}
                secureTextEntry={!visible}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <Pressable onPress={toggleVisibility} style={styles.eyeButton}>
                <Ionicons
                  name={visible ? "eye" : "eye-off"}
                  size={20}
                  color={eyePressed ? COLORS.primary : COLORS.darkGray}
                />
              </Pressable>
            </View>

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.authButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.separator}>— Or sign in with Google —</Text>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogle}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={20} color={COLORS.primary} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.googleButton, { marginTop: 12 }]}
              onPress={handleGuestAccess}
              disabled={loading}
            >
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              <Text style={styles.googleButtonText}>Continue as Guest</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Link href="/(auth)/sign-up" style={styles.linkText}>
                Sign Up
              </Link>
            </Text>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
      <Toast ref={toastRef} />
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: COLORS.brand, // Using COLORS.background for consistency
  },
  scrollContent: {
    flexGrow: 1, // Ensures content takes full height and allows scrolling
    justifyContent: "center", // Center content vertically
    paddingVertical: 1, // Add vertical padding for better spacing
  },
  container: {
    flex: 1, // Allows content to fill space
    alignItems: "center", // Center horizontally
    paddingHorizontal: 10, // Horizontal padding for content
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 10, // Increased margin for spacing
  },
  appName: {
    fontSize: 32, // Larger font size
    fontWeight: "bold",
    color: COLORS.primary, // Using primary color for app name
    marginBottom: 8, // Space between app name and tagline
  },
  tagline: {
    fontSize: 16,
    color: COLORS.darkGray, // Softer text color
    textAlign: "center",
    paddingHorizontal: 20, // Prevent text from going to edges
  },
  illustration: {
    width: 229, // Fixed width for better control
    height: 225, // Fixed height
    marginVertical: 20, // Increased vertical margin
    borderRadius: 15, // Rounded corners for image
    resizeMode: "contain", // Ensure image fits without cropping
  },
  loginSection: {
    width: "100%", // Take full width
    maxWidth: 360, // Max width for content section for better readability on large screens
    alignItems: "center", // Center buttons and inputs
    paddingHorizontal: 0, // Removed inner padding, container handles it
  },
  errorText: {
    color: COLORS.error, // Red color for error message
    fontSize: 12,
    alignSelf: "flex-start", // Align error text to the left
    marginLeft: 5, // Small indent
    marginBottom: 10, // Space below error message
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: -10, // Space above Google button
    marginBottom: 0, // Remove bottom margin if separator/footer follows directly
  },
  googleButtonText: {
    color: COLORS.text,
    fontWeight: "600",
    marginLeft: 12,
    fontSize: 16,
  },
  separator: {
    textAlign: "center",
    marginVertical: 25, // Space around separator
    color: COLORS.darkGray,
    fontSize: 14,
    width: "100%",
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: COLORS.text,
    width: "100%",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: COLORS.error,
    marginBottom: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    backgroundColor: COLORS.white,
    width: "100%",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainerActive: {
    // Removed yellow background, now it only changes border color
    borderColor: COLORS.primary,
  },
  inputFlex: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeButton: {
    padding: 15,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  authButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  footerText: {
    textAlign: "center",
    marginTop: 25,
    color: COLORS.darkGray,
    fontSize: 14,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  termsText: {
    textAlign: "center",
    color: COLORS.darkGray,
    fontSize: 12,
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
