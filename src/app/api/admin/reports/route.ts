import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";

const orderSchema = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URL!, { dbName: "clerk-db" });
};

export async function GET() {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const [orders, products] = await Promise.all([
      Order.find({}).sort({ createdAt: 1 }).lean(), 
      Product.find({}).lean(),
    ]);

    const monthlyStats: Record<string, { revenue: number; count: number }> = {};
    const statusStats: Record<string, number> = {};
    const paymentStats: Record<string, number> = {};
    const categoryStats: Record<string, number> = {};

    const productLookup = (products as any[]).reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
    }, {} as Record<number, any>);

    for (const order of (orders as any[])) {
      const orderTotal = order.totalAmount || 0;
      const status = order.status || "Unknown";
      
      // Status Stats (Include cancelled here for accurate operational reporting)
      statusStats[status] = (statusStats[status] || 0) + 1;

      // Skip cancelled for revenue calculations
      if (status === "Cancelled") continue;

      // Payment Stats
      const method = order.paymentMethod || "COD";
      paymentStats[method] = (paymentStats[method] || 0) + 1;

      // Monthly Trend
      const date = new Date(order.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { revenue: 0, count: 0 };
      monthlyStats[monthKey].revenue += orderTotal;
      monthlyStats[monthKey].count += 1;

      // Category Stats
      if (order.items) {
          for (const item of order.items) {
              const productRef = productLookup[item.productId];
              const category = productRef?.category || "Uncategorised";
              const pRev = (item.price * (item.quantity || 1));
              categoryStats[category] = (categoryStats[category] || 0) + pRev;
          }
      }
    }

    const monthlyTrend = Object.entries(monthlyStats).map(([month, data]) => ({ month, ...data }));
    const topCategories = Object.entries(categoryStats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return NextResponse.json({
      charts: {
        monthlyTrend,
        statusStats,
        paymentStats
      },
      lists: {
        topCategories
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}