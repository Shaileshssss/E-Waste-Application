import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { COLORS } from '@/constants/theme';
import { EwasteCategoryItemData } from '@/constants/ewasteCategories'; // Import the type

interface EwasteCategoryItemProps {
  categoryItem: EwasteCategoryItemData;
  borderColor: string; // Prop for dynamic border color from parent
}

export default function EwasteCategoryItem({ categoryItem, borderColor }: EwasteCategoryItemProps) {
  const router = useRouter();

  const handlePress = () => {
    // Navigates to the dynamic category detail page: app/category/[id].tsx
    router.push({
      pathname: "/category/[id]",
      params: {
        id: categoryItem.id, // Pass the unique ID of the category item
      },
    });
  };

  return (
    <TouchableOpacity style={localStyles.categoryItem} onPress={handlePress}>
      <View style={[localStyles.categoryIconContainer, { borderColor: borderColor }]}>
        <Image source={{ uri: categoryItem.avatar }} style={localStyles.categoryIcon} />
      </View>
      <Text style={localStyles.categoryName} numberOfLines={2}>
        {categoryItem.title || categoryItem.categoryName}
      </Text>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70, // Cons
    // istent width for each item
  },
  categoryIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 30, // Make it a perfect circle
    borderWidth: 3, // Border for the "story ring" effect
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    padding: 2, // Padding inside border to keep icon from touching edge
    backgroundColor: COLORS.lightGray, // Fallback background for circle
  },
  categoryIcon: {
    width: 45, // Size of the icon itself
    height: 45,
  },
  categoryName: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    maxWidth: '100%',
  },
});