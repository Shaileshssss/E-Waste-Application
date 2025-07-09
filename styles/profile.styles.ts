import { COLORS } from "@/constants/theme";
import { Dimensions, StyleSheet, Platform } from "react-native"; // Import Platform for OS-specific styles

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brand,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.brand,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  headerIcon: {
    padding: 6,
  },
  profileInfo: {
    padding: 8,
    backgroundColor: COLORS.white,
    margin: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center", // Center content within the card
  },
  avatarAndStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: '100%', // Ensure it takes full width to distribute space
    justifyContent: 'flex-start', // Align avatar to start, stats will fill remaining
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: COLORS.black,
  },
  // --- UPDATED STATS STYLES ---
  statsContainer: {
    flex: 1, // Allow stats container to take up remaining space
    flexDirection: "row",
    justifyContent: "space-around", // Distributes items evenly
    alignItems: "center", // Vertically center content

  },
  statItem: {
    flex: 1, // <<< ADDED: Each stat item takes equal width
    alignItems: "center",
    paddingHorizontal: 1, // Add a little padding to prevent text from touching dividers
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center", // <<< ADDED: Center the text for multi-line labels
  },
  statDivider: { // <<< NEW: Style for optional visual dividers between stats
    width: 1,
    height: '69%', // Adjust height as needed
    backgroundColor: COLORS.lightGray, // A subtle grey for the divider
    alignSelf: 'center', // Ensures divider is centered vertically
  },
  // --- END UPDATED STATS STYLES ---
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
    right: "36%",
    marginTop: 2, // Added margin top for spacing after avatar/stats
  },
  bio: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
    marginRight: "60%",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: 'center',
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 15,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 2,
  },
  gridImage: {
    flex: 1,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: height * 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: COLORS.text,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center", // Center the post detail container
  },
  postDetailContainer: {
    backgroundColor: COLORS.white,
    maxHeight: height * 0.9,
    width: '90%', // Make it take a specific width
    borderRadius: 12,
    overflow: 'hidden',
  },
  postDetailHeader: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    // You might want to adjust this background color if it's visible or ensure the button is always visible
    // backgroundColor: 'transparent', 
  },
  postDetailImage: {
    width: '100%', // Ensure it takes full width of its container
    height: width * 0.8 * 0.75, // Responsive height, adjust multiplier as needed
    backgroundColor: COLORS.lightGray,
  },
  postDetailsContent: {
    padding: 15,
    backgroundColor: COLORS.white,
  },
  postCaption: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 22,
  },
  postStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    justifyContent: 'space-around', // Distribute space for stats like likes/comments
  },
  postStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  postStatText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 5,
    fontWeight: '500',
  },
  postTimestamp: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginTop: 5,
  },
  postDetailCloseButton: {
    padding: 0,
    backgroundColor: COLORS.red,
    borderRadius: 15,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  followingButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  followButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  followingButtonText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  noPostsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
    flex: 1,
  },
  noPostsText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingTop: 4,
    paddingHorizontal: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  achievementBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: COLORS.lightGray,
  padding: 10,
  borderRadius: 10,
  marginTop: 15,
},
achievementText: {
  fontSize: 14,
  color: COLORS.text,
  marginLeft: 8,
  flex: 1,
},
userIdText: {
  fontSize: 13,
  color: COLORS.darkGray,
  marginTop: 4,
},

});
