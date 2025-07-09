// // components/HomeMainContent.tsx
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import SearchBar from '@/components/SearchBar';
// import ImageCarousel from '@/components/ImageCarousel';
// import MarqueeBanner from '@/components/Banner';
// import WelcomeText from '../components/Welcome'; // Adjust path if necessary
// import EwasteBarChart from '../app/ChartTest'; // Adjust path if necessary
// import CategoryGrid from '@/components/CategoryGrid';
// import FlippingImageDisplay from '@/components/FlippingImageDisplay';
// import Information from '../app/sell/information'; // Adjust path if necessary
// import EwasteCategoriesSection from '@/components/EwasteCategoriesSection';
// import VideoPlayerSection, { VideoPlayerRef } from '@/components/VideoPlayerSection';
// import { COLORS } from '@/constants/theme';
// import RecycleGoal from './RecycleGoal';
// import CoverageAndLeadershipCard from '@/app/flipper/ff';
// import TrustAndCompliance from '@/app/flipper/SendEmailScreen';

// interface HomeMainContentProps {
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
//   videoRef: React.RefObject<VideoPlayerRef>;
// }

// export default function HomeMainContent({ searchQuery, setSearchQuery, videoRef }: HomeMainContentProps) {
//   return (
//     <>
//       <EwasteCategoriesSection />
//       <WelcomeText />
//       <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
//       <ImageCarousel />
//       <CategoryGrid />
//       <EwasteBarChart />
//       <FlippingImageDisplay />
//       <VideoPlayerSection ref={videoRef} />
//       <Information />
//       <RecycleGoal />
//       <CoverageAndLeadershipCard />
//       <MarqueeBanner />
//       <TrustAndCompliance />
//       <Text style={styles.dailyPostHeading}>Latest Product Feedback</Text>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   dailyPostHeading: {
//     fontSize: 18,
//     fontWeight: "600",
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     color: COLORS.text,
//   },
// });