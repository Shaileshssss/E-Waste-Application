// app/sell/informationList.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Image } from "expo-image"; 

import { COLORS } from '@/constants/theme';
import { EWASTE_CATEGORIES, EwasteCategoryItemData } from '@/constants/ewasteCategories'; 


const NUM_COLUMNS = 3;
const ITEM_SPACING = 15;

export default function InformationList() {
  return (
    <SafeAreaView style={listStyles.safeArea}>
      <View style={listStyles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={listStyles.backButtonTouchable}
          activeOpacity={0.7}
        >
          <MotiView
            from={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            // whileTap={{ scale: 0.9, opacity: 0.7 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
            style={listStyles.backIconContainer}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </MotiView>
        </TouchableOpacity>
        <Text style={listStyles.headerTitle}>Select Category</Text>
        <View style={listStyles.rightPlaceholder} />
      </View>

      <View style={listStyles.infoBox}>
        <Text style={listStyles.infoTitle}>Recycle with Ease!</Text>
        <Text style={listStyles.infoDescription}>
          Choose a category below to find out how to safely recycle your e-waste and contribute to a greener planet.
        </Text>
        <Text style={listStyles.categoryCountText}>
          {EWASTE_CATEGORIES.length} Categories Available 
        </Text>
      </View>

      <FlatList
        data={EWASTE_CATEGORIES} 
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 50 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 150,
              mass: 1,
              delay: index * 100,
            }}
            style={listStyles.motiContainer}
          >
            <Link
              href={{
                pathname: "/category/[id]", 
                params: {
                  id: item.id, 
                },
              }}
              asChild
            >
              <TouchableOpacity
                style={listStyles.itemButton}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[COLORS.white, COLORS.lightGray]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={listStyles.gradientBackground}
                >

                  <Image 
                    source={{ uri: item.avatar }} 
                    style={listStyles.itemImage} 
                    contentFit="contain" 
                  />
                  <Text
                    style={listStyles.itemText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.title || item.categoryName} 
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          </MotiView>
        )}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={listStyles.listContainer}
        columnWrapperStyle={listStyles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const listStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee',
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  backButtonTouchable: {
    padding: 8,
  },
  backIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightPlaceholder: {
    width: 38,
  },
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginHorizontal: ITEM_SPACING,
    marginTop: ITEM_SPACING,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 15,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  categoryCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: ITEM_SPACING,
    paddingTop: ITEM_SPACING,
    paddingBottom: ITEM_SPACING * 2,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: ITEM_SPACING,
  },
  motiContainer: {
    flex: 1,
    marginHorizontal: ITEM_SPACING / 2,
    aspectRatio: 1,
  },
  itemButton: {
    flex: 1,
    borderRadius: 15,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  // --- NEW STYLE FOR IMAGE ---
  itemImage: {
    width: 50, // Adjust size as needed
    height: 50, // Adjust size as needed
    marginBottom: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});