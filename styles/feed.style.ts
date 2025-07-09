// styles/feed.styles.ts
import { COLORS } from "@/constants/theme";
import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
// Define the padding/margin between grid items
const gridPadding = 3;
const numColumns = 2; // This 'numColumns' is for style calculations, not the FlatList prop
const itemWidth = (width - gridPadding * (numColumns + 1)) / numColumns; // Corrected calculation for item width

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brand,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#DFFF8F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  headerTitle: {
    fontSize: 22,
    fontFamily: "JetBrainsMono-Medium",
    color: "blue", // deep forest green
  },
  dailyPostHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  storiesContainer: {
    paddingVertical: 5,
    marginTop: -11,
    paddingLeft: 5,
    borderBottomColor: "#d4e7d4", // light moss green
    backgroundColor: "#B0E0E6", // gentle pale green
  },

  storyWrapper: {
    alignItems: "center",
    marginRight: 16,
    width: 69,
  },

  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 4,
    padding: 3,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "", // vibrant nature green (assuming this is replaced by an actual color)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  noStory: {
    borderColor: "#cccccc",
  },

  storyAvatar: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#d4d4d4",
  },

  storyUsername: {
    fontSize: 11,
    color: "black",
    textAlign: "center",
    flexWrap: "wrap",
  },
  feedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: gridPadding / 2,
    paddingVertical: gridPadding,
  },
  post: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    // borderColor: COLORS.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    // Calculate width to ensure proper two-column layout spacing
    width: itemWidth, // Use the calculated itemWidth
    // marginBottom: gridPadding,
    marginHorizontal: gridPadding / 5,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1, // Allows this container to shrink if its content (username) is too long
  },
  postAvatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  postUsername: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    flexShrink: 1, // Crucial: Allows the Text component to shrink its content
    // No fixed width or maxWidth here
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: COLORS.lightGray,
  },
  captionContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 1,
  },
  captionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    height: 59,
  },
  readMoreText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  postActionsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  postInfo: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  delete: {
    padding: 5,
  },
  likesText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  commentText: {
    color: COLORS.textSecondary, // Changed to textSecondary based on screenshot appearance
    fontSize: 12,
    lineHeight: 18,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    fontSize: 14,
  },
  postButton: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  timeAgo: {
    color: COLORS.gray,
    fontSize: 11,
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    color: COLORS.text,
    fontWeight: "500",
    marginBottom: 4,
  },
  // commentText: {
  //   color: COLORS.textSecondary,
  //   fontSize: 12,
  //   lineHeight: 18,
  // },
  commentTime: {
    color: COLORS.gray,
    fontSize: 11,
    marginTop: 4,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  emptyCommentSpace: {
    height: 18, // This height should roughly match the height of your `commentText` line
    // You might need to adjust this value based on your `commentText`'s actual rendered height
    // considering font size, line height, and any vertical padding/margin.
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    marginBottom: Platform.OS === "ios" ? 44 : 0,
    flex: 1,
    marginTop: Platform.OS === "ios" ? 44 : 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
  },
  productTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  captionModalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalCaptionText: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 15,
    lineHeight: 22,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 15,
  },
  ratingCategoryWrapper: {
    flexDirection: "row",
    alignSelf: "flex-start", // Important: Make container wrap content and not take full width
    alignItems: "center",
    marginTop: 8, // Space from the likes line above
    marginBottom: 8, // Space from the comments line below
    // No background for this wrapper itself, as children will have backgrounds
  },
  ratingBadge: {
    backgroundColor: "#D1E7DD", // A light green or similar for rating (example color)
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 45, // Full pill shape
    marginRight: 12, // Space between rating and category badges
    right: 5,
  },
  categoryBadge: {
    backgroundColor: "#CCE5FF", // A light blue or similar for category (example color)
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 45, // Full pill shape
  },
  ratingCategoryText: {
    fontSize: 12,
    color: COLORS.darkGray, // Keep text dark for contrast
    fontWeight: "500", // Make text a bit bolder for visibility
  },
});
