// src/app/api/products/seed/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import Product from "../../../lib/models/product";
import { connect } from "../../../lib/mongodb";
import { productsData } from "../../products/productsdata"; // Adjust path if needed

// Configure Cloudinary explicitly (or ensure your env vars are set)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function GET() {
  try {
    await connect();

    // 1. Security Check (Optional but recommended for Prod)
    // You might want to protect this route so random users can't reset your DB
    // const { searchParams } = new URL(request.url);
    // if (searchParams.get('secret') !== process.env.SEED_SECRET) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // 2. Clear existing products
    await Product.deleteMany({});
    console.log("Existing products cleared.");

    const results = [];

    for (const p of productsData) {
      try {
        console.log(`Processing: ${p.name}`);

        // This tells Cloudinary to fetch the image from Unsplash.
        const uploadResult = await cloudinary.uploader.upload(p.image, {
          folder: "products-catalog", 
          public_id: p.sku, 
          overwrite: true
        });

        // 4. Create DB Entry
        const newProduct = await Product.create({
          id: p.id,
          category: p.category,
          name: p.name,
          sku: p.sku,
          price: p.price,
          originalPrice: p.originalPrice,
          onSale: p.onSale,
          description: p.description,
          image: uploadResult.secure_url, 
        });

        results.push({ name: p.name, status: "success", url: uploadResult.secure_url });
      
      } catch (innerError: any) {
        console.error(`Failed to seed ${p.name}:`, innerError);
        results.push({ name: p.name, status: "error", error: innerError.message });
      }
    }

    return NextResponse.json({ 
      message: "Seed operation completed", 
      results 
    }, { status: 200 });

  } catch (err: any) {
    console.error("Critical Seed Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}