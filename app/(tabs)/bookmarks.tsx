import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.style";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { MotiView } from "moti";

const IMAGE_GAP = 8;
const NUM_COLUMNS = 3;

export default function Bookmarks() {
  const { width } = useWindowDimensions();
  const itemSize = (width - IMAGE_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (bookmarkedPosts === undefined) return <Loader />;
  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.brand }}>
      <View style={[styles.header, { padding: 16 }]}>
        <Text style={[styles.headerTitle, { fontSize: 22 }]}>Bookmarks</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingLeft: IMAGE_GAP,
          paddingTop: IMAGE_GAP,
        }}
        showsVerticalScrollIndicator={false}
      >
        {bookmarkedPosts.map((post, index) => {
          if (!post) return null;

          const isLastInRow = (index + 1) % NUM_COLUMNS === 0;
          const marginRight = isLastInRow ? 0 : IMAGE_GAP;

          return (
            <TouchableOpacity key={post._id} activeOpacity={0.7}>
              <MotiView
                from={{
                  opacity: 0,
                  translateY: 20,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: "timing",
                  duration: 400,
                  delay: index * 100,
                }}
                style={{
                  width: itemSize,
                  height: itemSize,
                  marginBottom: IMAGE_GAP,
                  marginRight: marginRight,
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: "#f5f5f5",
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                }}
              >
                <Image
                  source={post.imageUrl}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </MotiView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function NoBookmarksFound() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: COLORS.background,
      }}
    >
      <View
        style={{
          backgroundColor: "#ffe6cc",
          padding: 24,
          borderRadius: 16,
          alignItems: "center",
          elevation: 3,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            color: "#ff6600",
            marginBottom: 8,
            fontWeight: "bold",
          }}
        >
          No Bookmarks Yet!
        </Text>
        <Text style={{ fontSize: 16, color: "#333", textAlign: "center" }}>
          You haven’t bookmarked any posts. Start exploring and save your
          favorites!
        </Text>
      </View>
    </SafeAreaView>
  );
}
