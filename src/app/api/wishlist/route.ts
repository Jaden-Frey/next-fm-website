import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Wishlist from "../../../lib/models/wishlist";
import Product from "../../../lib/models/product"; 

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URL!);
  }
};

export async function GET(req: Request) {
  try {
    await connectDB();
    const guestId = req.headers.get("x-guest-id");
    
    if (!guestId) return NextResponse.json([]);

    const wishlist = await Wishlist.findOne({ guestId }).populate("products");
    
    if (!wishlist) return NextResponse.json([]);
    
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

    if (!guestId || !productId) {
      return NextResponse.json({ error: "Missing Guest ID or Product ID" }, { status: 400 });
    }

    // 1. Find product
    const dbProduct = await Product.findOne({ id: productId });
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const mongoId = dbProduct._id; 

    // 2. Find or create wishlist
    let wishlist = await Wishlist.findOne({ guestId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ guestId, products: [] });
    }

    // 3. Modify Wishlist Array
    const index = wishlist.products.findIndex((id: any) => id.toString() === mongoId.toString());
    let action;

    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = "removed";
    } else {
      wishlist.products.push(mongoId);
      action = "added";
    }

    // 4. ERROR HANDLING 
    try {
      await wishlist.save();
    } catch (saveError: any) {
      if (saveError.name === 'VersionError') {
         console.warn("Database VersionError ignored (Race Condition detected).");
         wishlist = await Wishlist.findOne({ guestId });
      } else {
         throw saveError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      action,
      productId,
      wishlistLength: wishlist ? wishlist.products.length : 0
    });

  } catch (error: any) {
    console.error("[POST /api/wishlist] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}