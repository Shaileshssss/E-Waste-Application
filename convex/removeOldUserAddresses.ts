// convex/removeOldUserAddresses.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel"; // Import Doc type

/**
 * One-time migration mutation to remove 'homeAddress' and 'officeAddress'
 * fields from all documents in the 'users' table.
 *
 * This is necessary if these fields were previously part of the 'users' schema
 * but have since been removed or moved to a different table (e.g., 'userAddresses').
 *
 * It iterates through all user documents and uses `v.null()` to explicitly delete
 * the specified fields.
 */
export const removeOldAddressFieldsFromUsers = mutation({
  args: {}, // This mutation doesn't require any arguments
  handler: async (ctx) => {
    console.log("Starting migration: Removing old 'homeAddress' and 'officeAddress' fields from 'users' table...");

    // Fetch all documents from the 'users' table
    const users = await ctx.db.query("users").collect();
    let cleanedCount = 0;

    for (const user of users) {
      const updates: { [key: string]: any } = {};
      let needsPatch = false;

      // Check if 'homeAddress' exists on the current user document
      // We use `user as any` to temporarily bypass TypeScript's strict type checking,
      // as the schema already indicates these fields shouldn't exist, but they might in old data.
      if ((user as any).homeAddress !== undefined) {
        updates.homeAddress = v.null(); // Set the field to null to effectively delete it
        needsPatch = true;
      }

      // Check if 'officeAddress' exists on the current user document
      if ((user as any).officeAddress !== undefined) {
        updates.officeAddress = v.null(); // Set the field to null to effectively delete it
        needsPatch = true;
      }

      if (needsPatch) {
        // Apply the patch to the document to remove the specified fields
        await ctx.db.patch(user._id, updates);
        cleanedCount++;
        console.log(`Removed old address fields for user ID: ${user._id}`);
      }
    }

    console.log(`Migration complete: Successfully removed fields from ${cleanedCount} user documents.`);
    return { success: true, cleanedCount };
  },
});