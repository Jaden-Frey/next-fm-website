import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "../../../lib/models/order";
import Cart from "../../../lib/models/cart";
import { auth } from "@clerk/nextjs/server";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URL!, {
    dbName: 'clerk-db',
  });
};

export async function GET(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();
    const guestId = req.headers.get("x-guest-id");

    // 1. Determine who we are querying for (User or Guest)
    let query: any = {};
    if (userId) {
      query = { userId };
    } else if (guestId) {
      query = { guestId };
    } else {
      return NextResponse.json({ orders: [] });
    }

    // 2. Fetch all orders sorted by newest first
    const orders = await Order.find(query).sort({ createdAt: -1 });

    if (orders.length > 1) {
      const newestOrderId = orders[0]._id;
      
      // Update all OTHER orders for this user/guest that are still 'Pending' to 'Completed'
      await Order.updateMany(
        { ...query, _id: { $ne: newestOrderId }, status: 'Pending' },
        { $set: { status: 'Completed' } }
      );
      
      // Return the cleaned-up list
      const updatedOrders = await Order.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ orders: updatedOrders });
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("GET Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();
    const guestId = req.headers.get("x-guest-id");

    // 1. Validate Identity
    if (!userId && !guestId) {
      return NextResponse.json({ error: "Missing User or Guest ID" }, { status: 400 });
    }

    const body = await req.json();
    const { customerDetails, items, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // 2. Define the Query (Who is placing this order?)
    const query = userId ? { userId } : { guestId };

    // 3. Mark ALL previous "Pending" orders for this user/guest as "Completed"
    await Order.updateMany(
      { ...query, status: 'Pending' },
      { $set: { status: 'Completed' } }
    );

    // 4. Create the New Order
    const newOrder = await Order.create({
      userId: userId || null,   
      guestId: guestId || null, 
      items, 
      totalAmount, 
      status: 'Pending', 
      customerDetails: customerDetails || {}, 
      paymentMethod: body.paymentMethod || "Cash on Delivery",
      createdAt: new Date(),
    });

    // 5. Clear the Cart (for the specific user or guest)
    const cart = await Cart.findOne(query);
    if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
    }

    return NextResponse.json({ success: true, orderId: newOrder._id });

  } catch (error: any) {
    console.error("POST Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}