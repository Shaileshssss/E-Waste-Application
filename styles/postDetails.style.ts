import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme'; // Adjust path if necessary

export const detailsStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 40, // Adjust for status bar
    backgroundColor: COLORS.background,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  authorAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  authorUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  postImage: {
    width: '100%',
    height: 400, // Fixed height for consistency
    backgroundColor: "yellow",
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray,
  },
  icon: {
    marginRight: 5,
  },
  actionCount: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginRight: 15,
  },
  bookmarkIcon: {
    marginLeft: 'auto', // Pushes bookmark to the right
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fullCaptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  captionUsername: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
});