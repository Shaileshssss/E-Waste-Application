import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme"; // Update path as needed

const TrustAndCompliance: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />{" "}
        We’re Government Compliant
      </Text>

      <Image
        source={require("../../assets/images/Electrician-pana.png")}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.card}>
        <MaterialIcons name="gavel" size={24} color={COLORS.primary} />
        <Text style={styles.cardText}>
          We comply with all State and Central Government e-Waste handling laws and environmental standards.
        </Text>
      </View>

      <View style={styles.card}>
        <MaterialIcons name="eco" size={24} color={COLORS.green} />
        <Text style={styles.cardText}>
          All electronics are processed in certified recycling facilities with zero landfill policies.
        </Text>
      </View>

      <View style={styles.card}>
        <MaterialIcons name="handshake" size={24} color={COLORS.secondary} />
        <Text style={styles.cardText}>
          Our services cover collection, sorting, dismantling, and recovery of reusable components and materials.
        </Text>
      </View>

      <Text style={styles.trustTitle}>Why Trust Us?</Text>

      <View style={styles.bulletRow}>
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
        <Text style={styles.bulletText}>Certified by CPCB & KSPCB (Pollution Control Boards)</Text>
      </View>
      <View style={styles.bulletRow}>
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
        <Text style={styles.bulletText}>Environmentally sustainable processes</Text>
      </View>
      <View style={styles.bulletRow}>
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
        <Text style={styles.bulletText}>Trusted by over 10,000+ users and 500+ businesses</Text>
      </View>
    </ScrollView>
  );
};

export default TrustAndCompliance;





const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.primary,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 12,
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.text,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  bulletText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
});
