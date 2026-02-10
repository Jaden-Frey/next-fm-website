import { NextResponse } from 'next/server';
import { connect } from '../../../lib/mongodb';
import Product from '../../../lib/models/product';

export async function GET() {
  try {
    await connect();
    const products = await Product.find({}).sort({ id: 1 }).lean();
    return NextResponse.json(products);
  } catch (err) {
    console.error('GET /api/products error', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
