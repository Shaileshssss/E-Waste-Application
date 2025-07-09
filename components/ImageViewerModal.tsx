// components/ImageViewerModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme'; // Ensure this path is correct

type ImageViewerModalProps = {
  visible: boolean;
  imageUrl: string;
  caption: string;
  onClose: () => void;
};

export default function ImageViewerModal({
  visible,
  imageUrl,
  caption,
  onClose,
}: ImageViewerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true} // Makes the background semi-transparent
      animationType="fade" // Smooth fade in/out
      onRequestClose={onClose} // Handles Android back button
    >
      <View style={styles.overlay}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close-circle" size={36} color={COLORS.white} />
        </TouchableOpacity>

        {/* Enlarged Image */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.fullImage}
          contentFit="contain" // Ensures the whole image is visible
          transition={200}
        />

        {/* Caption */}
        {caption && ( // Only show caption if it exists
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.brand, // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 5, // Adjust as needed for proper spacing from status bar
    right: 20,
    zIndex: 1, // Ensure button is above the image
    padding: 2,
    backgroundColor: "red",
    borderRadius: 55,
  },
  fullImage: {
    width: '90%', // Occupy most of the screen width
    height: '70%', // Occupy most of the screen height
    borderRadius: 8, // Optional: rounded corners for the image
  },
  captionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    maxWidth: '90%',
  },
  captionText: {
    color: COLORS.black,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});