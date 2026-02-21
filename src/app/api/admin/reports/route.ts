import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";

const orderSchema   = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });
const userSchema    = new mongoose.Schema({}, { strict: false });

const Order   = mongoose.models.Order   || mongoose.model("Order",   orderSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const User    = mongoose.models.User    || mongoose.model("User",     userSchema);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URL!, { dbName: "clerk-db" });
};

type Range = "7d" | "30d" | "90d" | "all";

function getRangeConfig(range: Range) {
  const now  = new Date();
  const from = new Date(now);

  if      (range === "7d")  from.setDate(now.getDate() - 7);
  else if (range === "30d") from.setDate(now.getDate() - 30);
  else if (range === "90d") from.setDate(now.getDate() - 90);
  else                      from.setFullYear(2000);

  // Wide ranges use monthly buckets; short ranges use daily buckets
  const wide = range === "90d" || range === "all";

  const bucketKey = (date: Date): string =>
    wide
      ? date.toLocaleString("default", { month: "short", year: "2-digit" })
      : date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short" });

  return { from, bucketKey };
}

export async function GET(req: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const rangeParam = (req.nextUrl.searchParams.get("range") ?? "30d") as Range;
    const { from, bucketKey } = getRangeConfig(rangeParam);

    const [orders, products, users] = await Promise.all([
      Order.find({}).sort({ createdAt: 1 }).lean(),
      Product.find({}).lean(),
      User.find({}).lean(),
    ]);

    const monthlyStats:    Record<string, { revenue: number; count: number }> = {};
    const statusStats:     Record<string, number> = {};
    const paymentStats:    Record<string, number> = {};
    const categoryStats:   Record<string, number> = {};
    const revenueByBucket: Record<string, { revenue: number; count: number }> = {};

    const productLookup = (products as any[]).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<number, any>);

    for (const order of orders as any[]) {
      const orderTotal = order.totalAmount || 0;
      const status     = order.status      || "Unknown";

      // Include cancelled in status counts for accurate operational reporting
      statusStats[status] = (statusStats[status] || 0) + 1;

      if (status === "Cancelled") continue;

      const method = order.paymentMethod || "COD";
      paymentStats[method] = (paymentStats[method] || 0) + 1;

      const date     = new Date(order.createdAt);
      const monthKey = date.toLocaleString("default", { month: "short", year: "2-digit" });

      if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { revenue: 0, count: 0 };
      monthlyStats[monthKey].revenue += orderTotal;
      monthlyStats[monthKey].count   += 1;

      if (date >= from) {
        const bKey = bucketKey(date);
        if (!revenueByBucket[bKey]) revenueByBucket[bKey] = { revenue: 0, count: 0 };
        revenueByBucket[bKey].revenue += orderTotal;
        revenueByBucket[bKey].count   += 1;
      }

      if (order.items) {
        for (const item of order.items) {
          const productRef = productLookup[item.productId];
          const category   = productRef?.category || "Uncategorised";
          const pRev       = item.price * (item.quantity || 1);
          categoryStats[category] = (categoryStats[category] || 0) + pRev;
        }
      }
    }

    const customerGrowthMap: Record<string, number> = {};

    for (const user of users as any[]) {
      const createdAt = user.createdAt ? new Date(user.createdAt) : null;
      if (!createdAt || createdAt < from) continue;
      const bKey = bucketKey(createdAt);
      customerGrowthMap[bKey] = (customerGrowthMap[bKey] || 0) + 1;
    }

    const monthlyTrend  = Object.entries(monthlyStats)
                            .map(([month, data]) => ({ month, ...data }));

    const topCategories = Object.entries(categoryStats)
                            .map(([name, value]) => ({ name, value }))
                            .sort((a, b) => b.value - a.value);

    // Array forms of the stats objects —> Chart.js on the frontend
    const revenueOverTime      = Object.entries(revenueByBucket).map(([label, data])      => ({ label, ...data }));
    const customerGrowth       = Object.entries(customerGrowthMap).map(([label, signups]) => ({ label, signups }));
    const orderStatusBreakdown = Object.entries(statusStats).map(([status, count])        => ({ status, count }));
    const paymentMethods       = Object.entries(paymentStats).map(([method, count])       => ({ method, count }));
    const salesByCategory      = topCategories.map(({ name, value })                      => ({ category: name, revenue: value }));

    return NextResponse.json({
      meta: { range: rangeParam, from: from.toISOString() },
      charts: {
        monthlyTrend,
        statusStats,
        paymentStats,
        revenueOverTime,
        customerGrowth,
        orderStatusBreakdown,
        paymentMethods,
        salesByCategory,
      },
      lists: {
        topCategories,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}