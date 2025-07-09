// styles/create.styles.ts
import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "@/constants/theme";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brand,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "yellow",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "red",
  },
  contentDisabled: {
    opacity: 0.7,
  },
  shareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  shareTextDisabled: {
    color: "grey",
  },
  emptyImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyImageText: {
    color: "grey",
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.brand,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageSection: {
    width: width,
    height: width,
    backgroundColor: COLORS.brand,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  changeImageText: {
    color: "red",
    fontSize: 14,
    fontWeight: "500",
  },
  inputSection: {
    padding: 16,
    flex: 1,
  },
  captionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderRadius: 20,
  },
  userAvatar: {
    width: 39,
    height: 39,
    borderRadius: 18,
    marginRight: 8,
    top: 2,
  },
  captionInput: {
    flex: 1,
    color: COLORS.black,
    fontSize: 16,
    paddingTop: 8,
    minHeight: 40,
  },
  charCountText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  captionWarningText: {
    fontSize: 12,
    color: COLORS.red,
    flexShrink: 1,
  },
  captionInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    paddingHorizontal: 10,
  },
   inputGroup: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50, // Give it a fixed height similar to other inputs
  },
  slider: {
    flex: 1, // Allow slider to take available space
    height: 40,
  },
  sliderValueText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    minWidth: 30, // Ensure space for 2-3 chars (e.g., "4.5")
    textAlign: 'right',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    overflow: 'hidden', // Ensures picker content stays within bounds
  },
  pickerStyle: {
    height: 50,
    color: COLORS.text,
    // Note: `itemStyle` for Picker is mostly iOS specific and often harder to control on Android.
    // Basic `color` and `height` might be sufficient for general look.
  },
  
});