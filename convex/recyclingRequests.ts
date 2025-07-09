// convex/recyclingRequests.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel"; // Ensure Doc is imported
import { getAuthenticatedUser } from "./users"; // Assuming this utility exists

export const createRecyclingRequest = mutation({
  args: {
    userId: v.id("users"),
    productIds: v.array(v.id("products")),
    requestedCollectionDate: v.number(), // This is a timestamp
    requestedCollectionTimeSlot: v.string(), // "morning", "afternoon", "evening"
    paymentAmount: v.number(),
    // NEW ARGS FOR PICKUP DETAILS
    pickupAddressType: v.optional(v.union(v.literal("home"), v.literal("office"))),
    alternativePhoneNumber: v.optional(v.string()),
    pickupNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (user._id !== args.userId) {
        throw new Error("Unauthorized: Cannot create request for another user.");
    }

    // Mark products as pending_request
    for (const productId of args.productIds) {
      const product = await ctx.db.get(productId);
      if (!product || product.userId !== user._id || product.status !== "available") {
        throw new Error(`Product ${productId} is not available or does not belong to this user.`);
      }
      await ctx.db.patch(productId, { status: "pending_request" });
    }

    // --- Start: Intelligent Delivery Agent Assignment Logic ---
    const allAgents = await ctx.db.query("deliveryAgents").collect();
    let selectedAgent = null;

    if (allAgents.length === 0) {
      // Fallback: If no agents exist, create a default one (admin task in real app)
      const defaultAgentId = await ctx.db.insert("deliveryAgents", {
        name: "Eco-Agent Default",
        photoUrl: "https://placehold.co/100x100/ADD8E6/000000?text=Default",
        contactNumber: "+91 9999999999",
        vehicleType: "Bike",
        vehicleNumber: "DL00AA0000",
        assignedRequests: [], // Initialize
      });
      selectedAgent = await ctx.db.get(defaultAgentId);
      console.log('Convex: No agents found, created a default one.');
    } else {
      // 1. Try to find an agent free for the EXACT requested date and time slot
      // NOTE: 'assignedRequests' on agent needs to be of type `v.array(v.object({ requestId: v.id("recyclingRequests"), collectionDate: v.number(), timeSlot: v.string() }))` in your schema.
      for (const agent of allAgents) {
        // Ensure assignedRequests is an array to prevent errors if it's undefined/null
        const isFree = !agent.assignedRequests?.some(
          (assignedReq: any) =>
            assignedReq.collectionDate === args.requestedCollectionDate &&
            assignedReq.timeSlot === args.requestedCollectionTimeSlot
        );
        if (isFree) {
          selectedAgent = agent;
          console.log(`Convex: Found free agent ${agent.name} for the requested slot.`);
          break; // Found a free agent, exit loop
        }
      }

      // 2. Fallback: If all agents are busy for the specific slot,
      // pick the one with the fewest currently assigned requests.
      if (!selectedAgent) {
        selectedAgent = allAgents.reduce((leastBusy, current) =>
          // Ensure assignedRequests is an array before accessing length
          (current.assignedRequests?.length || 0) < (leastBusy.assignedRequests?.length || 0) ? current : leastBusy
        );
        console.warn(`Convex: All agents busy for requested slot (${new Date(args.requestedCollectionDate).toLocaleDateString()} ${args.requestedCollectionTimeSlot}), assigned to least busy: ${selectedAgent.name}.`);
      }
    }

    if (!selectedAgent) {
      // This case should ideally not be reached if default agent is created or agents exist
      throw new Error("Failed to assign a delivery agent, no available agents found.");
    }
    // --- End: Intelligent Delivery Agent Assignment Logic ---

    // Create the recycling request
    const requestId = await ctx.db.insert("recyclingRequests", {
      userId: args.userId,
      productIds: args.productIds,
      requestedCollectionDate: args.requestedCollectionDate,
      requestedCollectionTimeSlot: args.requestedCollectionTimeSlot,
      paymentAmount: args.paymentAmount,
      paymentStatus: "pending",
      status: "scheduled", // Mark as scheduled since an agent is assigned
      deliveryAgentId: selectedAgent._id,
      deliveryBoyName: selectedAgent.name,
      vehicleDetails: `${selectedAgent.vehicleType} (${selectedAgent.vehicleNumber})`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // ADD NEW FIELDS HERE
      pickupAddressType: args.pickupAddressType,
      alternativePhoneNumber: args.alternativePhoneNumber,
      pickupNotes: args.pickupNotes,
    });

    // CRITICAL: Update the selected agent's profile to include this new request
    await ctx.db.patch(selectedAgent._id, {
      assignedRequests: [
        ...(selectedAgent.assignedRequests || []), // Ensure it's an array for spreading
        {
          requestId: requestId,
          collectionDate: args.requestedCollectionDate,
          timeSlot: args.requestedCollectionTimeSlot,
        }
      ]
    });

    console.log(`Convex: Recycling request ${requestId} created and scheduled by user ${args.userId} with agent ${selectedAgent.name}`);
    return requestId;
  },
});

