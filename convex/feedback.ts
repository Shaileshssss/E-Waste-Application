import { v } from "convex/values";
import { mutation } from "./_generated/server";


export const submitFeedback = mutation({
    args: {
        userId: v.optional(v.id("users")),
        rating: v.number(),
        feedbackText: v.string(),
    },
    handler: async (ctx , args) => {
        const newFeedback ={
            userId: args.userId,
            rating: args.rating,
            feedbackText: args.feedbackText,
            timestamp: Date.now(),
        };

        await ctx.db.insert("feedback", newFeedback);

        console.log("convex: Feedback submitted successfully:", newFeedback);
        return true;
    },
});