// convex/deliveryAgents.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getAuthenticatedUser } from "./users"; // Assuming this utility exists

export const addDeliveryAgent = mutation({
  args: {
    name: v.string(),
    photoUrl: v.string(),
    contactNumber: v.string(),
    vehicleType: v.string(),
    vehicleNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real application, you would add admin/permission checks here
    // const user = await getAuthenticatedUser(ctx);
    // if (!user.isAdmin) { throw new Error("Unauthorized"); }

    const agentId = await ctx.db.insert("deliveryAgents", {
      name: args.name,
      photoUrl: args.photoUrl,
      contactNumber: args.contactNumber,
      vehicleType: args.vehicleType,
      vehicleNumber: args.vehicleNumber,
      assignedRequests: [], // Initialize new field as empty array
    });
    console.log(`Convex: Delivery agent ${agentId} (${args.name}) added.`);
    return agentId;
  },
});

export const getDeliveryAgentById = query({
  args: { agentId: v.id("deliveryAgents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    const agent = await ctx.db.get(args.agentId);
    return agent;
  },
});

export const getAllDeliveryAgents = query({
  handler: async (ctx) => {
    // In a real application, you might add admin/permission checks here
    // const user = await getAuthenticatedUser(ctx);
    // if (!user.isAdmin) { throw new Error("Unauthorized"); }
    
    return await ctx.db.query("deliveryAgents").collect();
  },
});

// NEW MUTATIONS/HELPERS for managing agent's assigned requests
// These might be used internally by other Convex functions, e.g., recyclingRequests.ts
export const assignRequestToAgent = mutation({
  args: {
    agentId: v.id("deliveryAgents"),
    requestId: v.id("recyclingRequests"),
    collectionDate: v.number(),
    timeSlot: v.string(),
  },
  handler: async (ctx, args) => {
    // You might add admin/permission checks here if called directly from client
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Delivery agent not found for assignment.");
    }

    // Ensure request isn't already assigned to prevent duplicates
    if (agent.assignedRequests.some(ar => ar.requestId === args.requestId)) {
      console.warn(`Request ${args.requestId} already assigned to agent ${args.agentId}.`);
      return;
    }

    const updatedAssignedRequests = [
      ...agent.assignedRequests,
      {
        requestId: args.requestId,
        collectionDate: args.collectionDate,
        timeSlot: args.timeSlot,
      },
    ];

    await ctx.db.patch(args.agentId, { assignedRequests: updatedAssignedRequests });
    console.log(`Convex: Request ${args.requestId} assigned to agent ${args.agentId}.`);
  },
});

export const unassignRequestFromAgent = mutation({
  args: {
    agentId: v.id("deliveryAgents"),
    requestId: v.id("recyclingRequests"),
  },
  handler: async (ctx, args) => {
    // You might add admin/permission checks here if called directly from client
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      console.warn(`Attempted to unassign from non-existent agent ${args.agentId}.`);
      return;
    }

    const updatedAssignedRequests = agent.assignedRequests.filter(
      (ar) => ar.requestId !== args.requestId
    );

    await ctx.db.patch(args.agentId, { assignedRequests: updatedAssignedRequests });
    console.log(`Convex: Request ${args.requestId} unassigned from agent ${args.agentId}.`);
  },
});