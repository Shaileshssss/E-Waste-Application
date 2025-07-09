import { StyleSheet, Platform } from "react-native";
import { COLORS } from "@/constants/theme"; // Assuming this path is correct

export const formStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 10, // Increased padding
    backgroundColor: COLORS.brand, // Use background color
  },
  title: {
    fontSize: 28, // Larger title
    fontWeight: "bold",
    marginBottom: 30, // More space below title
    color: COLORS.primary, // Deep green title
    textAlign: "center",
    letterSpacing: 0.5, // Slightly more prominent
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 20, // Space above sections
  },
  field: {
    marginBottom: 10, // More space between fields
  },
  label: {
    fontWeight: "600",
    fontSize: 15, // Slightly smaller for better hierarchy
    color: COLORS.textSecondary, // Use secondary text color
    marginBottom: 8, // Space between label and input
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border, // Lighter border
    paddingVertical: Platform.OS === 'ios' ? 14 : 12, // Consistent padding
    paddingHorizontal: 15,
    borderRadius: 10, // More rounded corners
    fontSize: 16,
    backgroundColor: COLORS.cardBackground, // White background for inputs
    color: COLORS.text, // Dark text
    shadowColor: COLORS.black, // Subtle shadow for depth
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  textarea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 15,
    height: 120, // Taller textarea
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: COLORS.cardBackground,
    textAlignVertical: "top",
    color: COLORS.text,
    shadowColor: COLORS.black,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  errorText: {
    color: COLORS.error, // Red for errors
    fontSize: 13,
    marginTop: 5,
    marginLeft: 5,
  },
  submitButton: {
    marginTop: 30, // More space above submit button
    backgroundColor: COLORS.primary, // Primary green for submit
    paddingVertical: 16, // Taller button
    borderRadius: 12, // More rounded
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: "700", // Bolder text
    fontSize: 18, // Larger text
  },
  uploadButton: {
    marginTop: 20, // Space above upload button
    backgroundColor: COLORS.cardBackground, // White background for upload
    paddingVertical: 14, // Taller button
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    flexDirection: 'row', // For icon and text
    justifyContent: 'center',
    shadowColor: COLORS.black,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  uploadButtonText: {
    color: COLORS.textSecondary, // Use secondary text color
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8, // Space between icon and text
  },
  selectedImagesContainer: {
    marginTop: 15,
    marginBottom: 20, // Space below images
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 12, // More space between images
    borderRadius: 10, // Rounded image corners
    overflow: 'hidden', // Ensure border radius applies
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative', // For delete button positioning
  },
  deleteImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.error,
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure it's above the image
  },
  cancelButton: {
    backgroundColor: COLORS.error, // Red for cancel (consistent with logout)
    paddingVertical: 14,
    marginTop: 15, // Space below submit button
    marginBottom: 30, // Space from bottom
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
  // --- Animation specific styles ---
  animatedLabel: {
    position: 'absolute',
    left: 15,
    top: 15,
    fontSize: 16,
    color: COLORS.placeholder,
    paddingHorizontal: 2, // For background color later if needed
    zIndex: 1,
  },
});