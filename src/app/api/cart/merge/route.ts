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
    const guestId = body?.guestId;

    if (!userId && !guestId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    const guestCart = guestId ? await Cart.findOne({ guestId }) : null;

    if (!guestCart && !userId) {
      return NextResponse.json({ success: true, message: "No guest cart found" });
    }

    if (userId && guestCart) {
      guestCart.items = Array.isArray(guestCart.items) ? guestCart.items : [];

      let userCart = await Cart.findOne({ userId });
      if (userCart) {
        userCart.items = Array.isArray(userCart.items) ? userCart.items : [];

        const existingItemsMap = new Map<string, any>();
        userCart.items.forEach((item: any) => {
          if (item && item.productId !== undefined && item.productId !== null) {
            existingItemsMap.set(item.productId.toString(), item);
          }
        });

        guestCart.items.forEach((guestItem: any) => {
          if (!guestItem || guestItem.productId === undefined || guestItem.productId === null) return;
          const guestProductId = guestItem.productId.toString();
          const existingItem = existingItemsMap.get(guestProductId);

          if (existingItem) {
            existingItem.quantity = (Number(existingItem.quantity) || 0) + (Number(guestItem.quantity) || 0);
          } else {
            const plain = guestItem.toObject ? guestItem.toObject() : JSON.parse(JSON.stringify(guestItem));
            userCart.items.push(plain);
          }
        });

        userCart.totalAmount = userCart.items.reduce(
          (acc: number, item: any) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)),
          0
        );

        await userCart.save();
        await Cart.findByIdAndDelete(guestCart._id);

      } else {
        guestCart.userId = userId;
        guestCart.guestId = undefined;
        guestCart.items = Array.isArray(guestCart.items) ? guestCart.items : [];
        guestCart.totalAmount = guestCart.items.reduce(
          (acc: number, item: any) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)),
          0
        );
        await guestCart.save();
      }

      return NextResponse.json({ success: true, message: "Carts merged successfully" });
    }

    if (!userId && guestCart) {
      guestCart.items = Array.isArray(guestCart.items) ? guestCart.items : [];
      guestCart.totalAmount = guestCart.items.reduce(
        (acc: number, item: any) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)),
        0
      );
      await guestCart.save();
      return NextResponse.json({ success: true, message: "Guest cart preserved" });
    }
    
    if (userId && !guestCart) {
      return NextResponse.json({ success: true, message: "No guest cart to merge" });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Merge API Error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
