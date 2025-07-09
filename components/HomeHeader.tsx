// // components/HomeHeader.tsx
// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { COLORS } from '@/constants/theme';
// import { useRouter } from 'expo-router';

// // --- Suggestions data (copied for header functionality) ---
// const initialSuggestions = [
//   "Laptops", "Mobile phone", "Smartphones", "Audio", "Charger", "Cables",
//   "TV", "Monitor", "Printer", "Keyboard", "Mouse", "Headphones",
//   "Smartwatch", "PC Components", "Desktop computer", "Tablet",
//   "Remote control", "Batteries (AA, AAA, etc.)", "LED lights",
//   "Old computers and accessories", "Damaged appliances", "E-waste recycling services",
// ];
// // --- End Suggestions data ---

// interface HomeHeaderProps {
//   showHeaderSearchIcon: boolean; // Controls if search icon/input is visible
//   isHeaderSearchActive: boolean; // Controls if search input is expanded
//   setIsHeaderSearchActive: (active: boolean) => void; // Setter for isHeaderSearchActive
//   searchQuery: string; // Current search text
//   setSearchQuery: (query: string) => void; // Setter for search text
//   handleSignOut: () => void; // Function for signing out
// }

// export default function HomeHeader({
//   showHeaderSearchIcon,
//   isHeaderSearchActive,
//   setIsHeaderSearchActive,
//   searchQuery,
//   setSearchQuery,
//   handleSignOut,
// }: HomeHeaderProps) {
//   const router = useRouter();

//   // States for ghost text and matched suggestion specifically for the header search
//   const [headerGhostText, setHeaderGhostText] = useState<string>("");
//   const [headerCurrentMatchedSuggestion, setHeaderCurrentMatchedSuggestion] = useState<string | null>(null);

//   // --- Header TextInput Change Handler (includes ghost text logic) ---
//   const handleHeaderTextInputChange = (text: string) => {
//     setSearchQuery(text); // Update central search query

//     const trimmedLowerCaseText = text.trim().toLowerCase();

//     setHeaderGhostText("");
//     setHeaderCurrentMatchedSuggestion(null);

//     if (trimmedLowerCaseText.length === 0) {
//       return;
//     }

//     const startsWithMatch = initialSuggestions.find(
//       (suggestion) => suggestion.toLowerCase().startsWith(trimmedLowerCaseText)
//     );

//     if (startsWithMatch) {
//       setHeaderCurrentMatchedSuggestion(startsWithMatch);
//       if (startsWithMatch.toLowerCase() !== trimmedLowerCaseText) {
//         setHeaderGhostText(startsWithMatch.substring(text.length));
//       }
//     } else {
//       const includesMatch = initialSuggestions.find(
//         (suggestion) => suggestion.toLowerCase().includes(trimmedLowerCaseText)
//       );

//       if (includesMatch) {
//         setHeaderCurrentMatchedSuggestion(includesMatch);
//       } else {
//         setHeaderCurrentMatchedSuggestion(text.trim());
//       }
//     }
//   };
//   // --- End Header TextInput Change Handler ---

//   // Function to handle the "Search" button click in the header (or onSubmitEditing)
//   const handleHeaderSearchRedirect = () => {
//     const finalSearchTerm = headerCurrentMatchedSuggestion || searchQuery.trim();

//     if (finalSearchTerm.trim()) {
//       router.push({
//         pathname: "/products/MoreProducts",
//         params: { category: finalSearchTerm.trim() },
//       });
//       // Reset header search UI states after redirect
//       setIsHeaderSearchActive(false);
//       setSearchQuery(""); // Clear the input
//       setHeaderGhostText("");
//       setHeaderCurrentMatchedSuggestion(null);
//     } else {
//       Alert.alert("Search", "Please enter a search term.");
//     }
//   };

//   // Reset ghost text states when header search becomes inactive
//   useEffect(() => {
//     if (!isHeaderSearchActive) {
//       setHeaderGhostText("");
//       setHeaderCurrentMatchedSuggestion(null);
//     }
//   }, [isHeaderSearchActive]);


//   return (
//     <View style={styles.header}>
//       {isHeaderSearchActive ? (
//         // Show input box + search button + close button
//         <View style={styles.headerSearchInputContainer}>
//           <View style={styles.headerTextInputWrapper}>
//             {searchQuery.length > 0 && headerGhostText.length > 0 && (
//               <Text style={styles.headerGhostText}>
//                 <Text style={{ color: 'transparent' }}>{searchQuery}</Text>
//                 <Text style={styles.headerGhostTextCompletion}>{headerGhostText}</Text>
//               </Text>
//             )}
//             <TextInput
//               style={styles.headerSearchInput}
//               placeholder="Search..."
//               value={searchQuery}
//               onChangeText={handleHeaderTextInputChange}
//               placeholderTextColor={COLORS.secondary}
//               autoFocus={true}
//               returnKeyType="search"
//               onSubmitEditing={handleHeaderSearchRedirect}
//             />
//           </View>
//           <TouchableOpacity onPress={handleHeaderSearchRedirect} style={styles.headerSearchIconRight}>
//             <Ionicons name="search" size={24} color={COLORS.primary} />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => { setIsHeaderSearchActive(false); setSearchQuery(""); }} style={styles.headerCloseIcon}>
//             <Ionicons name="close-circle" size={24} color={COLORS.secondary} />
//           </TouchableOpacity>
//         </View>
//       ) : (
//         // Default header: Title + optional search icon + logout icon
//         <>
//           <Text style={styles.headerTitle}>E-Waste ♻️</Text>
//           <View style={styles.headerRightIcons}>
//             {showHeaderSearchIcon && ( // Only show search icon if scrolled down
//               <TouchableOpacity
//                 onPress={() => setIsHeaderSearchActive(true)} // Clicking icon activates header search
//                 style={{ marginRight: 15 }}
//               >
//                 <Ionicons name="search" size={24} color={COLORS.primary} />
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity onPress={handleSignOut}>
//               <Ionicons name="log-out-outline" size={30} color="red" />
//             </TouchableOpacity>
//           </View>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     backgroundColor: COLORS.brand,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//     zIndex: 10,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: COLORS.primary,
//   },
//   headerRightIcons: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   headerSearchInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.lightGray,
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     flex: 1,
//     height: 40,
//   },
//   headerTextInputWrapper: {
//     flex: 1,
//     position: 'relative',
//     justifyContent: 'center',
//     height: '100%',
//   },
//   headerSearchInput: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     color: COLORS.text,
//     fontSize: 16,
//     backgroundColor: 'transparent',
//     paddingHorizontal: 0,
//     paddingVertical: 0,
//   },
//   headerGhostText: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     fontSize: 16,
//     color: 'transparent',
//     paddingHorizontal: 0,
//     paddingVertical: 0,
//   },
//   headerGhostTextCompletion: {
//     color: COLORS.secondary,
//   },
//   headerSearchIconRight: {
//     paddingHorizontal: 5,
//   },
//   headerCloseIcon: {
//     paddingLeft: 5,
//   },
// });