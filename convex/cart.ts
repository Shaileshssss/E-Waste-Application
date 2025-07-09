// convex/cart.ts
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server"; 
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel"; 
// --- CORRECTED IMPORT FOR CTX TYPES ---
// import type { QueryCtx, MutationCtx } from "convex/_generated/server"; 

// Define a type for the item objects inside the 'items' array in the 'carts' table
type CartItem = {
  productId: Id<"RefurbishedProducts"> | Id<"brandproducts">;
  quantity: number;
  productType: "brand" | "refurbished";
};

// Helper function to get cart for a user with explicit context typing
// Using QueryCtx | MutationCtx imported from _generated/server
const getCartForUser = async (
  ctx: QueryCtx | MutationCtx, // Using QueryCtx | MutationCtx here
  userId: Id<"users">
) => {
  return await ctx.db
    .query("carts")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId)) 
    .first();
};

export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    productId: v.union(v.id("RefurbishedProducts"), v.id("brandproducts")),
    quantity: v.number(),
    productType: v.union(v.literal("brand"), v.literal("refurbished")),
  },
  handler: async (ctx, args) => {
    const userCart = await getCartForUser(ctx, args.userId);

    if (userCart) {
      const existingItemIndex = userCart.items.findIndex(
        (item: CartItem) => item.productId === args.productId 
      );

      if (existingItemIndex !== -1) {
        const updatedItems = [...userCart.items];
        updatedItems[existingItemIndex].quantity += args.quantity;
        await ctx.db.patch(userCart._id, { items: updatedItems });
      } else {
        const updatedItems = [
          ...userCart.items,
          {
            productId: args.productId,
            quantity: args.quantity,
            productType: args.productType,
          },
        ];
        await ctx.db.patch(userCart._id, { items: updatedItems });
      }
      return userCart._id;
    } else {
      const newCartId = await ctx.db.insert("carts", {
        userId: args.userId,
        items: [
          {
            productId: args.productId,
            quantity: args.quantity,
            productType: args.productType,
          },
        ],
      });
      return newCartId;
    }
  },
});

export const getCartItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userCart = await getCartForUser(ctx, args.userId);

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return [];
    }

    const detailedCartItems = await Promise.all(
      userCart.items.map(async (item: CartItem) => { 
        let productDetails = null;
        if (item.productType === "brand") {
          productDetails = await ctx.db.get(item.productId as Id<"brandproducts">);
        } else if (item.productType === "refurbished") {
          productDetails = await ctx.db.get(item.productId as Id<"RefurbishedProducts">);
        }
        return {
          ...item,
          productDetails: productDetails,
        };
      })
    );

    return detailedCartItems.filter((item: { productDetails: any }) => item.productDetails !== null);
  },
});

export const clearCart = mutation({ 
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userCart = await getCartForUser(ctx, args.userId);

    if (userCart) {
      await ctx.db.patch(userCart._id, { items: [] });
      console.log(`Cart cleared for user: ${args.userId}`);
      return true;
    }
    console.log(`No cart found for user: ${args.userId} to clear.`);
    return false;
  },
});

export const removeCartItem = mutation({
  args: {
    userId: v.id("users"),
    productId: v.union(v.id("RefurbishedProducts"), v.id("brandproducts")),
  },
  handler: async (ctx, args) => {
    const userCart = await getCartForUser(ctx, args.userId);

    if (userCart) {
      const updatedItems = userCart.items.filter(
        (item: CartItem) => item.productId !== args.productId 
      );
      if (updatedItems.length === 0) {
        await ctx.db.delete(userCart._id);
      } else {
        await ctx.db.patch(userCart._id, { items: updatedItems });
      }
      console.log(`Removed item ${args.productId} from cart for user ${args.userId}`);
      return true;
    }
    return false;
  },
});

export const updateCartItemQuantity = mutation({
  args: {
    userId: v.id("users"),
    productId: v.union(v.id("RefurbishedProducts"), v.id("brandproducts")),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userCart = await getCartForUser(ctx, args.userId);

    if (userCart) {
      const updatedItems = userCart.items.map((item: CartItem) => { 
        if (item.productId === args.productId) {
          return { ...item, quantity: args.quantity };
        }
        return item;
      });
      await ctx.db.patch(userCart._id, { items: updatedItems });
      console.log(`Updated quantity for item ${args.productId} to ${args.quantity} for user ${args.userId}`);
      return true;
    }
    return false;
  },
});

export const getCartItemCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userCart = await getCartForUser(ctx, args.userId);

    if (!userCart || !userCart.items) {
      return 0;
    }

    const totalCount = userCart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0); 
    return totalCount;
  },
});

export const removeSelectedItemsFromCart = mutation({
  args: {
    userId: v.id("users"),
    productIdsToRemove: v.array(v.union(v.id("RefurbishedProducts"), v.id("brandproducts"))),
  },
  handler: async (ctx, args) => {
    const existingCart = await getCartForUser(ctx, args.userId);

    if (existingCart) {
      const updatedItems = existingCart.items.filter(
        (item: CartItem) => !args.productIdsToRemove.includes(item.productId) 
      );

      if (updatedItems.length === 0) {
        await ctx.db.delete(existingCart._id);
      } else if (updatedItems.length < existingCart.items.length) {
        await ctx.db.patch(existingCart._id, { items: updatedItems });
      }
      console.log(`Removed selected items from cart for user: ${args.userId}. Remaining items: ${updatedItems.length}`);
    } else {
        console.log(`No cart found for user: ${args.userId} to remove selected items.`);
    }
  },
});