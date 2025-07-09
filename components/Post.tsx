// components/Post.tsx
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.style"; // Ensure this file has all required styles defined, including `emptyCommentSpace`
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Share,
  Alert,
  StyleSheet, // Still good to keep if you have any local StyleSheet usage
} from "react-native";
import CommentsModal from "./CommentsModal";
import ImageViewerModal from "./ImageViewerModal";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-expo";


type Postprops = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    capiton?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string; // Assuming Id<"users"> or string
      username: string;
      fullname?: string;
      image: string;
    };
    rating?: number;
    category?: string;
  };
  totalPostsInColumn?: number;
  postIndex?: number;
};

export default function Post({ post, totalPostsInColumn, postIndex }: Postprops) {
  const router = useRouter();

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [currentLikes, setCurrentLikes] = useState(post.likes);

  const [showImageViewer, setShowImageViewer] = useState(false);

  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user?.id } : "skip"
  );

  const toggleLikeMutation = useMutation(api.post.toggleLike);
  const toggleBookmarkMutation = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.post.deletePost);

  // Optional: Uncomment for debugging prop values
  // useEffect(() => {
  //   console.log(`[Post.tsx] Post ID: ${post._id}`);
  //   console.log(`[Post.tsx]    totalPostsInColumn prop received: ${totalPostsInColumn}`);
  //   console.log(`[Post.tsx]    postIndex prop received: ${postIndex}`);
  //   console.log(`[Post.tsx]    Author Username: ${post.author.username}`);
  //   console.log(`[Post.tsx]    Author Fullname: ${post.author.fullname}`);
  //   console.log(`[Post.tsx]    Rating: ${post.rating}`);
  //   console.log(`[Post.tsx]    Category: ${post.category}`);
  // }, [post._id, totalPostsInColumn, postIndex, post.author.username, post.author.fullname, post.rating, post.category]);

  const handleLike = async () => {
    try {
      if (!currentUser) {
        console.warn("User not authenticated for liking. Please log in.");
        return;
      }
      const newIsLiked = await toggleLikeMutation({ postId: post._id });
      setIsLiked(newIsLiked);
      setCurrentLikes((prev) => (newIsLiked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (!currentUser) {
        console.warn("User not authenticated for bookmarking. Please log in.");
        return;
      }
      const newIsBookmarked = await toggleBookmarkMutation({ postId: post._id });
      setIsBookmarked(newIsBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || currentUser._id !== post.author._id) {
      console.warn("User not authorized to delete this post.");
      Alert.alert("Not Authorized", "You can only delete your own posts.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel",
        },
        {
          text: "Yes, Delete",
          onPress: async () => {
            try {
              await deletePost({ postId: post._id });
              console.log("Post deleted successfully.");
              Alert.alert("Success", "Post deleted successfully!");
            } catch (error: any) {
              console.error("Error deleting post:", error);
              Alert.alert("Deletion Failed", `Could not delete post: ${error.message || 'Unknown error occurred.'}`);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: 'E-Waste Post',
        message: `E-Waste\nCheck out this post by ${post.author.username} on [Your App Name]: ${post.capiton ?? ''}`,
        url: post.imageUrl,
      });

      if (result.action === Share.sharedAction) {
        console.log(result.activityType ? `Shared via ${result.activityType}` : 'Shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const MAX_CAPTION_CHARS_TO_DISPLAY = 45;
  const isCaptionTooLong = (post.capiton?.length || 0) > MAX_CAPTION_CHARS_TO_DISPLAY;

  const displayedCaption = isCaptionTooLong
    ? post.capiton?.substring(0, MAX_CAPTION_CHARS_TO_DISPLAY) + "..."
    : post.capiton;


  const MAX_USERNAME_CHARS = 11;
  const baseDisplayName = post.author.fullname || post.author.username;
  let displayedDisplayName = "";

  if (totalPostsInColumn === 1) {
    displayedDisplayName = baseDisplayName;
  } else {
    displayedDisplayName =
      baseDisplayName.length > MAX_USERNAME_CHARS
        ? baseDisplayName.substring(0, MAX_USERNAME_CHARS) + "..."
        : baseDisplayName;
  }

  // Optional: Uncomment for debugging display name
  // useEffect(() => {
  //   console.log(`[Post.tsx] Post ID: ${post._id}`);
  //   console.log(`[Post.tsx]    Base Display Name: "${baseDisplayName}"`);
  //   console.log(`[Post.tsx]    Final Displayed Name: "${displayedDisplayName}"`);
  // }, [post._id, baseDisplayName, displayedDisplayName]);


  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Link
          href={
            currentUser?._id === post.author._id
              ? "/(tabs)/profile"
              : `/user/${post.author._id}`
          }
          asChild
        >
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={{ uri: post.author.image }}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text style={styles.postUsername}>{displayedDisplayName}</Text>
          </TouchableOpacity>
        </Link>

        {post.author._id === currentUser?._id ? (
          <TouchableOpacity style={styles.delete} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleShare}>
            <Ionicons
              name="share-outline"
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={() => setShowImageViewer(true)}>
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>

      <View style={styles.captionContainer}>
        <Text
          style={styles.captionText}
        >
          {displayedCaption}
          {isCaptionTooLong && (
            // Ensure 'Read More' is wrapped in Text, which it already is
            <Text style={styles.readMoreText} onPress={() => setShowImageViewer(true)}> Read More</Text>
          )}
        </Text>
      </View>

      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {currentLikes > 0
            ? `${currentLikes.toLocaleString()} likes`
            : "Be the first to like"}
        </Text>

        {(post.rating !== undefined && post.rating !== null) || post.category ? (
          <View style={styles.ratingCategoryWrapper}> 
            {post.rating !== undefined && post.rating !== null && (
              <View style={styles.ratingBadge}> 
                <Text style={styles.ratingCategoryText}>⭐{post.rating.toFixed(1)}/5
                </Text>
              </View>
            )}
            {post.category && (
              <View style={styles.categoryBadge}> 
                <Text style={styles.ratingCategoryText}>
                  {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {post.comments > 0 ? (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentText}>
              View all {post.comments} comments
            </Text>
          </TouchableOpacity>
        ) : (

          <View style={styles.emptyCommentSpace} />
        )}

        <Text style={styles.timeAgo}>
          {formatDistanceToNow(new Date(post._creationTime), { addSuffix: true })}
        </Text>
      </View>

      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />

      <ImageViewerModal
        visible={showImageViewer}
        imageUrl={post.imageUrl}
        caption={post.capiton ?? ''}
        onClose={() => setShowImageViewer(false)}
      />
    </View>
  );
}