// convex/comments.ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users"; // Ensure this path is correct
import { Id } from "./_generated/dataModel"; // Import Id type

export const addComment = mutation({
  args: {
    content: v.string(),
    postId: v.id("posts"),
  },

  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx); // Requires authenticated user

    const post = await ctx.db.get(args.postId);
    if (!post) throw new ConvexError("Post not found");

    const commentId = await ctx.db.insert("comments", {
      userId: currentUser._id, // Ensure currentUser._id is used here
      postId: args.postId,
      content: args.content,
    });

    await ctx.db.patch(args.postId, { comments: post.comments + 1 });

    if (post.userId !== currentUser._id) {
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "comment",
        postId: args.postId,
        commentId,
        isRead: false, // <--- NEW: Initialize isRead to false
      });
    }

    return commentId;
  },
});

export const getComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        if (!user) {
          // Handle case where user might be deleted, or return a placeholder
          console.warn(`User with ID ${comment.userId} not found for comment ${comment._id}`);
          return {
            ...comment,
            user: {
              fullname: "Deleted User",
              image: "https://placehold.co/100x100/FFF0F0/FF6347?text=No+Img", // Placeholder
            },
          };
        }
        return {
          ...comment,
          user: {
            fullname: user.fullname,
            image: user.image,
          },
        };
      })
    );

    return commentsWithInfo;
  },
});