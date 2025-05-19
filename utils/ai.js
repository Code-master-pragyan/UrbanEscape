const Listing = require("../models/listing.js");

async function processAIQuery(userMessage) {
    try {
        const wantsListings = detectSearchIntent(userMessage);
        const searchParams = wantsListings ? parseSearchQuery(userMessage) : null;

        let listings = [];
        let factPrompt = "";
        let listingsText = "";

        if (searchParams) {
            listings = await Listing.find(searchParams).limit(10);
            console.log("🔍 Query used by AI:", searchParams);
            console.log("📦 Listings found:", listings);


            if (listings.length > 0) {
                const totalCount = listings.length;
                const location = extractLocation(userMessage) || "this location";

                const titles = listings.map((l, i) =>
                    `${i + 1}. ${l.title} (${l.location}, ${l.country})`
                ).join("\n");

                listingsText = `There are ${totalCount} listings found for "${location}":\n\n${titles}`;
                factPrompt = `\nAlso share a short and interesting fact about ${location}.`;
            } else {
                listingsText = `Sorry, there are no listings matching your request.`;
            }
        } else {
            listingsText = `User asked: "${userMessage}". Just reply helpfully as a travel guide.`;
        }

        const systemPrompt = `
You are UrbanEscape's AI travel assistant.
- Use ONLY the listings provided below to answer if listings are requested.
- Do NOT make up listings. Just summarize what's available from the data.
- If applicable, share 1 interesting fact about the place or country.
- If it's a general chat, reply like a friendly guide without referencing listings.

Listings:
${listingsText}
${factPrompt}
        `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't answer that right now.";

        return (searchParams && listings.length > 0)
            ? { reply, listings }
            : { reply };

    } catch (error) {
        console.error("AI Error:", error);
        return { reply: "Sorry, something went wrong with the AI response." };
    }
}

function detectSearchIntent(message) {
    const phrases = [
        "show me", "find", "listings", "places in", "stay in", "hotels in", "cheap places", "rooms in"
    ];
    const msg = message.toLowerCase();
    return phrases.some(p => msg.includes(p));
}

function parseSearchQuery(message) {
    const filter = {};
    const locationMatch = message.match(/\b(?:in|at|to|from)\s+([a-z\s]+)/i);
    if (locationMatch) {
        const location = locationMatch[1].trim();
        filter.$or = [
            { location: { $regex: location, $options: 'i' } },
            { country: { $regex: location, $options: 'i' } }
        ];
    }

    if (message.toLowerCase().includes("cheap") || message.toLowerCase().includes("affordable")) {
        filter.price = { $lte: 100 };
    }

    return Object.keys(filter).length > 0 ? filter : null;
}

function extractLocation(message) {
    const match = message.match(/\b(?:in|at|to|from)\s+([a-z\s]+)/i);
    return match ? match[1].trim() : null;
}

module.exports = { processAIQuery };
