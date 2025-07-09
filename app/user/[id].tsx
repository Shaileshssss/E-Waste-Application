import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { MotiView, MotiImage } from "moti";

const screenWidth = Dimensions.get("window").width;
const imageSize = screenWidth / 3 - 16;

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const profile = useQuery(api.users.getUserProfile, { id: id as Id<"users"> });
  const posts = useQuery(api.post.getPostsByUser, {
    userId: id as Id<"users">,
  });

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (profile === undefined || posts === undefined) return <Loader />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.warning} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.profileInfo}
        >
          <View style={styles.avatarAndStats}>
            <View style={{ position: "relative" }}>
              <MotiImage
                source={{ uri: profile.image }}
                style={styles.avatar}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 200, duration: 400 }}
              />
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.success}
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  backgroundColor: COLORS.white,
                  borderRadius: 11,
                }}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.posts}</Text>
                <Text style={styles.statLabel}>Items Recycled</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1200</Text>
                <Text style={styles.statLabel}>Eco Points</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>{profile.fullname}</Text>
          <Text style={styles.bio}>{profile.bio || "No bio available"}</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.black}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.bio, { flexShrink: 1 }]}>
              Member since: Jan 2024
            </Text>
          </View>

          <View style={styles.achievementBox}>
            <Ionicons name="leaf-outline" size={20} color={COLORS.success} />
            <Text style={styles.achievementText}>
              Thanks for recycling responsibly and helping reduce e-waste in
              India 🌍
            </Text>
          </View>
        </MotiView>

        <Text style={[styles.headerTitle, { marginLeft: 15, marginTop: 10 }]}>
          My Recycled Items
        </Text>

        <View style={styles.postsGrid}>
          {posts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Ionicons
                name="images-outline"
                size={48}
                color={COLORS.success}
              />
              <Text style={styles.noPostsText}>No items recycled yet</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 80,
                    duration: 400,
                    type: "timing",
                  }}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    margin: 4,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <TouchableOpacity>
                    <MotiImage
                      source={{ uri: item.imageUrl }}
                      style={{ width: "100%", height: "100%", borderRadius: 8 }}
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "timing", duration: 300 }}
                    />
                  </TouchableOpacity>
                </MotiView>
              )}
              keyExtractor={(item) => item._id}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
