import { NextResponse } from "next/server";
import Product from "../../../lib/models/product";
import { connect } from "../../../lib/mongodb";
import { productsData } from "../../products/productsdata";

export async function GET() {
  try {
    await connect();

    // 1. Clear the DB
    await Product.deleteMany({});

    // 2. Insert data directly (No Cloudinary, No Uploads)
    // The image URLs in productsData are already valid web links.
    await Product.insertMany(productsData);

    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${productsData.length} products successfully.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}