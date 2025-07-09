// convex/RefurbishedProducts.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getRefurbishedProductById = query({
  args: {
    productId: v.id("RefurbishedProducts"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    return product;
  },
});

export const getRefurbishedProductsByCategory = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("RefurbishedProducts")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      return await ctx.db.query("RefurbishedProducts").collect();
    }
  },
});

export const createRefurbishedProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    discountPrice: v.number(),
    originalPrice: v.number(),
    rating: v.number(),
    review: v.number(),
    category: v.string(),
    delivery: v.number(),
    galleryImages: v.array(v.string()),
    productType: v.literal("refurbished"),
  },
  handler: async (ctx, args) => {
    const newRefurbishedProductId = await ctx.db.insert("RefurbishedProducts", args);
    console.log(`New refurbished product created with ID: ${newRefurbishedProductId}`);
    return newRefurbishedProductId;
  },
});

export const updateRefurbishedProduct = mutation({
  args: {
    id: v.id("RefurbishedProducts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    discountPrice: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    rating: v.optional(v.number()),
    review: v.optional(v.number()),
    category: v.optional(v.string()),
    delivery: v.optional(v.number()),
    galleryImages: v.optional(v.array(v.string())),
    productType: v.optional(v.literal("refurbished")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    if (Object.keys(updates).length === 0) {
      throw new Error("No fields provided for update.");
    }
    await ctx.db.patch(id, updates);
    console.log(`Refurbished product with ID ${id} updated.`);
    return true;
  },
});