export const scheduleRecyclingRequest = mutation({
  args: {
    requestId: v.id("recyclingRequests"),
    deliveryAgentId: v.id("deliveryAgents"),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Recycling request not found.");
    }
    
    const deliveryAgent = await ctx.db.get(args.deliveryAgentId);
    if (!deliveryAgent) {
        throw new Error("Delivery agent not found.");
    }
    
    await ctx.db.patch(args.requestId, {
      status: "scheduled",
      deliveryAgentId: args.deliveryAgentId,
      deliveryBoyName: deliveryAgent.name,
      vehicleDetails: `${deliveryAgent.vehicleType} (${deliveryAgent.vehicleNumber})`,
      updatedAt: Date.now(),
    });

    console.log(`Convex: Recycling request ${args.requestId} explicitly scheduled with Delivery Agent: ${deliveryAgent.name}`);
    return { success: true, message: "Recycling request scheduled successfully." };
  },
});

export const markRequestAsCompleted = mutation({
  args: {
    requestId: v.id("recyclingRequests"),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("not_applicable")),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Recycling request not found.");
    }

    // Update request status and payment status
    await ctx.db.patch(args.requestId, {
      status: "completed",
      paymentStatus: args.paymentStatus,
      updatedAt: Date.now(),
    });

    // Mark associated products as recycled
    for (const productId of request.productIds) {
      await ctx.db.patch(productId, {
        recycledByUserId: request.userId,
        recycledDate: Date.now(),
        status: "recycled",
      });
    }

    // CRITICAL: Unassign the request from the agent's schedule
    if (request.deliveryAgentId) {
        const agent = await ctx.db.get(request.deliveryAgentId);
        if (agent) {
            const updatedAssignedRequests = (agent.assignedRequests || []).filter( // Ensure it's an array
                (ar: any) => ar.requestId !== args.requestId
            );
            await ctx.db.patch(agent._id, { assignedRequests: updatedAssignedRequests });
            console.log(`Convex: Request ${args.requestId} unassigned from agent ${agent.name}.`);
        } else {
            console.warn(`Convex: Agent ${request.deliveryAgentId} not found while trying to unassign request ${args.requestId}.`);
        }
    }

    console.log(`Convex: Recycling request ${args.requestId} marked as completed.`);
    return { success: true, message: "Recycling request completed and products marked as recycled." };
  },
});


export const getDetailedRecyclingRequestsForUser = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const requests = await ctx.db
      .query("recyclingRequests")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const productDetails = await Promise.all(
          request.productIds.map(async (productId) => {
            const product = await ctx.db.get(productId);
            return product ? { _id: product._id, model: product.model, images: product.images, status: product.status } : null;
          })
        );
        const filteredProductDetails = productDetails.filter(Boolean);
        
        let agentDetails = null;
        if (request.deliveryAgentId) {
            agentDetails = await ctx.db.get(request.deliveryAgentId);
        }

        return {
          ...request,
          products: filteredProductDetails,
          deliveryAgent: agentDetails,
        };
      })
    );

    return requestsWithDetails;
  },
});

export const getRecyclingRequestById = query({
  args: { requestId: v.id("recyclingRequests") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      return null;
    }

    if (request.userId !== user._id) {
      throw new Error("Unauthorized to view this request.");
    }

    const productDetails = await Promise.all(
      request.productIds.map(async (productId) => {
        const product = await ctx.db.get(productId);
        return product ? { _id: product._id, model: product.model, images: product.images, status: product.status } : null;
      })
    );
    const filteredProductDetails = productDetails.filter(Boolean);

    let agentDetails = null;
    if (request.deliveryAgentId) {
        agentDetails = await ctx.db.get(request.deliveryAgentId);
    }

    // Fetch the user who made the request (core details)
    const requestingUser = await ctx.db.get(request.userId);
    if (!requestingUser) {
        throw new Error("Requesting user not found for this request.");
    }

    // Fetch the user's address document from the new 'userAddresses' table
    const requestingUserAddress = await ctx.db.query("userAddresses")
        .withIndex("by_userId", (q) => q.eq("userId", requestingUser._id))
        .first();

    // Return all compiled details, attaching userAddress explicitly
    return {
      ...request,
      products: filteredProductDetails,
      deliveryAgent: agentDetails,
      requestingUser: { // Only include necessary fields for pickup info
        _id: requestingUser._id,
        username: requestingUser.username,
        image: requestingUser.image,
        phoneNumber: requestingUser.phoneNumber,
        // Attach the user's address document
        userAddress: requestingUserAddress || null, 
      },
    };
  },
});

export const getCompletedRecyclingItemsCountForUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (user.clerkId !== args.clerkId) {
      return 0;
    }

    const completedRequests = await ctx.db
      .query("recyclingRequests")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", user._id)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    let totalRecycledItems = 0;
    for (const request of completedRequests) {
        totalRecycledItems += request.productIds.length;
    }

    return totalRecycledItems;
  },
});