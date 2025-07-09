// convex/brandproducts.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getBrandProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brandproducts").collect();
  },
});

export const getBrandProductById = query({
  args: {
    productId: v.id("brandproducts"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    return product;
  },
});

export const getBrandProductsByBrand = query({
  args: {
    brandName: v.string(),
  },
  handler: async (ctx, args) => {
    let products;
    products = await ctx.db
      .query("brandproducts")
      .withIndex("by_brand", (q) => q.eq("brand", args.brandName))
      .collect();
    return products;
  },
});

export const getBrandProductsByCategory = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products;
    if (args.category && args.category !== "All") {
      products = await ctx.db
        .query("brandproducts")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      products = await ctx.db.query("brandproducts").collect();
    }
    return products;
  },
});

export const createBrandProduct = mutation({
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
    brand: v.string(),
    productType: v.literal("brand"),
    galleryImages: v.optional(v.array(v.string())), // Added for consistency
    warranty: v.optional(v.number()), // Added for consistency
  },
  handler: async (ctx, args) => {
    const newBrandProductId = await ctx.db.insert("brandproducts", args);
    console.log(`New brand product created with ID: ${newBrandProductId}`);
    return newBrandProductId;
  },
});

export const updateBrandProduct = mutation({
  args: {
    id: v.id("brandproducts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    discountPrice: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    rating: v.optional(v.number()),
    review: v.optional(v.number()),
    category: v.optional(v.string()),
    delivery: v.optional(v.number()),
    brand: v.optional(v.string()),
    productType: v.optional(v.literal("brand")),
    galleryImages: v.optional(v.array(v.string())),
    warranty: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    if (Object.keys(updates).length === 0) {
      throw new Error("No fields provided for update.");
    }
    await ctx.db.patch(id, updates);
    console.log(`Brand product with ID ${id} updated.`);
    return true;
  },
});
