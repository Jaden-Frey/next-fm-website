import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Cart from "../../../lib/models/cart";
import Product from "../../../lib/models/product";
import { auth } from "@clerk/nextjs/server";

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
    const { userId } = await auth();
    const guestId = req.headers.get("x-guest-id");

    let query: any = {};
    if (userId) query = { userId };
    else if (guestId) query = { guestId };
    else return NextResponse.json({ items: [], total: 0 });

    const cart = await Cart.findOne(query).populate({
      path: 'items.productId',
      model: 'Product'
    });

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return NextResponse.json({ items: [], total: 0 });
    }

    // remove items where product was deleted (productId null)
    const validItems = cart.items.filter((item: any) => item.productId !== null);
    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      cart.totalAmount = cart.items.reduce((acc: number, it: any) => acc + ((Number(it.price) || 0) * (Number(it.quantity) || 0)), 0);
      await cart.save();
    }

    const formattedItems = validItems.map((item: any) => {
      // productId may be populated (object) or stored as ObjectId (string)
      const prod = item.productId;
      const idFallback = prod?.id ?? (prod?._id ? prod._id.toString() : prod?.toString());
      const name = item.name || prod?.name || "Unknown product";
      const price = (item.price !== undefined && item.price !== null) ? item.price : prod?.price ?? 0;
      const image = item.image || prod?.image || "";

      return {
        id: idFallback,
        name,
        price,
        image,
        quantity: item.quantity || 0,
        cartItemId: item._id
      };
    });

    return NextResponse.json({ items: formattedItems, total: cart.totalAmount || 0 });
  } catch (error: any) {
    console.error("GET cart error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();
    const body = await req.json();
    const { productId, quantity = 1 } = body;
    const guestId = req.headers.get("x-guest-id") || body?.guestId;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    // Find product. (Your Product model appears to have numeric `id` field.)
    const dbProduct = await Product.findOne({ id: Number(productId) });
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!userId && !guestId) {
      return NextResponse.json({ error: "Missing user identification" }, { status: 400 });
    }

    const query = userId ? { userId } : { guestId };
    let cart = await Cart.findOne(query);
    if (!cart) {
      cart = new Cart({ ...query, items: [] });
    }

    cart.items = Array.isArray(cart.items) ? cart.items : [];

    const mongoId = dbProduct._id.toString();
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId && item.productId.toString() === mongoId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = (Number(cart.items[existingItemIndex].quantity) || 0) + Number(quantity);
    } else {
      cart.items.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.image,
        quantity: Number(quantity)
      });
    }

    cart.totalAmount = cart.items.reduce((acc: number, item: any) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
    await cart.save();

    return NextResponse.json({
      success: true,
      itemCount: cart.items.length,
      message: "Item added to cart"
    });
  } catch (error: any) {
    console.error("POST cart error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const guestId = req.headers.get("x-guest-id");

    if (!productId) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

    const dbProduct = await Product.findOne({ id: Number(productId) });
    if (!dbProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (!userId && !guestId) return NextResponse.json({ error: "Missing user identification" }, { status: 400 });

    const query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query);
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    cart.items = cart.items.filter((item: any) => item.productId.toString() !== dbProduct._id.toString());
    cart.totalAmount = cart.items.reduce((acc: number, item: any) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
    await cart.save();

    return NextResponse.json({ success: true, itemCount: cart.items.length });
  } catch (error: any) {
    console.error("DELETE cart error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();
    const { productId, quantity } = await req.json();
    const guestId = req.headers.get("x-guest-id");

    if (quantity === undefined) return NextResponse.json({ error: "Missing quantity" }, { status: 400 });
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    const dbProduct = await Product.findOne({ id: Number(productId) });
    if (!dbProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (!userId && !guestId) return NextResponse.json({ error: "Missing user identification" }, { status: 400 });

    const query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query);
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    const itemIndex = cart.items.findIndex((item: any) => item.productId.toString() === dbProduct._id.toString());
    if (itemIndex === -1) return NextResponse.json({ error: "Item not in cart" }, { status: 404 });

    cart.items[itemIndex].quantity = Number(quantity);
    cart.totalAmount = cart.items.reduce((acc: number, item: any) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
    await cart.save();

    return NextResponse.json({ success: true, newQuantity: Number(quantity) });
  } catch (error: any) {
    console.error("PATCH cart error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
