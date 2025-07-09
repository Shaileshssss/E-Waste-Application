// app/(auth)/sign-up.tsx
import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Animated,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import Toast, { ToastHandle } from "@/components/Toast";
import { COLORS } from "@/constants/theme";
import { Link } from "expo-router";

enum Step {
  EnterCredentials,
  EnterCode,
}

export default function SignUp() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const toastRef = useRef<ToastHandle>(null);

  const [step, setStep] = React.useState<Step>(Step.EnterCredentials);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const scale = React.useRef(new Animated.Value(1)).current;

  const animate = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const show = (msg: string, type: "success" | "error" = "success") => {
    toastRef.current?.show(msg, type);
  };

  const sendCode = async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password)
      return show("Enter email & password", "error");

    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep(Step.EnterCode);
      show("Verification code sent!", "success");
    } catch (err: any) {
      show(err.message || "Error creating account", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndFinish = async () => {
    if (!isLoaded) return;
    if (code.length === 0) return show("Enter the verification code", "error");

    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete" && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        show("Account created successfully!", "success");
        router.replace("/(tabs)");
      } else {
        show("Verification failed", "error");
      }
    } catch (err: any) {
      show(err.message || "Invalid code", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.card}>
        <Text style={styles.title}>
          {step === Step.EnterCredentials
            ? "Create Account"
            : "Enter Verification Code"}
        </Text>

        {step === Step.EnterCredentials ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Create Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Animated.View style={{ transform: [{ scale }] }}>
              <Pressable
                style={[styles.button, loading && styles.disabled]}
                onPressIn={animate}
                onPressOut={animate}
                onPress={sendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Code</Text>
                )}
              </Pressable>
            </Animated.View>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Verification Code"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
            <Animated.View style={{ transform: [{ scale }] }}>
              <Pressable
                style={[styles.button, loading && styles.disabled]}
                onPressIn={animate}
                onPressOut={animate}
                onPress={verifyAndFinish}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </Pressable>
            </Animated.View>
          </>
        )}

        <Text style={styles.footer}>
          Already have an account?{" "}
          <Link href="/(auth)/login" style={styles.linkText}>
            Sign In
          </Link>
        </Text>
      </View>
      <Toast ref={toastRef} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f2f2f7",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f9fafc",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.7 },
  footer: { textAlign: "center", marginTop: 16, color: "#666" },
  linkText: { color: COLORS.primary, fontWeight: "600" },
});
