// convex/gemini.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api"; // To call other Convex queries/mutations if needed

/**
 * An action to call the Google Gemini API securely from the Convex backend.
 * The API key is stored as a Convex environment variable.
 */
export const chatWithGemini = action({
  args: {
    chatHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("model")),
      parts: v.array(v.object({
        text: v.string(),
      })),
    })),
    prompt: v.string(), // The latest user prompt
  },
  handler: async (ctx, args) => {
    // Access the GEMINI_API_KEY from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY environment variable is not set in Convex!");
      // Return an error to the client if the key is missing on the server
      return { success: false, error: "Server configuration error: Gemini API key missing." };
    }

    // Append the current prompt to the chat history for the Gemini API call
    const fullChatHistory = [
      ...args.chatHistory,
      { role: "user", parts: [{ text: args.prompt }] }
    ];

    const payload = { contents: fullChatHistory };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    try {
      console.log('Convex Action: Sending prompt to Gemini API...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      // Process the response from the Gemini API
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        // Return the successful response to the client
        return { success: true, response: result.candidates[0].content.parts[0].text };
      } else if (result.error) {
        console.error('Convex Action: Gemini API Error:', result.error);
        // Return the error message from Gemini to the client
        return { success: false, error: result.error.message || "Unknown Gemini API error." };
      } else {
        console.error('Convex Action: Gemini API response structure unexpected or empty:', result);
        // Handle unexpected response structure
        return { success: false, error: "Unexpected response structure from Gemini API." };
      }
    } catch (error: any) { // Catch any network or other errors during the fetch call
      console.error('Convex Action: Error calling Gemini API:', error);
      return { success: false, error: `Network error or unexpected issue: ${error.message}` };
    }
  },
});