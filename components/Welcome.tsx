import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

// Define a type for the paths to match expo-router's expectations
type DashboardRoutePath =
  | '/dashboard-details/cart-screen'
  | '/dashboard-details/last-order-screen'
  | '/dashboard-details/messages-screen'
  | '/dashboard-details/settings-screen'
  | '/dashboard-details/all-orders-screen' // Added for "Products Purchased" card if it links here
  | '/recycling-flow/my-recycling-requests-screen'; // NEW: Path for recycling requests

// Define an interface for your DashboardCard objects
interface DashboardCard {
  id: string;
  title: string;
  icon: React.ReactNode; // Use React.ReactNode for JSX elements
  value: number | null;
  path: DashboardRoutePath; // Use the specific union type here
}

export default function WelcomeText() {
  const { userId: clerkUserId } = useAuth();
  const router = useRouter();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  // --- Dynamic Data Queries ---
  const cartItemCount = useQuery(
    api.cart?.getCartItemCount,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || 0;

  const lastOrderItemCount = useQuery(
    api.orders?.getLastOrderItemCount,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || 0;

  const unreadMessageCount = useQuery(
    api.messages?.getUnreadMessageCount,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || 0;

  const fullName = currentUser?.fullname || "User";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Hi";
  };

  // Centralized card data for easier mapping and navigation
  const dashboardCards: DashboardCard[] = [
    {
      id: 'cart',
      title: 'Cart',
      icon: <Ionicons name="cart-outline" size={22} color="#0f172a" />,
      value: cartItemCount,
      path: '/dashboard-details/cart-screen',
    },
    {
      id: 'lastOrder',
      title: 'Last Order',
      icon: <MaterialIcons name="history" size={22} color="#0f172a" />,
      value: lastOrderItemCount,
      path: '/dashboard-details/last-order-screen',
    },
    {
      id: 'messages',
      title: 'Chat With Us',
      icon: <Ionicons name="chatbubble-ellipses-outline" size={22} color="#0f172a" />,
      value: unreadMessageCount,
      path: '/dashboard-details/messages-screen',
    },
    // NEW CARD: Track Recycling Items
    {
      id: 'trackRecycling',
      title: 'Track Recycling',
      icon: <Ionicons name="leaf-outline" size={22} color="#0f172a" />, // Leaf icon for recycling
      value: null, // No specific count for this navigation card
      path: '/recycling-flow/my-recycling-requests-screen', // Link to the new screen
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <FontAwesome5 name="cog" size={22} color="#0f172a" />,
      value: null, // No numeric value for settings
      path: '/dashboard-details/settings-screen',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>{getGreeting()}, {fullName} 👋</Text>
      </View>

      <View style={styles.grid}>
        {dashboardCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => router.push(card.path)}
          >
            {/* Render icon */}
            {card.icon}
            {/* Render title, now with 2 lines */}
            <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
              {card.title}
            </Text>
            {/* Render cardValue only if it's not null and greater than 0 */}
            {card.value !== null && card.value > 0 && (
              <Text style={styles.cardValue}>{card.value}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingTop: 2,
    backgroundColor: "#DFFF8F",
    borderColor: "white",
    // borderWidth: 1,
    marginVertical: 10,
    height: 105,
    bottom: 9,
  },
  header: {
    marginBottom: 15,
  },
  logo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    gap: 8,
    marginTop: -5,
  },
  card: {
    borderRadius: 20,
    padding: 5,
    alignItems: "center",
    marginBottom: 12,
    right: 0,
    position: 'relative',
    width: '18%', // Keep this as it was
    aspectRatio: 1,
    // Adjusted height or padding if needed to accommodate 2 lines.
    // Given the current setup with aspectRatio, increasing height might break the aspect ratio.
    // Instead, rely on padding and text wrapping.
  },
  cardTitle: {
    fontSize: 11,
    color: "#475569",
    marginTop: 6,
    textAlign: 'center', // Center the text for better appearance with 2 lines
    // Removed numberOfLines={1}
    lineHeight: 14, // Add a specific line height to prevent text overlapping if it's too tight
  },
  cardValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "blue",
    marginTop: 2,
    position: 'absolute',
    top: -4,
    left: 55,
  },
});