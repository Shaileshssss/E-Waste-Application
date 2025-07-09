// index.tsx
import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Alert,
  StyleSheet,
  TextInput, // Make sure TextInput is imported
} from "react-native";
import { useEffect, useRef, useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import ImageCarousel from "@/components/ImageCarousel";
import MarqueeBanner from "@/components/Banner";
import WelcomeText from "../../components/Welcome";
import EwasteBarChart from "../ChartTest";
import { useRouter } from "expo-router";
import CategoryGrid from "@/components/CategoryGrid";
import FlippingImageDisplay from "@/components/FlippingImageDisplay";
import Information from "../sell/information";
import { appEventEmitter } from "@/utils/eventEmitter";
import LottieView from "lottie-react-native";
import EwasteCategoriesSection from "@/components/EwasteCategoriesSection";
import VideoPlayerSection, {
  VideoPlayerRef,
} from "@/components/VideoPlayerSection";
import RecycleGoal from "@/components/RecycleGoal";
import RecyclingPromoCountdown from "../flipper/ff";
import EcoActionCard from "../flipper/ff";
import EwasteImpactSection from "../flipper/ff";
import CoverageAndLeadershipCard from "../flipper/ff";
import TrustAndCompliance from "../flipper/SendEmailScreen";

// --- Suggestions data (copied from SearchBar.tsx for header functionality) ---
const initialSuggestions = [
  "Laptops", "Mobile phone", "Smartphones", "Audio", "Charger", "Cables",
  "TV", "Monitor", "Printer", "Keyboard", "Mouse", "Headphones",
  "Smartwatch", "PC Components", "Desktop computer", "Tablet",
  "Remote control", "Batteries (AA, AAA, etc.)", "LED lights",
  "Old computers and accessories", "Damaged appliances", "E-waste recycling services",
];

export default function Index() {
  const { signOut, isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showHomeLoading, setShowHomeLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const videoRef = useRef<VideoPlayerRef>(null);

  const [showHeaderSearchIcon, setShowHeaderSearchIcon] = useState(false);
  const [isHeaderSearchActive, setIsHeaderSearchActive] = useState(false);

  // Centralized search query state (shared by main SearchBar and header TextInput)
  const [searchQuery, setSearchQuery] = useState("");

  // States for ghost text and matched suggestion specifically for the header search
  const [headerGhostText, setHeaderGhostText] = useState<string>("");
  const [headerCurrentMatchedSuggestion, setHeaderCurrentMatchedSuggestion] = useState<string | null>(null);


  const allPosts = useQuery(
    api.post.getFeedPosts,
    isLoaded && isSignedIn ? {} : "skip"
  );

  const filteredPosts = useMemo(() => {
    if (!allPosts) return [];
    if (searchQuery.trim() === "") {
      return allPosts;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return allPosts.filter(
      (post) =>
        // FIX: Changed post.caption to post.capiton as per TypeScript error
        post.capiton?.toLowerCase().includes(lowerCaseQuery) ||
        post.category?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [allPosts, searchQuery]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Sign Out Failed", "Could not sign out. Please try again.");
    }
  };

  // --- Header TextInput Change Handler (includes ghost text logic) ---
  const handleHeaderTextInputChange = (text: string) => {
    setSearchQuery(text); // Update central search query

    const trimmedLowerCaseText = text.trim().toLowerCase();

    setHeaderGhostText("");
    setHeaderCurrentMatchedSuggestion(null);

    if (trimmedLowerCaseText.length === 0) {
      return;
    }

    // 1. Try to find a suggestion that starts with the trimmed input (for ghost text)
    const startsWithMatch = initialSuggestions.find(
      (suggestion) => suggestion.toLowerCase().startsWith(trimmedLowerCaseText)
    );

    if (startsWithMatch) {
      setHeaderCurrentMatchedSuggestion(startsWithMatch);
      // Only show ghost text if it's not an exact match
      if (startsWithMatch.toLowerCase() !== trimmedLowerCaseText) {
        setHeaderGhostText(startsWithMatch.substring(text.length));
      }
    } else {
      // 2. If no startsWith match, try to find a suggestion that INCLUDES the trimmed input (for broader search)
      const includesMatch = initialSuggestions.find(
        (suggestion) => suggestion.toLowerCase().includes(trimmedLowerCaseText)
      );

      if (includesMatch) {
        setHeaderCurrentMatchedSuggestion(includesMatch);
      } else {
        // If no startsWith or includes match, still allow the user's raw input
        setHeaderCurrentMatchedSuggestion(text.trim());
      }
    }
  };
  // --- End Header TextInput Change Handler ---


  // Function to handle the "Search" button click in the header (or onSubmitEditing)
  const handleHeaderSearchRedirect = () => {
    // Use the best matched suggestion, or fallback to the current trimmed search query
    const finalSearchTerm = headerCurrentMatchedSuggestion || searchQuery.trim();

    if (finalSearchTerm.trim()) {
      router.push({
        pathname: "/products/MoreProducts",
        params: { category: finalSearchTerm.trim() },
      });
      // Reset header search UI states after redirect
      setIsHeaderSearchActive(false);
      setSearchQuery(""); // Clear the input
      setHeaderGhostText("");
      setHeaderCurrentMatchedSuggestion(null);
    } else {
      Alert.alert("Search", "Please enter a search term.");
    }
  };

  useEffect(() => {
    const handleHomeTabPress = () => {
      if (videoRef.current?.pauseVideo) {
        videoRef.current.pauseVideo();
      }
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
      setShowHomeLoading(true);
      // Reset all search-related states when scrolling to top/home tab pressed
      setShowHeaderSearchIcon(false);
      setIsHeaderSearchActive(false);
      setSearchQuery("");
      setHeaderGhostText("");
      setHeaderCurrentMatchedSuggestion(null);

      const timer = setTimeout(() => {
        setShowHomeLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    };

    appEventEmitter.on("homeTabPressed", handleHomeTabPress);
    return () => {
      appEventEmitter.off("homeTabPressed", handleHomeTabPress);
    };
  }, []);

  if (!isLoaded || allPosts === undefined || showHomeLoading) {
    return <Loader />;
  }

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const SEARCH_BAR_THRESHOLD = 350; // Adjust based on when your main SearchBar disappears

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (scrollY > SEARCH_BAR_THRESHOLD && !showHeaderSearchIcon) {
      setShowHeaderSearchIcon(true);
    } else if (scrollY <= SEARCH_BAR_THRESHOLD && showHeaderSearchIcon) {
      setShowHeaderSearchIcon(false);
      setIsHeaderSearchActive(false); // Hide the header search UI if scrolling back up
      setSearchQuery(""); // Clear search query when main bar is visible again
      setHeaderGhostText("");
      setHeaderCurrentMatchedSuggestion(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Conditional rendering for Header Search UI */}
        {isHeaderSearchActive ? (
          // Show input box + search button + close button
          <View style={styles.headerSearchInputContainer}>
            <View style={styles.headerTextInputWrapper}>
              {searchQuery.length > 0 && headerGhostText.length > 0 && (
                <Text style={styles.headerGhostText}>
                  <Text style={{ color: 'transparent' }}>{searchQuery}</Text>
                  <Text style={styles.headerGhostTextCompletion}>{headerGhostText}</Text>
                </Text>
              )}
              <TextInput
                style={styles.headerSearchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleHeaderTextInputChange} // Use new handler for header
                placeholderTextColor={COLORS.secondary}
                autoFocus={true} // Auto-focus when it appears
                returnKeyType="search"
                onSubmitEditing={handleHeaderSearchRedirect} // Allows pressing Enter to search
              />
            </View>
            <TouchableOpacity onPress={handleHeaderSearchRedirect} style={styles.headerSearchIconRight}>
              <Ionicons name="search" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsHeaderSearchActive(false); setSearchQuery(""); setHeaderGhostText(""); setHeaderCurrentMatchedSuggestion(null); }} style={styles.headerCloseIcon}>
              <Ionicons name="close-circle" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        ) : (
          // Default header: Title + optional search icon + logout icon
          <>
            <Text style={styles.headerTitle}>E-Waste ♻️</Text>
            <View style={styles.headerRightIcons}>
              {showHeaderSearchIcon && ( // Only show search icon if scrolled down
                <TouchableOpacity
                  onPress={() => setIsHeaderSearchActive(true)} // Clicking icon activates header search
                  style={{ marginRight: 15 }}
                >
                  <Ionicons name="search" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={30} color="red" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredPosts}
        renderItem={({ item }) => (
          <Post post={item} totalPostsInColumn={(filteredPosts || []).length} />
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 2,
          marginBottom: 12,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 60,
          paddingTop: 12,
        }}
        ListHeaderComponent={
          <>
            <EwasteCategoriesSection />
            <WelcomeText />
            {/* Main SearchBar - connected to central searchQuery */}
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            <ImageCarousel />
            <CategoryGrid />
            <EwasteBarChart />
            <FlippingImageDisplay />
            <VideoPlayerSection ref={videoRef} />
            <Information />
            <RecycleGoal />
            <CoverageAndLeadershipCard />
            <MarqueeBanner />
            <TrustAndCompliance />
            <Text style={styles.dailyPostHeading}>Latest Product Feedback</Text>
          </>
        }
        ListEmptyComponent={
          filteredPosts.length === 0 ? <NoPostsFound /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
          />
        }
        onScroll={handleScroll} // Attach the scroll handler
        scrollEventThrottle={16} // Important for smooth scroll monitoring
      />
    </View>
  );
}

const NoPostsFound = () => (
  <View style={noPostsStyles.container}>
    <LottieView
      source={require("@/assets/lottie/No_Posts.json")}
      autoPlay
      loop
      style={{ width: 200, height: 200 }}
    />
    <Text style={noPostsStyles.text}>No posts yet</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brand,
    paddingTop: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.brand,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10, // Ensure header stays on top of content
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  // New styles for the header search input field and its buttons
  headerSearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray, // Background for the search input
    borderRadius: 20,
    paddingHorizontal: 10, // Padding for the content inside the container
    flex: 1, // Allows the input container to take available space
    height: 40, // Fixed height for input to fit in header
  },
  headerTextInputWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center', // Vertically align text
    height: '100%', // Take full height of parent
  },
  headerSearchInput: {
    position: 'absolute', // Position over ghost text
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: COLORS.text,
    fontSize: 16,
    backgroundColor: 'transparent', // Crucial for ghost text
    paddingHorizontal: 0, // No internal padding as it's handled by container
    paddingVertical: 0,
  },
  headerGhostText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: 16, // Must match input font size
    color: 'transparent', // Typed part is transparent
    paddingHorizontal: 0, // Must match input's internal padding (none here)
    paddingVertical: 0,
  },
  headerGhostTextCompletion: {
    color: COLORS.secondary, // Color for the suggested completion part
  },
  headerSearchIconRight: {
    paddingHorizontal: 5, // Space around the search icon within the input field
  },
  headerCloseIcon: {
    paddingLeft: 5, // Space to the left of the close icon
  },
  dailyPostHeading: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 10,
    color: COLORS.text,
  },
});

const noPostsStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.brand,
    paddingVertical: 50,
  },
  text: {
    fontSize: 20,
    color: COLORS.primary,
  },
});