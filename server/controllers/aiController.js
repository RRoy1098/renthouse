import { generateChat, generateChatStream } from "../config/gemini.js";
import Listing from "../models/Listing.js";

function buildListingContext(l, idx) {
  const title = (l.description || "Room").slice(0, 80);
  const type = l.type || "N/A";
  const price = "Rs." + (l.rent?.toLocaleString() || "N/A") + "/month";
  const deposit = "Rs." + (l.deposit?.toLocaleString() || "N/A");
  const loc = (l.location?.address || "") + ", " + (l.location?.city || "") + ", " + (l.location?.state || "");
  const furnishing = l.furnishing || "N/A";
  const sqft = l.sqft || "N/A";
  let amenities = "N/A";
  if (l.amenities) {
    amenities = Object.entries(l.amenities).filter(([, v]) => v).map(([k]) => k).join(", ");
  }
  return "ID: " + l._id + " | Title: " + title + " | Type: " + type + " | Price: " + price + " | Deposit: " + deposit + " | Location: " + loc + " | Furnishing: " + furnishing + " | Sqft: " + sqft + " | Amenities: " + amenities;
}

// 1. Chat - streaming via SSE
export const chat = async (req, res) => {
  try {
    const { message, conversationHistory, listingId } = req.body;
    if (!message) return res.status(400).json({ error: true, message: "Message is required" });

    let listingInfo = "";
    if (listingId) {
      const listing = await Listing.findById(listingId).populate("owner", "name");
      if (listing) {
        listingInfo = "\n\nThe user is viewing this listing:\n" + buildListingContext(listing, 0) + "\n";
      }
    }

    const policies = "Tenants browse freely, sign up, and send inquiries to owners. Inquiries reviewed by owners. No online payment yet. Tenants can cancel pending inquiries. Move-in dates coordinated with owner. Reviews after bookings.";
    const systemPrompt = "You are a helpful rental platform assistant for RentHouse. Help tenants with: how the platform works, specific listings, neighbourhood, cancellation policies, move-in procedures, general renting advice. Policies: " + policies + " Be friendly, concise, helpful. If asked outside renting, politely redirect. Never invent listing details." + listingInfo;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      const stream = await generateChatStream({ systemPrompt, conversationHistory, userMessage: message });
      let fullText = "";
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          res.write("data: " + JSON.stringify({ text }) + "\n\n");
        }
      }
      res.write("data: " + JSON.stringify({ done: true, fullText }) + "\n\n");
      res.end();
    } catch {
      const result = await generateChat({ systemPrompt, conversationHistory, userMessage: message });
      res.write("data: " + JSON.stringify({ text: result }) + "\n\n");
      res.write("data: " + JSON.stringify({ done: true, fullText: result }) + "\n\n");
      res.end();
    }
  } catch (error) {
    console.error("Chat error:", error);
    res.end();
  }
};

// 2. Smart Search - AI has access to all listings, returns matching results
export const parseSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: true, message: "Search query is required" });

    // Fetch all available listings with key fields
    const allListings = await Listing.find({ status: "available" })
      .select("_id description type rent deposit location furnishing sqft amenities images")
      .lean();

    if (allListings.length === 0) {
      return res.json({ success: true, data: { listings: [], filters: {}, originalQuery: query, totalListings: 0 } });
    }

    // Build compact listing catalog for AI
    const listingCatalog = allListings.map((l, i) => buildListingContext(l, i)).join("\n");

    const prompt = "You are a smart rental search assistant. A user is searching with this query: \"" + query + "\"\n\n" +
      "Here are ALL available rental listings (total: " + allListings.length + "):\n" + listingCatalog + "\n\n" +
      "Your job:\n" +
      "1. Understand the user's intent from their natural language query\n" +
      "2. Match the BEST listings that fit the query based on: location, price range, room type, amenities, furnishing\n" +
      "3. Also extract structured filters from the query\n\n" +
      "Return ONLY a valid JSON object with these exact keys:\n" +
      "- \"matchingIds\": array of listing IDs (max 12, ordered by best match first) that match the query. Return EMPTY array if no listings match.\n" +
      "- \"filters\": object with optional keys { location, minPrice, maxPrice, roomType, amenities[] } extracted from the query. Omit any key not mentioned.\n\n" +
      "No explanation, no markdown, no extra text. ONLY valid JSON.";

    try {
      const response = await generateChat({
        systemPrompt: "You return JSON only. Never include markdown or extra text.",
        conversationHistory: [],
        userMessage: prompt,
      });

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      let parsed;
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }

      const matchingIds = Array.isArray(parsed.matchingIds) ? parsed.matchingIds : [];
      const filters = parsed.filters || {};

      // Fetch the matched listings
      let matchedListings = [];
      if (matchingIds.length > 0) {
        matchedListings = await Listing.find({ _id: { $in: matchingIds } })
          .populate("owner", "name email phone")
          .lean();

        // Preserve the AI ordering
        const idOrder = {};
        matchingIds.forEach((id, i) => { idOrder[String(id)] = i; });
        matchedListings.sort((a, b) => (idOrder[String(a._id)] ?? 999) - (idOrder[String(b._id)] ?? 999));
      }

      res.json({
        success: true,
        data: {
          listings: matchedListings,
          filters,
          originalQuery: query,
          totalListings: allListings.length,
          matchedCount: matchedListings.length,
        }
      });
    } catch (parseErr) {
      console.error("AI parse error, falling back to filter-only:", parseErr.message);
      // Fallback: just return extracted filters without AI matching
      const fallbackPrompt = "Extract search filters from this query: \"" + query + "\" Return ONLY a valid JSON object with optional keys: { location, minPrice, maxPrice, roomType, amenities[] } If a value is not mentioned, omit the key entirely. No explanation or markdown.";
      const fallbackResponse = await generateChat({
        systemPrompt: "You return JSON only.",
        conversationHistory: [],
        userMessage: fallbackPrompt,
      });
      const fallbackMatch = fallbackResponse.match(/\{[\s\S]*\}/);
      const fallbackFilters = fallbackMatch ? JSON.parse(fallbackMatch[0]) : {};

      res.json({
        success: true,
        data: {
          listings: [],
          filters: fallbackFilters,
          originalQuery: query,
          totalListings: allListings.length,
          matchedCount: 0,
          fallback: true,
        }
      });
    }
  } catch (error) {
    console.error("Parse search error:", error);
    res.status(500).json({ error: true, message: "Failed to parse search query" });
  }
};

// 3. Message Draft Helper
export const draftMessage = async (req, res) => {
  try {
    const { intent, note, listing } = req.body;
    if (!intent || !listing) return res.status(400).json({ error: true, message: "Intent and listing details are required" });

    const prompt = "Draft a short polite message from tenant to room owner. Intent: " + intent + " Note: " + (note || "None") + " Listing: " + (listing.title || "Room") + ", Rs." + (listing.price || "N/A") + "/month, " + (listing.location || "") + " Friendly professional tone, under 80 words. Return only the message text.";
    const draft = await generateChat({
      systemPrompt: "You are a helpful assistant. Return only the requested message text.",
      conversationHistory: [],
      userMessage: prompt,
    });
    res.json({ success: true, data: { draft: draft || "" } });
  } catch (error) {
    console.error("Draft error:", error);
    res.status(500).json({ error: true, message: "Failed to draft message" });
  }
};
