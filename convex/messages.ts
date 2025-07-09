// convex/messages.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query to get the number of unread messages for a user.
 */
export const getUnreadMessageCount = query({
  args: { userId: v.id("users") }, // The user whose unread messages we're counting
  handler: async (ctx, args) => {
    // Count messages where the receiver is the current user and it's not yet read
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiverId_isRead", (q) =>
        q.eq("receiverId", args.userId).eq("isRead", false)
      )
      .collect(); // Get all matching documents

    return unreadMessages.length;
  },
});

// You can add other message-related queries/mutations here, e.g., sendMessage, markMessageAsRead, getConversation, etc.