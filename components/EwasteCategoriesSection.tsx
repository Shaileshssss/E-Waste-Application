// components/EwasteCategoriesSection.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { EWASTE_CATEGORIES, EwasteCategoryItemData } from '@/constants/ewasteCategories'; 
import { COLORS } from '@/constants/theme';
import EwasteCategoryItem from './EwasteCategoryItem'; 

const getDailyRandomColor = (itemId: string): string => {
  const colorPalette = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.red,
    '#FF69B4',
    '#8A2BE2', 
    '#00CED1', 
    '#FF8C00', 
    '#32CD32',
  ];

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const seed = startOfDay + itemId.charCodeAt(0);

  const pseudoRandom = (seed * 9301 + 49297) % 233280;
  const randomIndex = Math.floor((pseudoRandom / 233280) * colorPalette.length);

  return colorPalette[randomIndex];
};

export default function EwasteCategoriesSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recycling Categories</Text> 
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList} 
      >
        {EWASTE_CATEGORIES.map((categoryItem: EwasteCategoryItemData) => { 
          const borderColor = getDailyRandomColor(categoryItem.id);
          return (
            <EwasteCategoryItem 
              key={categoryItem.id} 
              categoryItem={categoryItem} 
              borderColor={borderColor} 
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    marginBottom: 10,
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 10,
  },
});