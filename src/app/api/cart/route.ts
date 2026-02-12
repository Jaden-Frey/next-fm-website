import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Cart from "../../../lib/models/cart";
import Product from "../../../lib/models/product";

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
      return NextResponse.json({ items: [], total: 0 });
    }

    const cart = await Cart.findOne({ guestId }).populate({
      path: 'items.productId',
      model: 'Product'
    });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ items: [], total: 0 });
    }
    
    const validItems = cart.items.filter((item: any) => item.productId !== null);

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const formattedItems = validItems.map((item: any) => ({
      ...item.productId.toObject(),
      quantity: item.quantity,
      cartItemId: item._id
    }));

    const total = formattedItems.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    return NextResponse.json({ 
      items: formattedItems,
      total: Math.round(total * 100) / 100
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { productId, quantity = 1 } = await req.json(); 
    const guestId = req.headers.get("x-guest-id");

    if (!guestId || !productId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const dbProduct = await Product.findOne({ id: Number(productId) });
    
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const mongoId = dbProduct._id;
    let cart = await Cart.findOne({ guestId });
    
    if (!cart) {
      cart = await Cart.create({ guestId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === mongoId.toString()
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId: mongoId, quantity });
    }

    await cart.save();

    return NextResponse.json({ 
      success: true,
      itemCount: cart.items.length,
      message: "Item added to cart"
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const guestId = req.headers.get("x-guest-id");

    if (!guestId || !productId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const dbProduct = await Product.findOne({ id: Number(productId) });
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const cart = await Cart.findOne({ guestId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== dbProduct._id.toString()
    );

    await cart.save();

    return NextResponse.json({ 
      success: true,
      itemCount: cart.items.length 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { productId, quantity } = await req.json();
    const guestId = req.headers.get("x-guest-id");

    if (!guestId || !productId || quantity === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const dbProduct = await Product.findOne({ id: Number(productId) });
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const cart = await Cart.findOne({ guestId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === dbProduct._id.toString()
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not in cart" }, { status: 404 });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return NextResponse.json({ 
      success: true,
      newQuantity: quantity
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}