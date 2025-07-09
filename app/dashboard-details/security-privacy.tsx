// app/(tabs)/(dashboard-details)/security-privacy.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@clerk/clerk-expo'; // Assuming Clerk is used for auth features here

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
  isDestructive?: boolean;
}

// Reusable SettingItem Component (assuming it's defined within this file or imported)
const SettingItem: React.FC<SettingItemProps> = ({ icon, text, onPress, isDestructive = false }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingItemLeft}>
      <Ionicons name={icon} size={22} color={isDestructive ? COLORS.red : COLORS.text} style={styles.settingIcon} />
      <Text style={[styles.settingText, isDestructive && { color: COLORS.red }]}>
        {text}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLORS.darkGray} />
  </TouchableOpacity>
);

// --- FIX: Ensure 'export default' is present ---
export default function SecurityPrivacyScreen() {
// --- END FIX ---
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth(); // Example Clerk usage

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This would navigate to a password change interface, often provided by Clerk.');
    // Example: router.push('/(auth)/reset-password'); // If you have a specific route
  };

  const handleTwoFactorAuth = () => {
    Alert.alert('Two-Factor Authentication (2FA)', 'Enable or disable 2FA for added security.');
  };

  const handleManageSessions = () => {
    Alert.alert('Manage Active Sessions', 'View and revoke active login sessions across devices.');
  };

  const handleDataPermissions = () => {
    // This now routes to legal-info.tsx with docType 'data'
    router.push('/dashboard-details/legal-info?docType=data');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been marked for deletion.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Security & Privacy',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.text,
            fontWeight: 'bold',
          },
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <SettingItem
            icon="key-outline"
            text="Change Password"
            onPress={handleChangePassword}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            text="Two-Factor Authentication (2FA)"
            onPress={handleTwoFactorAuth}
          />
          <SettingItem
            icon="desktop-outline"
            text="Manage Active Sessions"
            onPress={handleManageSessions}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Permissions</Text>
          <SettingItem
            icon="lock-closed-outline"
            text="Manage Data Permissions"
            onPress={handleDataPermissions}
          />
          {/* You could add more items like 'Export Data' or 'Privacy Dashboard' */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <SettingItem
            icon="trash-outline"
            text="Delete Account"
            onPress={handleDeleteAccount}
            isDestructive
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  backButton: {
    marginLeft: 10,
    padding: 5,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden', // Ensures inner items respect rounded corners
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
    width: 24, // Fixed width for consistent alignment
    textAlign: 'center',
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
});