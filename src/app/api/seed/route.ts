import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import Product from "../../../lib/models/product";
import { connect } from "../../../lib/mongodb";
import { productsData } from "../../products/productsdata";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function GET() {
  try {
    await connect();

    // Clear existing products
    await Product.deleteMany({});

    const seededProducts = [];

    for (const p of productsData) {
      try {
        // Upload directly from remote URL (serverless friendly)
        const upload = await cloudinary.uploader.upload(p.image, {
          folder: "meat-app-products",
          public_id: p.sku, 
          overwrite: true
        });

        // Save to MongoDB
        const newProduct = await Product.create({
          id: Number(p.id),
          category: p.category,
          name: p.name,
          sku: p.sku,
          price: Number(p.price),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
          onSale: Boolean(p.onSale),
          description: p.description,
          image: upload.secure_url,
        });

        seededProducts.push(newProduct.name);
      } catch (err) {
        console.error(`Failed to seed ${p.sku}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: seededProducts.length, 
      products: seededProducts 
    });

  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}