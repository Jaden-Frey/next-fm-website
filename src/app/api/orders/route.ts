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
    if (!guestId) return NextResponse.json({ orders: [] });

    // 1. Fetch all orders sorted by newest first
    const orders = await Order.find({ guestId }).sort({ createdAt: -1 });

    // If we have multiple orders, ensure only the first one (newest) is 'Pending'and all others are 'Completed'. This fixes old data.
    
    if (orders.length > 1) {
      const newestOrderId = orders[0]._id;
      await Order.updateMany(
        { guestId, _id: { $ne: newestOrderId }, status: 'Pending' },
        { $set: { status: 'Completed' } }
      );
      
      // Refresh the list after update to show correct statuses immediately
      const updatedOrders = await Order.find({ guestId }).sort({ createdAt: -1 });
      return NextResponse.json({ orders: updatedOrders });
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const guestId = req.headers.get("x-guest-id");
    if (!guestId) return NextResponse.json({ error: "Missing Guest ID" }, { status: 400 });

    const { customerDetails, items, totalAmount } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Mark ALL previous pending orders as Completed before creating the new one
    await Order.updateMany(
      { guestId: guestId, status: 'Pending' },
      { $set: { status: 'Completed' } }
    );

    const newOrder = await Order.create({
      guestId,
      items, 
      totalAmount, 
      status: 'Pending', 
      customerDetails: customerDetails || {}, 
      createdAt: new Date(),
    });

    const cart = await Cart.findOne({ guestId });
    if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
    }

    return NextResponse.json({ success: true, orderId: newOrder._id });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}