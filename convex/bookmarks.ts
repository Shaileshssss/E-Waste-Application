// convex/bookmarks.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users"; // This function throws if not authenticated
import { Id } from "./_generated/dataModel";

export const toggleBookmark = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx); // Requires authenticated user

        const existing = await ctx.db
            .query("bookmarks")
            .withIndex("by_user_and_post", (q) => q.eq("userId", currentUser._id).eq("postId", args.postId))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            return false;
        } else {
            await ctx.db.insert("bookmarks", { userId: currentUser._id, postId: args.postId });
            return true;
        }
    }
})

export const getBookmarkedPosts = query({
    handler: async (ctx) => {
        let currentUserId: Id<"users"> | null = null;

        try {
            const currentUser = await getAuthenticatedUser(ctx);
            currentUserId = currentUser._id;
        } catch (error) {
            if (!(error instanceof Error && error.message.includes("Unauthorized"))) {
                console.error("getBookmarkedPosts: An unexpected error occurred during authentication check:", error);
            }
            console.log("getBookmarkedPosts: User is not authenticated. Returning empty array.");
            return []; // Return empty array if not authenticated
        }

        const bookmarks = await ctx.db
            .query("bookmarks")
            .withIndex("by_user", (q) => q.eq("userId", currentUserId!)) // currentUserId is guaranteed here
            .order("desc") // Order by creation time if needed, assuming default index
            .collect();

        if (bookmarks.length === 0) return [];

        const bookmarkedPosts = await Promise.all(
            bookmarks.map(async (bookmark) => {
                const post = await ctx.db.get(bookmark.postId);
                if (!post) return null; // Handle case where post might have been deleted

                const postAuthor = (await ctx.db.get(post.userId))!;

                // isLiked logic for posts.likes as number
                let isLiked = false;
                // Only check if current user is authenticated
                const likeEntry = await ctx.db.query("likes")
                    .withIndex("by_user_and_post", (q) => q.eq("userId", currentUserId!).eq("postId", post._id))
                    .first();
                isLiked = !!likeEntry;

                return {
                    ...post,
                    author: {
                        _id: postAuthor?._id,
                        username: postAuthor?.username,
                        image: postAuthor?.image,
                    },
                    isLiked,
                    isBookmarked: true, // It's a bookmarked post
                };
            })
        );
        return bookmarkedPosts.filter(Boolean) as (typeof bookmarkedPosts[number])[];
    }
})