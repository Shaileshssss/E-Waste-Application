import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Animated, Text, StyleSheet } from "react-native";

export type ToastHandle = { show: (msg: string, type?: "success" | "error") => void };

const Toast = forwardRef<ToastHandle>((_, ref) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error">("success");
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    show: (msg, t = "success") => {
      setMessage(msg);
      setType(t);
      setVisible(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      setTimeout(() => Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setVisible(false)), 3000);
    },
  }));

  if (!visible) return null;
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: type === "success" ? "#4CAF50" : "#F44336" }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: "91%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
  },
  text: { color: "#fff", fontSize: 14, textAlign: "center" },
});

export default Toast;
