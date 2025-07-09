// convex/post.ts
import { v } from "convex/values"
import { mutation, MutationCtx, query } from "./_generated/server"
import { getAuthenticatedUser } from "./users";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
    args: {
        caption: v.optional(v.string()),
        storageId: v.id("_storage"),
        rating: v.optional(v.number()),
        category: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);
        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (!imageUrl) throw new Error("Image not found");

        const postId = await ctx.db.insert("posts", {
            userId: currentUser._id,
            imageUrl,
            storageId: args.storageId,
            capiton: args.caption,
            likes: 0,
            comments: 0,
            rating: args.rating,
            category: args.category,
        });

        await ctx.db.patch(currentUser._id, {
            posts: currentUser.posts + 1,
        })
        return postId;
    }
})

export const getFeedPosts = query({
    handler: async (ctx) => {
        let currentUserId: Id<"users"> | null = null;

        try {
            const currentUser = await getAuthenticatedUser(ctx);
            currentUserId = currentUser._id;
        } catch (error) {
            if (!(error instanceof Error && error.message.includes("Unauthorized"))) {
                console.error("getFeedPosts: An unexpected error occurred during authentication check:", error);
            }
            console.log("getFeedPosts: User is not authenticated. Providing public feed.");
        }

        const posts = await ctx.db.query("posts").order("desc").collect();
        if (posts.length === 0) return [];

        const postsWithInfo = await Promise.all(
            posts.map(async (post) => {
                const postAuthor = (await ctx.db.get(post.userId))!;

                let isLiked = false;
                if (currentUserId) {
                    const likeEntry = await ctx.db.query("likes")
                        .withIndex("by_user_and_post", (q) => q.eq("userId", currentUserId!).eq("postId", post._id))
                        .first();
                    isLiked = !!likeEntry;
                }

                let isBookmarked = false;
                if (currentUserId) {
                    const bookmark = await ctx.db.query("bookmarks")
                        .withIndex("by_user_and_post", (q) => q.eq("userId", currentUserId!).eq("postId", post._id))
                        .first();
                    isBookmarked = !!bookmark;
                }

                return {
                    ...post,
                    author: {
                        _id: postAuthor?._id,
                        username: postAuthor?.username,
                        image: postAuthor?.image,
                    },
                    isLiked,
                    isBookmarked,
                };
            })
        )
        return postsWithInfo;
    },
});

export const toggleLike = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const existingLikeEntry = await ctx.db.query("likes")
            .withIndex("by_user_and_post", (q) => q.eq("userId", currentUser._id).eq("postId", args.postId))
            .first();

        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        if (existingLikeEntry) {
            await ctx.db.delete(existingLikeEntry._id);
            await ctx.db.patch(args.postId, { likes: post.likes - 1 });
            return false;
        } else {
            await ctx.db.insert("likes", {
                userId: currentUser._id,
                postId: args.postId,
            });
            await ctx.db.patch(args.postId, { likes: post.likes + 1 });

            if (currentUser._id !== post.userId) {
                await ctx.db.insert("notifications", {
                    receiverId: post.userId,
                    senderId: currentUser._id,
                    type: "like",
                    postId: args.postId,
                    isRead: false, // <--- NEW: Initialize isRead to false
                })
            }
            return true;
        }
    }
})

export const deletePost = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");
        if (post.userId !== currentUser._id) throw new Error("Not authorized to delete this post");

        const likes = await ctx.db.query("likes").withIndex("by_post", (q) => q.eq("postId", args.postId)).collect();
        for (const like of likes) { await ctx.db.delete(like._id); }
        const comments = await ctx.db.query("comments").withIndex("by_post", (q) => q.eq("postId", args.postId)).collect();
        for (const comment of comments) { await ctx.db.delete(comment._id); }
        const bookmarks = await ctx.db.query("bookmarks").withIndex("by_post", (q) => q.eq("postId", args.postId)).collect();
        for (const bookmark of bookmarks) { await ctx.db.delete(bookmark._id); }
        const notifications = await ctx.db.query("notifications").withIndex("by_post", (q) => q.eq("postId", args.postId)).collect();
        for (const notification of notifications) { await ctx.db.delete(notification._id) }

        await ctx.storage.delete(post.storageId);
        await ctx.db.delete(args.postId);
        await ctx.db.patch(currentUser._id, {
            posts: Math.max(0, (currentUser.posts || 0) - 1),
        })
    },
});

export const getPostsByUser = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        let targetUser = null;

        if (args.userId) {
            targetUser = await ctx.db.get(args.userId);
            if (!targetUser) {
                console.warn(`getPostsByUser: User with ID ${args.userId} not found.`);
                return [];
            }
        } else {
            try {
                targetUser = await getAuthenticatedUser(ctx);
            } catch (error) {
                if (!(error instanceof Error && error.message.includes("Unauthorized"))) {
                    console.error("getPostsByUser: An unexpected error occurred during authentication check for current user:", error);
                }
                console.log("getPostsByUser: No specific userId provided and user is not authenticated. Returning empty array.");
                return [];
            }
        }

        const posts = await ctx.db.query("posts")
            .withIndex("by_user", (q) => q.eq("userId", targetUser!._id))
            .collect();

        return posts;
    }
})