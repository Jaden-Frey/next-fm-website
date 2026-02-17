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
    if (sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [orders, products] = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }).lean(),
      Product.find({}).lean(),
    ]);

    // Calculate Dashboard Metrics
    let totalRevenue = 0;
    let totalDiscounts = 0;
    let completedOrdersCount = 0;
    const customerMap: Record<string, any> = {};
    const productStats: Record<string, any> = {};

    // Create a lookup for products to get category/original price
    const productLookup = (products as any[]).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<number, any>);

    for (const order of (orders as any[])) {
      const isCancelled = order.status === "Cancelled";
      const orderTotal = order.totalAmount || 0;

      if (isCancelled) continue;

      totalRevenue += orderTotal;
      completedOrdersCount++;

      // Customer Spending
      const email = order.customerDetails?.email;
      const name = order.customerDetails?.name || "Guest";
      if (email) {
        if (!customerMap[email]) customerMap[email] = { name, email, count: 0, spent: 0 };
        customerMap[email].count += 1;
        customerMap[email].spent += orderTotal;
      }

      // Product Sales
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const pName = item.name;
          const pQty = item.quantity || 1;
          const pRev = (item.price * pQty);
          
          const productRef = productLookup[item.productId];
          const category = productRef?.category || "Uncategorised";

          if (!productStats[pName]) productStats[pName] = { name: pName, category, qty: 0, revenue: 0 };
          productStats[pName].qty += pQty;
          productStats[pName].revenue += pRev;

          // Discounts
           if (productRef?.onSale && productRef?.originalPrice) {
            const discountPerUnit = productRef.originalPrice - item.price;
            if (discountPerUnit > 0) totalDiscounts += (discountPerUnit * pQty);
          }
        }
      }
    }

    // Sort and Slice Lists
    const topProducts = Object.values(productStats).sort((a:any, b:any) => b.qty - a.qty).slice(0, 5);
    const topCustomers = Object.values(customerMap).sort((a:any, b:any) => b.spent - a.spent).slice(0, 5);

    return NextResponse.json({
      financial: {
        totalRevenue,
        totalOrders: orders.length,
        activeOrders: completedOrdersCount,
        avgOrderValue: completedOrdersCount ? totalRevenue / completedOrdersCount : 0,
        totalDiscounts,
      },
      lists: {
        topProducts,
        topCustomers
      }
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}