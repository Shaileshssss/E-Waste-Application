// convex/migrateAddresses.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';

export const migrateExistingUserAddresses = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      const existingAddressDoc = await ctx.db.query("userAddresses")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

      if (!existingAddressDoc) {
        console.log(`Creating address for user: <span class="math-inline">\{user\.username\} \(</span>{user._id})`);
        await ctx.db.insert("userAddresses", {
          userId: user._id,
          // Provide some default/dummy data for homeAddress as it's required
          homeAddress: {
            street: "Default Street",
            city: "Default City",
            state: "Default State", // NEW: Provide a default state
            pincode: 123456,        // Default pincode as a number
          },
          // officeAddress will be optional, so can be omitted or set to null
        });
      }
    }
    console.log("Migration of user addresses complete.");
  },
});