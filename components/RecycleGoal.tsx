import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator, // For loading state
} from 'react-native';
import * as Progress from 'react-native-progress';
import LottieView from 'lottie-react-native';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@clerk/clerk-expo'; // Import useAuth for userId
import { useMutation, useQuery } from 'convex/react'; // Import Convex hooks
import { api } from '@/convex/_generated/api'; // Import your Convex API functions

const RecycleGoal = () => {
  // Get the current user's ID from Clerk for authentication context
  const { userId, isLoaded: authLoaded } = useAuth();
  
  // Fetch global recycling goal statistics from Convex
  const recycleGoalStats = useQuery(api.recycleGoals.getRecycleGoalStats, {});
  
  // Check if the current user has already voted
  // The query will skip if userId is not yet available
  const userVote = useQuery(api.recycleGoals.getUserVote, userId ? { userId } : 'skip');

  // Initialize the Convex mutation for recording a vote
  const recordVoteMutation = useMutation(api.recycleGoals.recordVote);

  const [showLottie, setShowLottie] = useState(false);
  const [isVoting, setIsVoting] = useState(false); // State to prevent multiple rapid clicks

  // Derive UI display states from the fetched Convex data
  // `hasVoted` is true if `userVote` is loaded and is not null
  const hasVoted = userVote !== undefined && userVote !== null;
  // Get total votes from stats, default to 0 if still loading or not present
  const currentTotalVotes = recycleGoalStats?.totalVotes || 0;
  
  // Define a target for 100% completion. Adjust this number as per your goal.
  const TOTAL_TARGET_VOTES = 5; 
  // Calculate the pledged percentage based on current votes and target, ensuring it doesn't exceed 1.0
  const currentPledgedPercent = Math.min(currentTotalVotes / TOTAL_TARGET_VOTES, 1);

  /**
   * Handles the user's action to vote for the recycling goal.
   * Prevents voting if not authenticated, already voted, or already in progress.
   */
  const handleVote = async () => {
    // Ensure authentication is loaded, userId is present, user hasn't voted, and not already voting
    if (!authLoaded || !userId || hasVoted || isVoting) {
      console.log('Cannot vote: Authentication pending, user not logged in, already voted, or vote in progress.');
      return;
    }

    setIsVoting(true); // Set voting state to true to disable button and show loading
    try {
      // Call the Convex mutation to record the vote for the current user
      await recordVoteMutation({ userId });
      
      // If the mutation is successful, trigger the confetti Lottie animation
      setShowLottie(true);
      // Hide the Lottie animation after a short delay
      setTimeout(() => setShowLottie(false), 3000); 
      console.log('Vote recorded successfully in Convex!');
    } catch (error) {
      console.error('Error recording vote:', error);
      // Optionally, show an alert or a user-friendly message here if the vote fails
    } finally {
      setIsVoting(false); // Reset voting state, re-enabling the button (unless `hasVoted` is true)
    }
  };

  // Show a loading indicator while essential data (auth, stats, user vote) is being fetched
  if (!authLoaded || recycleGoalStats === undefined || userVote === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading recycling goal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Our Recycling Goal</Text>

      {/* Circular progress bar to visualize the pledged percentage */}
      <Progress.Circle
        size={120} // Size of the circle
        progress={currentPledgedPercent} // Current progress from 0.0 to 1.0
        showsText={true} // Display text inside the circle
        formatText={() => `${Math.round(currentPledgedPercent * 100)}%`} // Format text to percentage
        color={COLORS.primary} // Color of the filled progress
        borderWidth={2} // Border thickness
        thickness={10} // Thickness of the progress bar itself
        unfilledColor="#e0e0e0" // Color of the unfilled part
      />

      {/* Descriptive text for the pledged percentage */}
      <Text style={styles.subtext}>
        {Math.round(currentPledgedPercent * 100)}% of our users pledged to recycle their electronics!
      </Text>

      {/* Display the total number of supporters/votes */}
      <Text style={styles.voteCount}>Supporters joined: {currentTotalVotes}</Text>

      {/* Conditionally render the "Thank You" message or the "Vote" button */}
      {hasVoted ? (
        <Text style={styles.thankYou}>Thank you for joining us! ♻️</Text>
      ) : (
        <TouchableOpacity 
          style={[styles.voteButton, (isVoting || !authLoaded || !userId) && styles.voteButtonDisabled]} 
          onPress={handleVote}
          // Disable the button if:
          // - a vote is currently in progress (`isVoting`)
          // - user authentication is not loaded yet (`!authLoaded`)
          // - userId is not available (user not logged in) (`!userId`)
          // - user has already voted (`hasVoted`)
          disabled={isVoting || !authLoaded || !userId || hasVoted} 
        >
          {/* Show ActivityIndicator if voting, otherwise show button text */}
          {isVoting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.voteText}>Join your hands with us for recycling</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Lottie animation for confetti, conditionally rendered on vote success */}
      {showLottie && (
        <LottieView
          source={require('@/assets/lottie/confetti.json')}
          autoPlay
          loop={false} // Play once
          style={styles.lottie}
        />
      )}
    </View>
  );
};

export default RecycleGoal;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // marginVertical: 20,
    backgroundColor: COLORS.white,
    padding: 8,
    // width: 370,
    borderRadius: 15,
    // marginHorizontal: -5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    margin: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    height: 200, // Fixed height for loading state to prevent layout shift
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text,
  },
  subtext: {
    marginTop: 15,
    textAlign: 'center',
    color: COLORS.darkGray,
    width: '90%',
    fontSize: 15,
  },
  voteCount: {
    marginTop: 15,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  voteButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 20,
    flexDirection: 'row', // For ActivityIndicator placement
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  voteButtonDisabled: {
    backgroundColor: COLORS.darkGray, // Dimmed color when disabled
    shadowColor: 'transparent', // No shadow when disabled
    elevation: 0, // No elevation when disabled
  },
  voteText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  thankYou: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.green,
    fontWeight: '600',
    textAlign: 'center',
  },
  lottie: {
    width: 180, // Size of the confetti animation
    height: 180,
    position: 'absolute', // Position over other content
    top: '30%', // Center vertically
    left: '30%', // Center horizontally
    transform: [{ translateX: -100 }, { translateY: -100 }], // Adjust for half of width/height
    zIndex: 1000, // Ensure it appears above other elements
    pointerEvents: 'none', // Allow touches to pass through to underlying elements
  },
});