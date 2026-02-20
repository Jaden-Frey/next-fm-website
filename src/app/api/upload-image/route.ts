import { NextResponse } from 'next/server';
import { connect } from '../../../lib/mongodb';
import { UploadImage } from '../../../lib/upload-image';
import { Image } from '../../../lib/models/image.model';
import  Product from '../../../lib/models/product';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        await connect(); 
        
        const formData = await request.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Upload to Cloudinary
        const uploadResult = await UploadImage(image, "image-upload") as any;

        // Save image metadata to MongoDB
        const savedImage = await Image.create({
            filename: image.name,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            format: uploadResult.format,
            size: uploadResult.bytes,
            folder: uploadResult.folder || "image-upload",
            width: uploadResult.width,
            height: uploadResult.height
        });

        // Convert image to Base64 for Gemini
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");

        // Analyze image with Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: "You are a master butcher. Look at this image and identify the type of meat, the cut, and any relevant details. Return ONLY a JSON object with this exact format: { \"category\": \"beef|pork|chicken|lamb\", \"keywords\": [\"keyword1\", \"keyword2\"] }. Do not include markdown formatting like ```json." },
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

        const aiText = response.text || "{}";
        let aiAnalysis;
        
        try {
            aiAnalysis = JSON.parse(aiText);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", aiText);
            aiAnalysis = { category: "other", keywords: [] }; 
        }

        // Query Product Database for matches using Regex
        const searchRegex = (aiAnalysis.keywords || []).map((kw: string) => new RegExp(kw, 'i'));
        
        const matchingProducts = await Product.find({
            $or: [
                { category: new RegExp(aiAnalysis.category, 'i') },
                { name: { $in: searchRegex } },
                { description: { $in: searchRegex } }
            ]
        }).limit(6);

        return NextResponse.json({ 
            success: true,
            image: savedImage, 
            cloudinaryUrl: uploadResult.secure_url,
            analysis: aiAnalysis,
            products: matchingProducts
        }, { status: 200 });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ 
            error: "Upload failed", 
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}