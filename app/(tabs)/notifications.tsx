import { Loader } from "@/components/Loader";
import Notification from "@/components/Notification";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { FlatList, Text, View } from "react-native";
import { styles } from "../../styles/notifications.styles";

export default function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications);

  if (notifications === undefined) return <Loader />;
  if (notifications.length === 0) return <NoNotificationsFound />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        // --- FIX: Add a check for 'item' being defined before rendering Notification ---
        renderItem={({ item }) => {
          if (!item) {
            // If item is null or undefined, don't render anything for this slot
            console.warn("Skipping rendering of undefined notification item.");
            return null;
          }
          return <Notification notification={item} />;
        }}
        // --- END FIX ---
        keyExtractor={(item) => (item ? item._id : Math.random().toString())} // Added a fallback key for safety
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ ...styles.listContainer, paddingBottom: 80 }}
        ListFooterComponent={NotificationListFooter}
      />
    </View>
  );
}

// Component to display when no notifications are found
function NoNotificationsFound() {
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="notifications-outline" size={48} color={COLORS.primary} />
      <Text style={{ fontSize: 20, color: COLORS.success, marginTop: 10 }}>
        No Notifications yet
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: COLORS.gray,
          textAlign: "center",
          marginTop: 5,
        }}
      >
        You'll see updates here when something new happens.
      </Text>
    </View>
  );
}


function NotificationListFooter() {
  return (
    <View
      style={{
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray || "#ccc",
        marginTop: 20,
      }}
    >
      <Text
        style={{ fontSize: 14, color: COLORS.gray || "#666", marginBottom: 5 }}
      >
        You've reached the end of your notifications.
      </Text>
      <Ionicons
        name="checkmark-circle-outline"
        size={24}
        color={COLORS.gray || "#666"}
      />
    </View>
  );
}
