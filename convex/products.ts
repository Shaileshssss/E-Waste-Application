// convex/products.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel"; // Ensure Id is imported
import { getAuthenticatedUser } from "./users"; // Assuming this helper is in users.ts

/**
 * Mutation to insert a new product.
 * CORRECTED: Ensure 'os' always defaults to an empty array if not provided.
 */
export const insertProduct = mutation({
  args: {
    categoryId: v.string(),
    os: v.array(v.string()), // This still describes what it accepts as input
    brand: v.array(v.string()),
    model: v.string(),
    manufactureDate: v.string(),
    description: v.string(),
    quantity: v.string(),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx); // Use helper for user authentication

    const newProductId = await ctx.db.insert('products', {
      userId: user._id,
      categoryId: args.categoryId,
      os: args.os || [], // CORRECTED: Explicitly default to empty array if args.os is falsy
      brand: args.brand,
      model: args.model,
      manufactureDate: args.manufactureDate,
      description: args.description,
      quantity: args.quantity,
      images: args.images ?? [],
      recycledByUserId: undefined,
      recycledDate: undefined,
      status: "available",
    });

    console.log('Convex: Product inserted with ID:', newProductId, 'Category:', args.categoryId);
    return newProductId;
  },
});

/**
 * Query to get all products listed by the current authenticated user.
 */
export const getProductsByUser = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .collect();
  },
});

/**
 * Query to get products by the current authenticated user that are marked as 'available'.
 */
export const getAvailableProductsForUser = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const availableProducts = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();

    return availableProducts;
  },
});

/**
 * Mutation to update a product's status or other fields.
 */
export const updateProductStatus = mutation({
  args: {
    productId: v.id("products"),
    newStatus: v.union(
      v.literal("available"),
      v.literal("pending_request"),
      v.literal("recycled"),
      v.literal("sold")
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found.");
    }

    if (product.userId !== currentUser._id) {
      throw new Error("Unauthorized to update this product.");
    }

    await ctx.db.patch(args.productId, { status: args.newStatus });
    return { success: true, message: `Product ${args.productId} status updated to ${args.newStatus}` };
  },
});