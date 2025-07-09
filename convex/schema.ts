import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const Address = v.object({
  street: v.string(),
  city: v.string(),
  landmark: v.optional(v.string()),
  pincode: v.number(),
  state: v.string(),
});

export default defineSchema({
  users: defineTable({
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.string(),
    followers: v.number(),
    following: v.number(),
    posts: v.number(),
    clerkId: v.string(),
    isAdmin: v.optional(v.boolean()),
    // homeAddress: v.optional(v.string()),
    // officeAddress: v.optional(v.string()),
    //  productsPurchased: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),

  userAddresses: defineTable({
    userId: v.id("users"),
    homeAddress: Address,
    officeAddress: v.optional(Address),
  }).index("by_userId", ["userId"]),

  posts: defineTable({
    userId: v.id("users"),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
    capiton: v.optional(v.string()),
    likes: v.number(),
    comments: v.number(),
    rating: v.optional(v.number()),
    category: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  likes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_post", ["postId"])
    .index("by_user_and_post", ["userId", "postId"]),

  comments: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    content: v.string(),
  }).index("by_post", ["postId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_both", ["followerId", "followingId"]),

  notifications: defineTable({
    receiverId: v.id("users"),
    senderId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow")),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    isRead: v.boolean(),
  })
    .index("by_receiver", ["receiverId"])
    .index("by_post", ["postId"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_user", ["userId"])
    .index("by_post", ["postId"])
    .index("by_user_and_post", ["userId", "postId"]),

  products: defineTable({
    userId: v.id("users"),
    categoryId: v.string(),
    os: v.array(v.string()),
    brand: v.array(v.string()),
    model: v.string(),
    manufactureDate: v.string(),
    description: v.string(),
    quantity: v.string(),
    images: v.optional(v.array(v.string())),
    recycledByUserId: v.optional(v.string()),
    recycledDate: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("available"),
        v.literal("pending_request"),
        v.literal("recycled"),
        v.literal("sold")
      )
    ),
  })
    .index("bycategory", ["categoryId"])
    .index("by_user", ["userId"])
    .index("by_recycledByUserId", ["recycledByUserId"])
    .index("by_status", ["status"]),

  brandproducts: defineTable({
    imageUrl: v.string(),
    name: v.string(),
    description: v.string(),
    discountPrice: v.number(),
    originalPrice: v.number(),
    rating: v.number(),
    review: v.number(),
    category: v.string(),
    delivery: v.number(),
    brand: v.string(),
    productType: v.literal("brand"),
        galleryImages: v.optional(v.array(v.string())),
        warranty: v.optional(v.number()),
  })
    // Defining REGULAR indexes for direct lookup, matching your queries
    .index("by_brand", ["brand"])
    .index("by_category", ["category"]),

  // The 'RefurbishedProducts' table
  RefurbishedProducts: defineTable({
    name: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    galleryImages: v.optional(v.array(v.string())),
    discountPrice: v.number(),
    originalPrice: v.number(),
    rating: v.number(),
    review: v.number(),
    category: v.string(),
    delivery: v.number(),
    warranty: v.optional(v.number()),
    productType: v.literal("refurbished"),
  })
    // Defining a REGULAR index for category for direct lookup
    .index("by_category", ["category"]),

carts: defineTable({
  userId: v.id("users"),
  items: v.array(
    v.object({
      productId: v.union(v.id("RefurbishedProducts"), v.id("brandproducts")),
      quantity: v.number(),
      productType: v.union(v.literal("brand"), v.literal("refurbished")),
    })
  ),
})
.index("by_userId", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
    orderDate: v.number(),
    totalAmount: v.number(),
    savedAmount: v.number(),
    products: v.array(
      v.object({
        productId: v.union(v.id("RefurbishedProducts"), v.id("brandproducts")),
        name: v.string(),
        image: v.string(),
        discountPrice: v.number(),
        originalPrice: v.number(),
        quantity: v.number(),
      })
    ),
    status: v.string(),
  }).index("by_userId_orderDate", ["userId", "orderDate"]),

  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
    isRead: v.boolean(),
  })
    .index("by_receiverId", ["receiverId"]) // To find messages sent to a user
    .index("by_receiverId_isRead", ["receiverId", "isRead"]),

  aiChatMessages: defineTable({
    userId: v.id("users"),
    sender: v.union(v.literal("user"), v.literal("bot")),
    text: v.string(),
    timestamp: v.number(),
  }).index("by_user_timestamp", ["userId", "timestamp"]),

  recycleVotes: defineTable({
    userId: v.string(),
    votedAt: v.number(),
  }).index("by_userId", ["userId"]),

  recycleGoalStats: defineTable({
    totalVotes: v.number(),
    pledgedPercentage: v.number(),
    lastUpdated: v.number(),
  }),

  recyclingRequests: defineTable({
    userId: v.id("users"),
    productIds: v.array(v.id("products")),
    requestedCollectionDate: v.number(),
    requestedCollectionTimeSlot: v.string(),
    paymentAmount: v.number(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("not_applicable")
    ),
    status: v.union(
      v.literal("pending_approval"),
      v.literal("scheduled"),
      v.literal("collected"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    deliveryAgentId: v.optional(v.id("deliveryAgents")),
    deliveryBoyName: v.optional(v.string()),
    vehicleDetails: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    pickupAddressType: v.optional(
      v.union(v.literal("home"), v.literal("office"))
    ),
    alternativePhoneNumber: v.optional(v.string()),
    pickupNotes: v.optional(v.string()),
  })
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_deliveryAgentId_status", ["deliveryAgentId", "status"]),

  deliveryAgents: defineTable({
    name: v.string(),
    photoUrl: v.string(),
    contactNumber: v.string(),
    vehicleType: v.string(),
    vehicleNumber: v.string(),
    assignedRequests: v.array(
      v.object({
        requestId: v.id("recyclingRequests"),
        collectionDate: v.number(),
        timeSlot: v.string(),
      })
    ),
  }),

  feedback: defineTable({
    userId: v.optional(v.id("users")),
    rating: v.number(),
    feedbackText: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
