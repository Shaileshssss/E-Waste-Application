// components/CreateScreen.tsx

import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/create.styles"; // Assuming this file exists and contains relevant styles
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Keyboard,
  StyleSheet, // Import StyleSheet for local styles
  Alert, // Import Alert for user feedback
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Slider from "@react-native-community/slider";

// --- Helper Component for Radio Buttons ---
interface RadioOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const RadioOption: React.FC<RadioOptionProps> = ({ label, selected, onPress, disabled }) => (
  <TouchableOpacity
    style={[radioStyles.radioOption, disabled && radioStyles.radioOptionDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <View style={[radioStyles.radioCircle, selected && radioStyles.selectedCircle]}>
      {selected && <View style={radioStyles.innerCircle} />}
    </View>
    <Text style={[radioStyles.radioLabel, disabled && radioStyles.radioLabelDisabled]}>{label}</Text>
  </TouchableOpacity>
);
// --- END Helper Component ---

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState<"refurbished" | "recycled" | null>(null); // New state for category

  const CAPTION_MAX_LENGTH = 120;

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Scroll to the top when keyboard shows to ensure input is visible
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const pickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant media library access to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const generateUploadUrl = useMutation(api.post.generateUploadUrl);
  const createPost = useMutation(api.post.createPost);

  const handleShare = async () => {
    if (!selectedImage) {
      Alert.alert("Missing Image", "Please select an image for your post.");
      return;
    }
    if (!category) {
      Alert.alert("Missing Category", "Please select a product category (Refurbished or Recycled).");
      return;
    }

    try {
      setIsSharing(true);
      const uploadUrl = await generateUploadUrl();

      // Read the file as base64 to get its content type (optional, but good practice)
      // For Convex, FileSystem.uploadAsync works well directly with URI
      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        selectedImage,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: "image/jpeg", // Assuming JPEG for simplicity, or dynamically detect
        }
      );

      if (uploadResult.status !== 200) {
        throw new Error(`Upload failed with status ${uploadResult.status}: ${uploadResult.body}`);
      }

      const { storageId } = JSON.parse(uploadResult.body);

      await createPost({
        storageId,
        caption,
        // Only pass rating if it's greater than 0
        rating: rating > 0 ? rating : undefined,
        category: category,
      });

      // Reset states after successful post
      setSelectedImage(null);
      setCaption("");
      setRating(0);
      setCategory(null);
      
      Alert.alert("Success", "Your post has been shared!");
      router.push("/(tabs)"); // Navigate back to the feed
    } catch (error) {
      console.error("Error sharing post:", error);
      Alert.alert("Error", `Failed to share post: ${error instanceof Error ? error.message : "Unknown error."}`);
    } finally {
      setIsSharing(false);
    }
  };

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back-circle"
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 28 }} />
        </View>

        <TouchableOpacity
          style={styles.emptyImageContainer}
          onPress={pickImage}
        >
          <Ionicons name="image-outline" size={48} color={COLORS.secondary} />
          <Text style={styles.emptyImageText}>Tap to select an image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={60} // Adjust this offset as needed for your header/layout
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              // Confirm before discarding
              Alert.alert(
                "Discard Post?",
                "Are you sure you want to discard this post?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Discard",
                    style: "destructive",
                    onPress: () => {
                      setSelectedImage(null);
                      setCaption("");
                      setRating(0);
                      setCategory(null);
                    },
                  },
                ]
              );
            }}
            disabled={isSharing}
          >
            <Ionicons
              name="close-outline"
              size={28}
              color={isSharing ? COLORS.gray : COLORS.secondary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            style={[
              styles.shareButton,
              // Disable if sharing, no image, or no category selected
              isSharing || !selectedImage || !category
                ? styles.shareButtonDisabled
                : {},
            ]}
            disabled={isSharing || !selectedImage || !category}
            onPress={handleShare}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.shareText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled" // Important for ensuring touchables work with keyboard open
        >
          <View style={[styles.content, isSharing && styles.contentDisabled]}>
            <View style={styles.imageSection}>
              <Image
                source={{ uri: selectedImage }} // Use uri for Image component
                style={styles.previewImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />

              <Text style={styles.charCountText}>
                {caption.length}/{CAPTION_MAX_LENGTH}
              </Text>

              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={isSharing}
              >
                <Ionicons name="image-outline" size={20} color={COLORS.white} />
                <Text style={styles.changeImageText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              {/* Existing Caption Input - MODIFIED onChangeText and added blurOnSubmit */}
              <View style={[styles.captionContainer, { marginBottom: 15 }]}>
                <Image
                  source={user?.imageUrl}
                  style={styles.userAvatar}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <TextInput
                  multiline={true} // Keep multiline for visual wrapping
                  style={[styles.captionInput, Platform.OS === 'android' && { textAlignVertical: 'top' }]}
                  placeholder="Write a caption..."
                  placeholderTextColor={COLORS.secondary}
                  value={caption}
                  onChangeText={(text) => {
                    // Filter out newline characters to prevent "Enter" from creating new lines
                    const newText = text.replace(/\n/g, '');
                    setCaption(newText);
                  }}
                  editable={!isSharing}
                  maxLength={CAPTION_MAX_LENGTH}
                  returnKeyType="done" // Shows 'Done'/'Tick' button
                  blurOnSubmit={true} // Dismisses keyboard when 'Done'/'Tick' is pressed
                  onSubmitEditing={Keyboard.dismiss} // Explicitly dismisses keyboard
                />
              </View>

              {/* --- Rating Slider & Category Radio Buttons (on the same line) --- */}
              <View style={localStyles.inlineInputGroup}>
                {/* Rating Slider */}
                <View style={localStyles.ratingSliderWrapper}>
                  <Text style={styles.inputLabel}>Customer Rating (out of 5):</Text>
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={5}
                      step={0.5}
                      value={rating}
                      onValueChange={setRating}
                      minimumTrackTintColor={COLORS.primary}
                      maximumTrackTintColor={COLORS.secondary}
                      thumbTintColor={COLORS.primary}
                      disabled={isSharing}
                    />
                    <Text style={styles.sliderValueText}>{rating.toFixed(1)}</Text>
                  </View>
                </View>

                {/* Category Radio Buttons */}
                <View style={localStyles.categoryRadioGroup}>
                  <Text style={styles.inputLabel}>Category:</Text>
                  <View style={localStyles.radioOptionsContainer}>
                    <RadioOption
                      label="Refurbished"
                      selected={category === "refurbished"}
                      onPress={() => setCategory("refurbished")}
                      disabled={isSharing}
                    />
                    <RadioOption
                      label="Recycled"
                      selected={category === "recycled"}
                      onPress={() => setCategory("recycled")}
                      disabled={isSharing}
                    />
                  </View>
                </View>
              </View>
              {/* --- END Rating Slider & Category Radio Buttons --- */}

            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// --- Local Styles for Radio Buttons and Inline Grouping ---
// You should consider moving these to your `create.styles.ts` file for consistency.
const localStyles = StyleSheet.create({
  inlineInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute items evenly
    alignItems: 'flex-start', // Align items to the top
    marginBottom: 20, // Space below this group
    width: '100%',
    // paddingHorizontal: 16, // If your parent `inputSection` doesn't have it
  },
  ratingSliderWrapper: {
    flex: 1, // Take available space
    marginRight: 10, // Space between slider and radio buttons
  },
  categoryRadioGroup: {
    flex: 1, // Take available space
    alignItems: 'flex-start', // Align text and radios to start
  },
  radioOptionsContainer: {
    flexDirection: 'column', // Stack radio buttons vertically
    marginTop: 5, // Space from "Category:" label
  },
});


// --- Styles for the RadioOption component (add these to your `create.styles.ts` or a new `radio.styles.ts`) ---
// For demonstration, kept here.
const radioStyles = StyleSheet.create({
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Space between radio options
  },
  radioOptionDisabled: {
    opacity: 0.6,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedCircle: {
    borderColor: COLORS.primary,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  radioLabelDisabled: {
    color: COLORS.secondary,
  },
});