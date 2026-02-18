import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "../../../lib/models/product";
import { auth } from "@clerk/nextjs/server";

const DESIRED_DB = "clerk-db";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const currentDb = mongoose.connection.db?.databaseName;
      if (currentDb === DESIRED_DB) return;
      await mongoose.disconnect();
    }
    await mongoose.connect(process.env.MONGODB_URL!, { dbName: DESIRED_DB });
  } catch (err) {
    console.error("connectDB error:", err);
    throw err;
  }
};

const isValidObjectId = (id?: string) => {
  if (!id) return false;
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id
  );
};

export async function GET(req: Request) {
  try {
    await connectDB();

    // Check role so cost is only returned to admins
    const { sessionClaims } = await auth();
    const isAdmin = sessionClaims?.metadata?.role === "admin";
    const costProjection: any = isAdmin ? {} : { cost: 0 };

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      let product = null;
      if (isValidObjectId(id)) {
        product = await Product.findById(id).select(costProjection);
      } else {
        product = await Product.findOne({ id: Number(id) }).select(costProjection);
      }

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    const products = await Product.find({}).select(costProjection).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth(); 
    const body = await req.json();

    const lastProduct = await Product.findOne().sort({ id: -1 });
    const nextId = lastProduct && lastProduct.id ? lastProduct.id + 1 : 1;

    const newProduct = await Product.create({
      ...body,
      id: nextId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(newProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");

    if (category) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const normalized = category.toLowerCase().trim();
      const res = await Product.deleteMany({ category: normalized });
      return NextResponse.json({ success: true, deletedCount: res.deletedCount || 0 });
    }

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (isValidObjectId(id)) {
      await Product.findByIdAndDelete(id);
    } else {
      await Product.findOneAndDelete({ id: Number(id) });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}