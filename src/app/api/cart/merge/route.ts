import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Cart from "../../../../lib/models/cart"; 
import { auth } from "@clerk/nextjs/server";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URL!, {
      dbName: 'clerk-db', 
    });
  }
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();
    const body = await req.json();
    const guestId = body.guestId;

    if (!userId || !guestId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    const guestCart = await Cart.findOne({ guestId });

    if (!guestCart) {
      return NextResponse.json({ success: true, message: "No guest cart found" });
    }

    let userCart = await Cart.findOne({ userId });

    if (userCart) {
      const userItems = userCart.items || [];
      const guestItems = guestCart.items || [];

      const existingItemsMap = new Map<string, any>();
      
      userItems.forEach((item: any) => {
        if (item && item.productId) {
          existingItemsMap.set(item.productId.toString(), item);
        }
      });

      guestItems.forEach((guestItem: any) => {
        if (!guestItem || !guestItem.productId) return;

        const guestProductId = guestItem.productId.toString();
        const existingItem = existingItemsMap.get(guestProductId);

        if (existingItem) {
          existingItem.quantity += guestItem.quantity;
        } else {
          userCart.items.push(guestItem);
        }
      });

      userCart.totalAmount = userCart.items.reduce(
        (acc: number, item: any) => acc + (item.price * item.quantity), 
        0
      );

      await userCart.save();
      await Cart.findByIdAndDelete(guestCart._id);

    } else {
      guestCart.userId = userId;
      guestCart.guestId = undefined;
      await guestCart.save();
    }

    return NextResponse.json({ success: true, message: "Carts merged successfully" });

  } catch (error: any) {
    console.error("Merge API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}