import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel"; // This Doc<"posts"> should contain your fields
import { styles } from "@/styles/profile.styles"; // Assuming styles are defined here
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Profile() {
  const { signOut, userId } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Query to fetch the current user's general profile data
  const currentUser = useQuery(
    api.users?.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  // Query to get the count of recycled items from COMPLETED recycling requests
  const recycledItemsCount = useQuery(
    api.recyclingRequests.getCompletedRecyclingItemsCountForUser,
    userId ? { clerkId: userId } : "skip"
  );

  // THIS IS THE CRUCIAL LINE FOR "PRODUCTS PURCHASED"
  const productsPurchasedCount = useQuery(
    api.orders.getTotalProductsPurchasedForUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const [editedProfile, setEditedProfile] = useState({
    fullname: "",
    bio: "",
  });

  useEffect(() => {
    if (currentUser) {
      setEditedProfile({
        fullname: currentUser.fullname || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser]);

  // Ensure Doc<"posts"> includes the fields you want to display
  // e.g., type PostType = Doc<"posts"> & { caption?: string; likes?: number; comments?: number; };
  // If your Convex schema for "posts" includes these fields, Doc<"posts"> will automatically pick them up.
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);
  const posts = useQuery(api.post.getPostsByUser, {});

  const updateProfile = useMutation(api.users.updateProfile);

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    await updateProfile({
      fullname: editedProfile.fullname,
      bio: editedProfile.bio,
      email: currentUser.email,
    });
    setIsEditModalVisible(false);
  };

  const handleShareProfile = async () => {
    if (!currentUser) {
      console.warn("User data not loaded, cannot share profile.");
      return;
    }

    const nameToShare = currentUser.fullname || "A user";
    const bioToShare = currentUser.bio
      ? `Bio: ${currentUser.bio}`
      : "No bio available.";

    try {
      const result = await Share.share({
        message: `${nameToShare}\n${bioToShare}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared with activity type: ${result.activityType}`);
        } else {
          console.log("Profile shared successfully!");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dialog dismissed.");
      }
    } catch (error: any) {
      console.error("Error sharing profile:", error.message);
    }
  };

  if (
    !currentUser ||
    posts === undefined ||
    recycledItemsCount === undefined ||
    productsPurchasedCount === undefined
  ) {
    return <Loader />;
  }

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back-circle"
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.username}>{currentUser.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={30} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={currentUser.image}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.posts}</Text>
                <Text style={styles.statLabel}>My Reviews</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{recycledItemsCount}</Text>
                <Text style={styles.statLabel}>Recycled Items</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{productsPurchasedCount}</Text>
                <Text style={styles.statLabel} numberOfLines={2} ellipsizeMode="tail">Products Purchased</Text>
              </View>
            </View>
          </View>
          <Text style={styles.name}>{currentUser.fullname}</Text>
          {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditModalVisible(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareProfile}
            >
              <Ionicons
                name="share-outline"
                size={22}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>
        {posts.length === 0 && <NoPostsFound />}

        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => setSelectedPost(item)}
            >
              <Image
                source={item.imageUrl}
                cachePolicy={"memory-disk"}
                style={styles.gridImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.fullname}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, fullname: text }))
                  }
                  placeholderTextColor={COLORS.secondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editedProfile.bio}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, bio: text }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={COLORS.secondary}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL FOR DISPLAYING SELECTED POST DETAILS */}
      <Modal
        visible={!!selectedPost}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={() => setSelectedPost(null)} style={styles.postDetailCloseButton}>
                  <Ionicons name="close-circle" size={30} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Image
                source={selectedPost.imageUrl}
                cachePolicy={"memory-disk"}
                style={styles.postDetailImage}
                contentFit="contain" // Changed to contain to ensure full image is visible
              />

              {/* NEW: Post Details Section */}
              <View style={styles.postDetailsContent}>
                {selectedPost.capiton && (
                  <Text style={styles.postCaption}>{selectedPost.capiton}</Text>
                )}

                <View style={styles.postStatsRow}>
                  <View style={styles.postStatItem}>
                    <Ionicons name="heart" size={18} color={COLORS.red} />
                    <Text style={styles.postStatText}>{selectedPost.likes || 0} Likes</Text>
                  </View>
                  <View style={styles.postStatItem}>
                    <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
                    <Text style={styles.postStatText}>{selectedPost.comments || 0} Comments</Text>
                  </View>
                </View>

                {selectedPost._creationTime && (
                  <Text style={styles.postTimestamp}>
                   Posted On {formatTimestamp(selectedPost._creationTime)}
                  </Text>
                )}
              </View>
              {/* END NEW: Post Details Section */}

            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function NoPostsFound() {
  return (
    <View
      style={[
        styles.noPostsContainer,
        {
          backgroundColor: COLORS.white,
          marginHorizontal: 16,
          borderRadius: 12,
        },
      ]}
    >
      <Ionicons name="images-outline" size={48} color={COLORS.secondary} />
      <Text style={styles.noPostsText}>No Posts Yet</Text>
    </View>
  );
}
