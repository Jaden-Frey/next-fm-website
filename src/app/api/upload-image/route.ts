import { NextResponse } from 'next/server';
import { connect } from '../../../lib/mongodb';
import { UploadImage } from '../../../lib/upload-image';
import { Image } from '../../../lib/models/image.model';
import Product from '../../../lib/models/product';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.FM_API_KEY });

export async function POST(request: Request) {
    try {
        await connect();

        const formData = await request.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // 1. Upload to Cloudinary
        const uploadResult = await UploadImage(image, "image-upload") as any;

        // 2. Save image metadata to MongoDB
        const savedImage = await Image.create({
            filename:  image.name,
            url:       uploadResult.secure_url,
            publicId:  uploadResult.public_id,
            format:    uploadResult.format,
            size:      uploadResult.bytes,
            folder:    uploadResult.folder || "image-upload",
            width:     uploadResult.width,
            height:    uploadResult.height,
        });

        // 3. Convert image to Base64 for Gemini
        const bytes = await image.arrayBuffer();
        const base64Image = Buffer.from(bytes).toString("base64");

        // 4. Fetch full product catalog
        const allProducts = await Product.find({})
            .select('_id id name description category price onSale')
            .lean();

        const catalogLines = allProducts.map((p: any) =>
            `ID:${p._id} | Name: ${p.name} | Category: ${p.category} | Description: ${p.description ?? ''}`
        ).join('\n');

        // 5. Single Gemini call — analyse image AND match directly against catalog
        const prompt = `
You are an expert master butcher and AI assistant for a premium South African butcher shop.

A customer has uploaded a photo of a meat product. Your job is to:
1. Carefully analyse the image — identify the animal, cut, preparation style, bone presence,
   marbling level, colour, and any other visual indicators.
2. Compare your analysis against the product catalog below and select every product that is a
   genuine match for what is shown in the image.

Product catalog:
---
${catalogLines}
---

Matching rules:
- Match on visual similarity: if the image shows pork chops, match all pork chop products.
- Match on cut family: if the image shows a rack of ribs, match ribs regardless of animal if visually consistent.
- If the exact cut isn't in the catalog, match the closest equivalent (e.g. Tomahawk → Ribeye Steak).
- Be precise — only include products that are a GENUINE visual match. Do not pad results.
- If the image is ambiguous or low quality, match the closest plausible products.
- If nothing matches, return an empty matchedIds array.
- Rank matched products by confidence (best match first).

Return ONLY a valid JSON object in this exact format, with NO markdown or extra text:
{
  "visualAnalysis": "brief description of what you see in the image",
  "detectedAnimal": "beef|pork|chicken|lamb|unknown",
  "detectedCut": "name of the cut or 'unknown'",
  "matchedIds": ["<_id1>", "<_id2>"],
  "reasoning": "why these products were matched"
}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: image.type,
                                data: base64Image,
                            }
                        }
                    ]
                }
            ],
        });

        // 6. Safely parse Gemini response
        const rawText = (response.text ?? "{}").trim();
        let aiResult: {
            visualAnalysis?: string;
            detectedAnimal?: string;
            detectedCut?: string;
            matchedIds?: string[];
            reasoning?: string;
        } = {};

        try {
            const cleaned = rawText
                .replace(/^```json\s*/i, '')
                .replace(/```\s*$/i, '')
                .trim();
            aiResult = JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse Gemini response:", rawText);
            aiResult = { matchedIds: [], reasoning: "Parse error" };
        }

        const matchedIds = Array.isArray(aiResult.matchedIds) ? aiResult.matchedIds : [];

        // 7. Preserve AI ranking order
        const matchedProducts = allProducts.filter((p: any) =>
            matchedIds.includes(String(p._id))
        );
        const orderedProducts = matchedIds
            .map(id => matchedProducts.find((p: any) => String(p._id) === id))
            .filter(Boolean);

        console.log(
            `[Image Search] Detected: ${aiResult.detectedAnimal} / ${aiResult.detectedCut}`,
            `→ ${matchedIds.length} matches. Reason: ${aiResult.reasoning}`
        );

        // 8. Build redirect URL 
        const promptLabel = (
            aiResult.detectedCut && aiResult.detectedCut !== 'unknown'
                ? `${aiResult.detectedAnimal} – ${aiResult.detectedCut}`
                : aiResult.visualAnalysis ?? "image search"
        );

        const categoryParam =
            aiResult.detectedAnimal &&
            aiResult.detectedAnimal !== 'unknown' &&
            ['beef', 'pork', 'chicken', 'lamb'].includes(aiResult.detectedAnimal)
                ? aiResult.detectedAnimal
                : 'all';

        const redirectUrl = matchedIds.length > 0
            ? `/products?highlight=${matchedIds.join(',')}&ai_prompt=${encodeURIComponent(promptLabel)}&category=${categoryParam}`
            : `/products?nomatch=1&ai_prompt=${encodeURIComponent(promptLabel)}`;

        return NextResponse.json({
            success:       true,
            image:         savedImage,
            cloudinaryUrl: uploadResult.secure_url,
            analysis: {
                visualAnalysis: aiResult.visualAnalysis,
                detectedAnimal: aiResult.detectedAnimal,
                detectedCut:    aiResult.detectedCut,
                reasoning:      aiResult.reasoning,
            },
            matchedIds,
            products:    orderedProducts,
            redirectUrl, 
        }, { status: 200 });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({
            error:   "Upload failed",
            details: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}