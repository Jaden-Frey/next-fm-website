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
    
    let query = {};
    if (userId) {
      query = { userId };
    } else if (guestId) {
      query = { guestId };
    } else {
      return NextResponse.json({ items: [], total: 0 });
    }

    const cart = await Cart.findOne(query).populate({
      path: 'items.productId',
      model: 'Product'
    });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ items: [], total: 0 });
    }
    
    // Filter out items where the product was deleted from DB
    const validItems = cart.items.filter((item: any) => item.productId !== null);

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const formattedItems = validItems.map((item: any) => ({
      // Prioritize saved item details, fallback to product DB details
      id: item.productId.id,
      name: item.name || item.productId.name,
      price: item.price || item.productId.price,
      image: item.image || item.productId.image,
      quantity: item.quantity,
      cartItemId: item._id
    }));

    return NextResponse.json({ 
      items: formattedItems,
      total: cart.totalAmount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();
    const { productId, quantity = 1 } = await req.json(); 
    const guestId = req.headers.get("x-guest-id");

    if (!userId && !guestId) {
      return NextResponse.json({ error: "Missing user identification" }, { status: 400 });
    }

    const dbProduct = await Product.findOne({ id: Number(productId) });
    
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const mongoId = dbProduct._id;
    
    // Determine which cart to find
    let query = userId ? { userId } : { guestId };
    let cart = await Cart.findOne(query);
    
    if (!cart) {
      // Create new cart with appropriate ID
      cart = new Cart({ 
        ...query,
        items: [] 
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === mongoId.toString()
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Push complete item details
      cart.items.push({ 
        productId: mongoId, 
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.image,
        quantity 
      });
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

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
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const guestId = req.headers.get("x-guest-id");

    if (!productId) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const dbProduct = await Product.findOne({ id: Number(productId) });
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query);

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== dbProduct._id.toString()
    );

    cart.totalAmount = cart.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

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
    const { userId } = await auth();
    const { productId, quantity } = await req.json();
    const guestId = req.headers.get("x-guest-id");

    if (quantity === undefined) {
      return NextResponse.json({ error: "Missing quantity" }, { status: 400 });
    }

    const dbProduct = await Product.findOne({ id: Number(productId) });
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query);

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
    cart.totalAmount = cart.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    await cart.save();

    return NextResponse.json({ 
      success: true,
      newQuantity: quantity
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}