// components/SearchBar.tsx
import React, { useRef } from "react"; // Removed useState as it will be controlled by parent
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useRouter } from 'expo-router';

// A debug flag to easily turn console logs on/off
const DEBUG_MODE = true; // Set to false when you're done debugging!

const initialSuggestions = [
  "Laptops",
  "Mobile phone",
  "Smartphones",
  "Audio",
  "Charger",
  "Cables",
  "TV",
  "Monitor",
  "Printer",
  "Keyboard",
  "Mouse",
  "Headphones",
  "Smartwatch",
  "PC Components",
  "Desktop computer",
  "Tablet",
  "Remote control",
  "Batteries (AA, AAA, etc.)",
  "LED lights",
  "Old computers and accessories",
  "Damaged appliances",
  "E-waste recycling services",
];

// Define props for the SearchBar component
interface SearchBarProps {
  value: string; // The current search query passed from parent
  onChangeText: (text: string) => void; // Callback to update the search query in parent
}

// Changed to accept props: value and onChangeText
export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  // Removed internal searchText state, now using 'value' prop
  const [ghostText, setGhostText] = React.useState<string>(""); // Keep internal ghostText state
  const [currentMatchedSuggestion, setCurrentMatchedSuggestion] = React.useState<string | null>(null); // Keep internal matched suggestion state
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  const log = (...args: any[]) => {
    if (DEBUG_MODE) {
      console.log('SearchBar:', ...args);
    }
  };

  // Effect to update ghost text and matched suggestion whenever the 'value' prop changes
  React.useEffect(() => {
    log(`Value prop changed to "${value}". Updating internal ghost/suggestion logic.`);
    const trimmedLowerCaseText = value.trim().toLowerCase();

    setGhostText("");
    setCurrentMatchedSuggestion(null);

    if (trimmedLowerCaseText.length === 0) {
      return;
    }

    const startsWithMatch = initialSuggestions.find(
      (suggestion) => suggestion.toLowerCase().startsWith(trimmedLowerCaseText)
    );

    if (startsWithMatch) {
      setCurrentMatchedSuggestion(startsWithMatch);
      if (startsWithMatch.toLowerCase() !== trimmedLowerCaseText) {
        setGhostText(startsWithMatch.substring(value.length));
      }
    } else {
      const includesMatch = initialSuggestions.find(
        (suggestion) => suggestion.toLowerCase().includes(trimmedLowerCaseText)
      );
      if (includesMatch) {
        setCurrentMatchedSuggestion(includesMatch);
      } else {
        setCurrentMatchedSuggestion(value.trim());
      }
    }
  }, [value]); // Depend on 'value' prop

  const handleSearchTextChange = (text: string) => {
    log(`Internal text change handler called with "${text}". Propagating to parent.`);
    onChangeText(text); // Propagate the change to the parent component
  };

  const handleClearInput = () => {
    log("Clearing input and propagating empty string to parent.");
    onChangeText(""); // Propagate empty string to parent
    setGhostText("");
    setCurrentMatchedSuggestion(null);
    inputRef.current?.clear();
  };

  const handleSearchSubmit = () => {
    log(`Submitting search. Current value: "${value}".`);

    const finalSearchTerm = currentMatchedSuggestion || value.trim();

    log(`Final search term for routing: "${finalSearchTerm}".`);

    if (finalSearchTerm.trim()) {
      router.push({
        pathname: "/products/MoreProducts",
        params: { category: finalSearchTerm.trim() }
      });

      // Clear the input and ghost text AFTER navigation is initiated
      onChangeText(""); // Propagate empty string to parent
      setGhostText("");
      setCurrentMatchedSuggestion(null);
      inputRef.current?.clear();
      log("Input cleared after search submission.");
    } else {
      log("Search term is empty or only whitespace. Not navigating.");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color={COLORS.secondary} style={styles.icon} />
        <View style={styles.textInputLayeringContainer}>
          {/* Ghost text displayed behind the transparent TextInput */}
          {value.length > 0 && ghostText.length > 0 && (
            <Text style={styles.ghostText}>
              <Text style={{ color: 'transparent' }}>{value}</Text> {/* Use 'value' prop here */}
              <Text style={styles.ghostTextCompletion}>{ghostText}</Text>
            </Text>
          )}
          <TextInput
            ref={inputRef}
            placeholder="Search e-waste categories, items..."
            placeholderTextColor={COLORS.secondary}
            style={styles.inputAutofill}
            value={value} // Now uses the 'value' prop
            onChangeText={handleSearchTextChange} // Uses the new handler
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
            autoCapitalize="none"
          />
        </View>
        {value.length > 0 && ( // Use 'value' prop here
          <TouchableOpacity onPress={handleClearInput} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="red" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    zIndex: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: -8,
    position: 'relative',
    backgroundColor: COLORS.brand,
  },
  searchBarContainer: {
    flexDirection: 'row',
    backgroundColor: "#F5F5F5",
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderColor: "gray",
    borderWidth: 1,
    width: '100%',
  },
  icon: {
    marginRight: 8,
  },
  textInputLayeringContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  inputAutofill: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  ghostText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: 16,
    color: 'transparent', // Make the typed part transparent
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  ghostTextCompletion: {
    color: COLORS.secondary, // Color for the suggested completion part
  },
  clearButton: {
    paddingLeft: 8,
    paddingVertical: 2,
  },
});