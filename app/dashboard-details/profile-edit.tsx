// app/profile/edit-profile-screen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-expo';
import { api } from '@/convex/_generated/api';
import { COLORS } from '@/constants/theme';
import { Doc } from '@/convex/_generated/dataModel';

export default function EditProfileScreen() {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth(); // Get Clerk user ID

  // Fetch current user data from Convex
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  // Mutation to update user profile
  const updateUserProfile = useMutation(api.users.updateUserProfile);

  // State for form fields
  const [username, setUsername] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [phoneNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false); // For save button loading state

  // Populate form fields when user data is loaded
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setHomeAddress(currentUser.homeAddress || '');
      setOfficeAddress(currentUser.officeAddress || '');
      setContactNumber(currentUser.phoneNumber || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'User data not loaded.');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        userId: currentUser._id,
        username,
        homeAddress,
        officeAddress,
        phoneNumber,
      });
      Alert.alert('Success', 'Profile updated successfully!');
      router.back(); // Go back to the profile view
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (currentUser === undefined) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </SafeAreaView>
    );
  }

  // If currentUser is null (meaning user not found in DB but authenticated by Clerk)
  // This case should ideally not happen if createUser mutation on sign-in works correctly.
  if (currentUser === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User profile not found. Please try logging in again.</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonErrorText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Username */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
          />
        </View>

        {/* Home Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Home Address</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={homeAddress}
            onChangeText={setHomeAddress}
            placeholder="Enter your home address"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Office Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Office Address (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={officeAddress}
            onChangeText={setOfficeAddress}
            placeholder="Enter your office address (optional)"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Contact Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.textInput}
            value={phoneNumber}
            onChangeText={setContactNumber}
            placeholder="Enter your contact number"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.brand,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonErrorText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.text,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  multilineInput: {
    minHeight: 100, // Make multiline input taller
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});