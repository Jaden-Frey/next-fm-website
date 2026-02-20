import { NextResponse } from 'next/server';
import { connect } from '../../../lib/mongodb';
import Product from '../../../lib/models/product';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.FM_API_KEY });

export async function POST(request: Request) {
    try {
        await connect();

        const body = await request.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ error: "No search query provided" }, { status: 400 });
        }

        // 1. Fetch the full product catalog from DB first
        const allProducts = await Product.find({}).select('_id id name description category price onSale').lean();

        if (allProducts.length === 0) {
            return NextResponse.json({ success: true, ids: "", products: [] }, { status: 200 });
        }

        // 2. Build a compact catalog string to send to Gemini
        const catalogLines = allProducts.map(p =>
            `ID:${p._id} | Name: ${p.name} | Category: ${p.category} | Description: ${p.description ?? ''}`
        ).join('\n');

        // 3. Semantic prompt — Gemini decides relevance AND quantity, no fixed count
        const prompt = `
You are an expert AI assistant for a premium butcher shop in South Africa.
A customer has made the following request: "${query}"

Here is the full product catalog:
---
${catalogLines}
---

Your task:
- Understand the customer's INTENT, not just their literal words.
- "Braai" means BBQ/grilling (South African term) — match cuts suited for grilling (e.g. chops, ribs, steaks, boerewors, chicken pieces).
- "Roast" means slow-roasting cuts (e.g. whole chicken, lamb leg, beef roast).
- "Quick dinner" means fast-cooking cuts (e.g. chicken breast, mince, thin steaks).
- "Special occasion" or "impress guests" means premium cuts (e.g. lamb rack, ribeye, tomahawk).
- "Budget" or "cheap" means lower-priced items.
- Apply similar semantic reasoning for any other context-based queries.
- Be precise: only include products that are a GENUINE match for the query. Do not pad results.
- If the query is very specific (e.g. "I need pork chops"), return only that product.
- If the query is moderately specific (e.g. "I need something to braai"), return all products that legitimately fit — no more, no less.
- If the query is very broad (e.g. "I need meat" or "show me everything"), return an empty matchedIds array and set reasoning to "too_broad" — the frontend will show all products.
- If nothing in the catalog matches, return an empty matchedIds array.
- Rank matched products by relevance (best match first).

Return ONLY a valid JSON object in this exact format, with NO markdown or extra text:
{
  "matchedIds": ["<_id1>", "<_id2>"],
  "reasoning": "brief explanation of why these were chosen"
}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const rawText = (response.text ?? "{}").trim();

        // 4. Safely parse — strip any accidental markdown fences
        let aiResult: { matchedIds?: string[]; reasoning?: string } = {};
        try {
            const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            aiResult = JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse Gemini response:", rawText);
            aiResult = { matchedIds: [], reasoning: "Parse error" };
        }

        const matchedIds = Array.isArray(aiResult.matchedIds) ? aiResult.matchedIds : [];

        // 5. Retrieve matched products from the already-fetched catalog (no second DB round-trip)
        const matchedProducts = allProducts.filter(p =>
            matchedIds.includes(String(p._id))
        );

        // Preserve the AI's ranking order
        const orderedProducts = matchedIds
            .map(id => matchedProducts.find(p => String(p._id) === id))
            .filter(Boolean);

        const idsString = matchedIds.join(",");

        console.log(`[AI Search] Query: "${query}" → ${matchedIds.length} matches. Reason: ${aiResult.reasoning}`);

        return NextResponse.json({
            success: true,
            reasoning: aiResult.reasoning,
            ids: idsString,
            products: orderedProducts,
        }, { status: 200 });

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}