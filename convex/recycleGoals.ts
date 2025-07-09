// convex/recycleGoals.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel"; // Import Id for type safety

/**
 * Query to get the global recycling goal statistics.
 * Returns the single stats document or null if it doesn't exist.
 * This is a read-only operation.
 */
export const getRecycleGoalStats = query({
  handler: async (ctx) => {
    const stats = await ctx.db.query("recycleGoalStats").unique();
    return stats;
  },
});

/**
 * Query to check if a specific user has already voted.
 * Returns the vote document if found, otherwise null.
 */
export const getUserVote = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("recycleVotes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Mutation to record a user's vote for the recycling goal.
 * Prevents duplicate votes from the same user and updates global stats.
 * If the recycleGoalStats document doesn't exist, it will be created on the first vote.
 */
export const recordVote = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Check if the user has already voted
    const existingVote = await ctx.db
      .query("recycleVotes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingVote) {
      console.log(`User ${args.userId} has already voted.`);
      return { success: false, message: "User already voted." };
    }

    // 2. Record the new vote in the recycleVotes collection
    await ctx.db.insert("recycleVotes", {
      userId: args.userId,
      votedAt: Date.now(),
    });

    // 3. Update or create the global recycleGoalStats document
    // Explicitly type `stats` to help TypeScript with inference.
    let stats: {
        _id: Id<"recycleGoalStats">;
        _creationTime: number;
        totalVotes: number;
        pledgedPercentage: number; // This will be managed on frontend
        lastUpdated: number;
    } | null = await ctx.db.query("recycleGoalStats").unique();

    if (!stats) {
      // If no stats document exists, create an initial one (for the very first vote)
      const newStatsId = await ctx.db.insert("recycleGoalStats", {
        totalVotes: 1, // First vote
        pledgedPercentage: 0, // Placeholder, frontend will calculate based on total votes / target
        lastUpdated: Date.now(),
      });
      // Optionally re-fetch the newly created document if you need its _id or other fields immediately
      // stats = await ctx.db.get(newStatsId); // Not strictly needed here as we only patch by ID
      console.log("Recycle goal stats document created on first vote.");
    } else {
      // If stats document exists, patch it to increment totalVotes
      await ctx.db.patch(stats._id, {
        totalVotes: stats.totalVotes + 1,
        lastUpdated: Date.now(),
      });
      console.log(`User ${args.userId} vote recorded. Total votes updated to: ${stats.totalVotes + 1}`);
    }

    return { success: true, message: "Vote recorded successfully!" };
  },
});