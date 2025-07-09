import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import { appEventEmitter } from "@/utils/eventEmitter";

export default function TabLayout() {
  const { user } = useUser();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.brand,
          borderTopWidth: 5,
          borderColor: COLORS.black,
          position: "absolute",
          elevation: 0,
          height: 65,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const isFocused = navigation.isFocused();
            if (isFocused) {
              appEventEmitter.emit("homeTabPressed");
              console.log("Home tab pressed while active, event emitted.");
            }
          },
        })}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarLabel: "Bookmarks",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarLabel: "Post",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="add-circle" size={30} color="red" />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarLabel: "Notifications",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="notifications-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => {
            return user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={profileIconStyles.profileImage}
                contentFit="cover"
                transition={100}
                cachePolicy="memory-disk"
              />
            ) : (
              <Ionicons name="person-circle" size={30} color={color} />
            );
          },
        }}
      />
    </Tabs>
  );
}

const profileIconStyles = StyleSheet.create({
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
});
