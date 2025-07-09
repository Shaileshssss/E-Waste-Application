// convex/orders.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api"; 

export const createOrder = mutation({
  args: {
    userId: v.id("users"),
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
    totalAmount: v.number(),
    savedAmount: v.number(),
    orderDate: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      orderDate: args.orderDate,
      totalAmount: args.totalAmount,
      savedAmount: args.savedAmount,
      products: args.products,
      status: args.status,
    });

    const productIdsToRemove = args.products.map((p) => p.productId);
    await ctx.runMutation(api.cart.removeSelectedItemsFromCart, {
      userId: args.userId,
      productIdsToRemove: productIdsToRemove,
    });

    return orderId;
  },
});

export const getLastOrder = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const lastOrder = await ctx.db
      .query("orders")
      .withIndex("by_userId_orderDate", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    return lastOrder;
  },
});

export const getAllOrders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_userId_orderDate", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return allOrders;
  },
});

export const getTotalProductsPurchasedForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.warn("getTotalProductsPurchasedForUser: User not authenticated.");
      return 0;
    }

    const completedOrders = await ctx.db
      .query("orders")
      .withIndex("by_userId_orderDate", (q: any) =>
        q.eq("userId", args.userId)
      )
      .filter((q: any) => q.eq(q.field("status"), "completed"))
      .collect();

    let totalProductsCount = 0;
    for (const order of completedOrders) {
      for (const productInOrder of order.products) {
        totalProductsCount += productInOrder.quantity;
      }
    }
    return totalProductsCount;
  },
});

export const getLastOrderItemCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const lastOrder = await ctx.db
      .query("orders")
      .withIndex("by_userId_orderDate", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .filter((q: any) => q.eq(q.field("status"), "completed"))
      .first();

    if (!lastOrder) {
      return 0;
    }

    const totalItemCount = lastOrder.products.reduce((sum: number, product: any) => sum + product.quantity, 0); 
    return totalItemCount;
  },
});
