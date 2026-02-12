import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "../../../lib/models/order";
import Cart from "../../../lib/models/cart";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URL!, {
      dbName: 'clerk-db',
    });
  }
};

export async function GET(req: Request) {
  try {
    await connectDB();
    const guestId = req.headers.get("x-guest-id");

    if (!guestId) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await Order.find({ guestId }).sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("[GET /api/orders] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const guestId = req.headers.get("x-guest-id");
    if (!guestId) {
      return NextResponse.json({ error: "Missing Guest ID" }, { status: 400 });
    }

    const { customerDetails, items, totalAmount } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // 1. Create the Order
    const newOrder = await Order.create({
      guestId,
      items: items, 
      totalAmount: totalAmount, 
      status: 'Pending',
      customerDetails: customerDetails || {}, 
      createdAt: new Date(),
    });

    // 2. Clear the Cart in the Database
    const cart = await Cart.findOne({ guestId });
    if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
    }

    return NextResponse.json({ 
      success: true, 
      orderId: newOrder._id 
    });

  } catch (error: any) {
    console.error("[POST /api/orders] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}