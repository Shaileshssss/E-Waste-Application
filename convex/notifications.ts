// convex/notifications.ts
import { query, mutation } from "./_generated/server"; // Import mutation
import { getAuthenticatedUser } from "./users";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel"; // <--- NEW: Import Id

export const getNotifications = query({
    handler: async (ctx) => {
        let currentUserId: Id<"users"> | null = null; // Use Id type

        try {
            const currentUser = await getAuthenticatedUser(ctx);
            currentUserId = currentUser._id;
        } catch (error) {
            if (!(error instanceof Error && error.message.includes("Unauthorized"))) {
                console.error("getNotifications: An unexpected error occurred during authentication check:", error);
            }
            console.log("getNotifications: User is not authenticated. Returning empty array.");
            return []; // Return empty array if not authenticated
        }

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_receiver", (q) => q.eq("receiverId", currentUserId!)) // currentUserId is guaranteed here
            .order("desc") // Order by creation time if needed, assuming default index
            .collect();

        const enrichedNotifications = await Promise.all(
            notifications.map(async (notification) => {
                const sender = (await ctx.db.get(notification.senderId))!;
                let post = null;
                if (notification.postId) {
                    post = await ctx.db.get(notification.postId)
                }
                let comment = null;
                if (notification.type === "comment" && notification.commentId) {
                    comment = await ctx.db.get(notification.commentId)
                }

                return {
                    ...notification,
                    sender: {
                        _id: sender._id,
                        username: sender.username,
                        image: sender.image,
                    },
                    post,
                    comment: comment?.content,
                };
            })
        )
        return enrichedNotifications;
    }
})

export const markNotificationAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx); // Requires authenticated user
        const notification = await ctx.db.get(args.notificationId);

        if (!notification) throw new Error("Notification not found");
        // Use isRead here to match your schema
        if (notification.receiverId !== currentUser._id) throw new Error("Not authorized to mark this notification as read");

        // Use isRead for patching
        await ctx.db.patch(args.notificationId, { isRead: true }); // <--- CHANGE: `read` to `isRead`
        return true;
    }
})