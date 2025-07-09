import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  findNodeHandle,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';

// Import Convex API and hooks
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-expo";

interface SettingSectionHeaderProps {
  title: string;
}

const SettingSectionHeader: React.FC<SettingSectionHeaderProps> = ({
  title,
}) => <Text style={styles.sectionHeader}>{title}</Text>;

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
  isDestructive?: boolean;
  currentValue?: string;
  showChevron?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, userId: clerkUserId } = useAuth();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const feedbackSectionRef = useRef<View>(null);

  // Animation values for "Designed by E-waste" flash
  const flashTranslateX = useSharedValue(-100); // Start off-screen left (width of flash)
  const designedByTextWrapperWidth = useSharedValue(0); // To store the dynamic width of the text container

  // Animated style for the flash overlay
  const animatedFlashStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: flashTranslateX.value }],
    };
  });

  // Function to start the flash animation (now explicitly a worklet)
  // It now accepts the measured width directly as an argument
  const startFlashAnimation = useCallback((measuredWidth: number) => {
    'worklet'; // Mark this function as a worklet
    console.log('Worklet: startFlashAnimation called with measuredWidth:', measuredWidth);
    // Only start if not already initialized (designedByTextWrapperWidth is still 0)
    if (designedByTextWrapperWidth.value === 0) {
      designedByTextWrapperWidth.value = measuredWidth; // Set the shared value within the worklet context
      console.log('Worklet: Starting flash animation for width:', designedByTextWrapperWidth.value);
      flashTranslateX.value = withRepeat(
        withTiming(
          designedByTextWrapperWidth.value + 100, // Use the updated shared value for calculation
          { duration: 1500, easing: Easing.linear } // Adjust duration for speed
        ),
        -1, // Repeat indefinitely
        false // Do not reverse
      );
    } else {
      console.log('Worklet: Animation not started (already initialized). Current width:', designedByTextWrapperWidth.value);
    }
  }, [designedByTextWrapperWidth, flashTranslateX]);


  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Navigate to profile editing screen.");
    router.push("/dashboard-details/profile-edit");
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Open change password flow.");
  };

  const handleManageConnectedAccounts = () => {
    Alert.alert("Connected Accounts", "Manage linked third-party accounts.");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            Alert.alert("Account Deleted", "Your account has been deleted."),
        },
      ]
    );
  };

  const handleTogglePushNotifications = () => {
    Alert.alert("Notifications", "Toggle push notifications preference.");
  };

  const handleToggleEmailNotifications = () => {
    Alert.alert(
      "Email Notifications",
      "Toggle email notifications preference."
    );
  };

  const handleNotificationPreferences = () => {
    Alert.alert(
      "Notification Preferences",
      "Navigate to detailed notification settings."
    );
  };

  const handleViewPrivacyPolicy = () => {
    router.push("/dashboard-details/legal-info");
  };

  const handleViewTermsOfService = () => {
    router.push("/flipper/SendEmailScreen");
  };

  const handleDataPermissions = () => {
    router.push("/dashboard-details/legal-info");
  };

  const handleFAQ = () => {
    router.push("/dashboard-details/help-support");
  };

  const handleContactUs = () => {
    router.push("/dashboard-details/help-support");
  };

  const handleReportBug = () => {
    Alert.alert(
      "Report a Bug",
      "Please describe the issue you encountered. Screenshots are helpful!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Email",
          onPress: () =>
            Linking.openURL(
              "mailto:bugs@ewastemanager.com?subject=Bug%20Report%20E-Waste%20App&body=Device:%0AApp%20Version:%0ADescription%20of%20Bug:"
            ),
        },
      ]
    );
  };

  const handleViewLicenses = () => {
    Alert.alert(
      "Licenses",
      "Display open source licenses and acknowledgements."
    );
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert(
              "Sign Out Failed",
              "Could not sign out. Please try again."
            );
          }
        },
      },
    ]);
  };

  const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    text,
    onPress,
    isDestructive = false,
    currentValue,
    showChevron = true,
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={isDestructive ? COLORS.error : COLORS.text}
          style={styles.settingIcon}
        />
        <Text
          style={[styles.settingText, isDestructive && { color: COLORS.error }]}
        >
          {text}
        </Text>
      </View>

      <View style={styles.settingItemRight}>
        {currentValue && (
          <Text style={styles.settingValueText}>{currentValue}</Text>
        )}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.darkGray} />
        )}
      </View>
    </TouchableOpacity>
  );

  const FeedbackAndRatingSection: React.FC = () => {
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<
      "idle" | "success" | "error"
    >("idle");
    const MAX_CHARACTERS = 500;

    const submitFeedbackMutation = useMutation(api.feedback.submitFeedback);

    const currentCharCount = feedbackText.length;
    const isCharLimitExceeded = currentCharCount > MAX_CHARACTERS;

    const animatedHeight = useSharedValue(0);
    const animatedOpacity = useSharedValue(0);

    const toggleExpansion = useCallback(() => {
      setIsExpanded((prev) => {
        const newState = !prev;
        if (newState) {
          animatedHeight.value = withSpring(350, {
            damping: 15,
            stiffness: 100,
          });
          animatedOpacity.value = withTiming(1, { duration: 300 });
        } else {
          animatedHeight.value = withTiming(0, { duration: 300 });
          animatedOpacity.value = withTiming(0, { duration: 200 });
          setRating(0); // Reset on collapse
          setFeedbackText(""); // Reset on collapse
          setSubmitStatus("idle"); // Reset on collapse
          Keyboard.dismiss();
        }
        return newState;
      });
    }, [animatedHeight, animatedOpacity]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        height: animatedHeight.value,
        opacity: animatedOpacity.value,
        overflow: "hidden",
      };
    });

    const handleSubmitFeedback = useCallback(async () => {
      if (rating === 0 && feedbackText.trim() === "") {
        Alert.alert(
          "Hold On!",
          "Please provide a rating or some feedback before submitting."
        );
        return;
      }
      if (isCharLimitExceeded) {
        Alert.alert(
          "Character Limit Exceeded",
          `Your feedback exceeds the ${MAX_CHARACTERS}-character limit.`
        );
        return;
      }

      setIsSubmitting(true);
      setSubmitStatus("idle");

      try {
        await submitFeedbackMutation({
          userId: currentUser?._id,
          rating: rating,
          feedbackText: feedbackText.trim(),
        });

        setSubmitStatus("success");
        Alert.alert(
          "Thank You!",
          "Your feedback has been submitted successfully!"
        );
        setRating(0);
        setFeedbackText("");
        setTimeout(() => {
          runOnJS(toggleExpansion)();
        }, 2000);
      } catch (error) {
        console.error("Failed to submit feedback to Convex:", error);
        setSubmitStatus("error");
        Alert.alert("Oops!", "Failed to submit feedback. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }, [
      rating,
      feedbackText,
      isCharLimitExceeded,
      toggleExpansion,
      submitFeedbackMutation,
      currentUser?._id,
    ]);

    const handleCancelFeedback = useCallback(() => {
      setRating(0); // Clear stars
      setFeedbackText(""); // Clear text input
      Keyboard.dismiss(); // Close keyboard
      toggleExpansion(); // Collapse the section
    }, [toggleExpansion]);

    const isSubmitDisabled =
      isSubmitting ||
      (rating === 0 && feedbackText.trim() === "") ||
      isCharLimitExceeded;

    const handleFeedbackTextChange = (text: string) => {
      setFeedbackText(text);
    };

    return (
      <View ref={feedbackSectionRef}>
        <SettingItem
          icon="chatbox-outline"
          text="Give Feedback & Rate Us"
          onPress={toggleExpansion}
          showChevron={false}
        />

        <Animated.View
          style={[feedbackStyles.feedbackFormContainer, animatedStyle]}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flexGrow: 1 }}
              keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
              <View style={feedbackStyles.ratingStarsContainer}>
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = starValue <= rating;
                  const starScale = useSharedValue(1);

                  const starAnimatedStyle = useAnimatedStyle(() => {
                    return {
                      transform: [{ scale: starScale.value }],
                    };
                  });

                  const handleStarPress = () => {
                    setRating(starValue);
                    starScale.value = withSpring(1.3, {}, (isFinished) => {
                      if (isFinished) {
                        starScale.value = withSpring(1);
                      }
                    });
                  };

                  return (
                    <TouchableOpacity key={starValue} onPress={handleStarPress}>
                      <Animated.View style={starAnimatedStyle}>
                        <Ionicons
                          name={isFilled ? "star" : "star-outline"}
                          size={36}
                          color={isFilled ? COLORS.green : COLORS.darkGray}
                          style={feedbackStyles.starIcon}
                        />
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                style={[
                  feedbackStyles.feedbackInput,
                  isCharLimitExceeded && feedbackStyles.feedbackInputError,
                ]}
                placeholder={`Share your thoughts (max ${MAX_CHARACTERS} characters)...`}
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={4}
                value={feedbackText}
                onChangeText={handleFeedbackTextChange}
                textAlignVertical="top"
                maxLength={MAX_CHARACTERS}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                blurOnSubmit={true}
                autoFocus={isExpanded}
              />
              <Text style={feedbackStyles.wordCountText}>
                {currentCharCount}/{MAX_CHARACTERS} characters
                {isCharLimitExceeded && (
                  <Text style={{ color: COLORS.error }}> (Limit Exceeded)</Text>
                )}
              </Text>

              <View style={feedbackStyles.buttonRow}>
                <TouchableOpacity
                  style={feedbackStyles.cancelButton}
                  onPress={handleCancelFeedback}
                  disabled={isSubmitting}
                >
                  <Text style={feedbackStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    feedbackStyles.submitButton,
                    isSubmitDisabled && feedbackStyles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmitFeedback}
                  disabled={isSubmitDisabled}
                >
                  {isSubmitting ? (
                    <Text style={feedbackStyles.submitButtonText}>
                      Submitting...
                    </Text>
                  ) : (
                    <Text style={feedbackStyles.submitButtonText}>
                      {submitStatus === "success"
                        ? "Feedback Sent!"
                        : submitStatus === "error"
                          ? "Try Again"
                          : "Submit Feedback"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.brand,
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            marginLeft: 12,
            color: COLORS.text,
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        ref={scrollViewRef}
      >
        {/* Account Section */}
        <SettingSectionHeader title="Account" />
        <SettingItem
          icon="person-outline"
          text="Edit Profile"
          onPress={handleEditProfile}
        />
        <SettingItem
          icon="key-outline"
          text="Change Password"
          onPress={handleChangePassword}
        />
        <SettingItem
          icon="sync-outline"
          text="Manage Connected Accounts"
          onPress={handleManageConnectedAccounts}
        />
        <SettingItem
          icon="trash-outline"
          text="Delete Account"
          onPress={handleDeleteAccount}
          isDestructive
        />

        {/* Notifications Section */}
        <SettingSectionHeader title="Notifications" />
        <SettingItem
          icon="notifications-outline"
          text="Push Notifications"
          onPress={handleTogglePushNotifications}
        />
        <SettingItem
          icon="mail-outline"
          text="Email Notifications"
          onPress={handleToggleEmailNotifications}
        />
        <SettingItem
          icon="options-outline"
          text="Notification Preferences"
          onPress={handleNotificationPreferences}
        />

        {/* Privacy Section */}
        <SettingSectionHeader title="Privacy" />
        <SettingItem
          icon="document-text-outline"
          text="Privacy Policy"
          onPress={handleViewPrivacyPolicy}
        />

        <SettingItem
          icon="receipt-outline"
          text="Terms of Service"
          onPress={handleViewTermsOfService}
        />
        <SettingItem
          icon="lock-closed-outline"
          text="Data Permissions"
          onPress={handleDataPermissions}
        />

        {/* Help & Support Section */}
        <SettingSectionHeader title="Help & Support" />
        <SettingItem
          icon="help-circle-outline"
          text="FAQ"
          onPress={handleFAQ}
        />
        <SettingItem
          icon="chatbox-outline"
          text="Contact Us"
          onPress={handleContactUs}
        />
        <SettingItem
          icon="bug-outline"
          text="Report a Bug"
          onPress={handleReportBug}
        />

        {/* About Section */}
        <SettingSectionHeader title="About" />

        <FeedbackAndRatingSection />

        <SettingItem
          icon="information-circle-outline"
          text="App Version"
          onPress={() => Alert.alert("App Version", "1.0.0")}
          showChevron={false}
        />
        <SettingItem
          icon="hand-left-outline"
          text="Licenses"
          onPress={handleViewLicenses}
          showChevron={false}
        />

        <View style={styles.designedByContainer}>
          <TouchableOpacity
            onPress={() => Alert.alert("E-waste Manager", "This app is designed by the E-waste team.")}
            activeOpacity={0.7}
          >
            <View
              style={styles.designedByTextWrapper}
              onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                console.log('JS: onLayout triggered. Measured width:', width);
                // Only start if not already set/running
                if (designedByTextWrapperWidth.value === 0) {
                  runOnJS(startFlashAnimation)(width); // Pass the width directly to the worklet
                } else {
                  console.log('JS: Animation already initialized, skipping onLayout trigger.');
                }
              }}
            >
              <Text style={styles.designedByText}>Designed by E-waste♻️</Text>
              <Animated.View style={[styles.flashOverlay, animatedFlashStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.7)', 'transparent']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brand,
  },
  scrollContent: {
    paddingHorizontal: 10,
    marginTop: -10,
  },
  backButton: {
    marginLeft: 1,
    padding: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
    width: 24,
    textAlign: "center",
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  settingItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValueText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginRight: 5,
  },
  signOutButton: {
    backgroundColor: COLORS.red,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  designedByContainer: {
    alignSelf: 'center',
    marginVertical: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    // backgroundColor: COLORS.white,
    // shadowColor: COLORS.black,
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 1,
  },
  designedByTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  designedByText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
  },
});

const feedbackStyles = StyleSheet.create({
  feedbackFormContainer: {
    paddingHorizontal: 15,
    paddingBottom: -15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: -14,
  },
  ratingStarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    marginBottom: 5,
    backgroundColor: COLORS.white,
  },
  feedbackInputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  wordCountText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
    marginBottom: 15,
    marginTop: 0,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold", // Removed trailing comma
  },
});
