import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Wishlist from "../../../lib/models/wishlist";
import Product from "../../../lib/models/product"; 

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

export async function GET(req: Request) {
  try {
    await connectDB();
    const guestId = req.headers.get("x-guest-id");
    
    console.log("[GET /api/wishlist] Guest ID:", guestId);
    
    if (!guestId) {
      console.log("[GET /api/wishlist] No guest ID provided");
      return NextResponse.json([]);
    }

    const wishlist = await Wishlist.findOne({ guestId }).populate("products");
    
    console.log("[GET /api/wishlist] Wishlist found:", wishlist);
    
    if (!wishlist) {
      console.log("[GET /api/wishlist] No wishlist for guest");
      return NextResponse.json([]);
    }
    
    return NextResponse.json(wishlist.products);
  } catch (error: any) {
    console.error("[GET /api/wishlist] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { productId } = await req.json(); 
    const guestId = req.headers.get("x-guest-id");

    console.log("[POST /api/wishlist] Received request");
    console.log("[POST /api/wishlist] Guest ID:", guestId);
    console.log("[POST /api/wishlist] Product ID:", productId);

    if (!guestId) {
      console.error("[POST /api/wishlist] Missing guest ID");
      return NextResponse.json({ error: "No Guest ID provided" }, { status: 400 });
    }

    if (!productId) {
      console.error("[POST /api/wishlist] Missing product ID");
      return NextResponse.json({ error: "No Product ID provided" }, { status: 400 });
    }

    // 1. Find the product using the numeric ID
    const dbProduct = await Product.findOne({ id: productId });
    
    console.log("[POST /api/wishlist] DB Product found:", dbProduct?._id);
    
    if (!dbProduct) {
      console.error("[POST /api/wishlist] Product not found for ID:", productId);
      return NextResponse.json({ error: "Product not found in DB" }, { status: 404 });
    }

    const mongoId = dbProduct._id; 

    // 2. Find or create wishlist
    let wishlist = await Wishlist.findOne({ guestId });
    
    if (!wishlist) {
      console.log("[POST /api/wishlist] Creating new wishlist for guest:", guestId);
      wishlist = await Wishlist.create({ guestId, products: [] });
    }

    console.log("[POST /api/wishlist] Current wishlist products:", wishlist.products);

    // 3. Toggle product in wishlist
    const index = wishlist.products.findIndex((id: any) => id.toString() === mongoId.toString());

    let action;
    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = "removed";
      console.log("[POST /api/wishlist] Removed product from wishlist");
    } else {
      wishlist.products.push(mongoId);
      action = "added";
      console.log("[POST /api/wishlist] Added product to wishlist");
    }

    await wishlist.save();
    console.log("[POST /api/wishlist] Wishlist saved successfully");
    console.log("[POST /api/wishlist] Updated products:", wishlist.products);

    return NextResponse.json({ 
      success: true, 
      action,
      productId,
      wishlistLength: wishlist.products.length
    });

  } catch (error: any) {
    console.error("[POST /api/wishlist] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}