// // convex/aiMessages.ts
// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";
// import { api } from "./_generated/api"; // To call other Convex queries, specifically api.users.getAuthenticatedUser
// import { Doc } from './_generated/dataModel'; // Import Doc for type safety

// // Mutation to add a new chat message (either user or bot) to the database
// export const addAiChatMessage = mutation({
//   args: {
//     sender: v.union(v.literal("user"), v.literal("bot")),
//     text: v.string(),
//   },
//   handler: async (ctx, args) => {
//     console.log(`Convex Mutation: addAiChatMessage called for sender: ${args.sender}`);
//     // This call requires api.users.getAuthenticatedUser to be a Convex query
//     const currentUser: Doc<'users'> = await ctx.runQuery(api.users.getAuthenticatedUser);
//     console.log(`Convex Mutation: addAiChatMessage - Current user ID: ${currentUser._id}`);

//     const newMsgId = await ctx.db.insert("aiChatMessages", {
//       userId: currentUser._id, // Link to the user
//       sender: args.sender,
//       text: args.text,
//       timestamp: Date.now(), // Store current timestamp as a number
//     });
//     console.log(`Convex Mutation: addAiChatMessage - Message added with ID: ${newMsgId}`);
//   },
// });

// // Query to retrieve the chat history for the authenticated user
// export const getAiChatHistory = query({
//   handler: async (ctx) => {
//     console.log("Convex Query: getAiChatHistory called.");
//     // This call requires api.users.getAuthenticatedUser to be a Convex query
//     const currentUser: Doc<'users'> = await ctx.runQuery(api.users.getAuthenticatedUser);
//     console.log(`Convex Query: getAiChatHistory - Current user ID: ${currentUser._id}`);

//     const messages = await ctx.db
//       .query("aiChatMessages")
//       .withIndex("by_user_timestamp", (q) => q.eq("userId", currentUser._id))
//       .order("asc") // Order from oldest to newest
//       .collect();
//     console.log(`Convex Query: getAiChatHistory - Found ${messages.length} messages.`);
//     return messages; // Return messages with numeric timestamp. Client will format.
//   },
// });