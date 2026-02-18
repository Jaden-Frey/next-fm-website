import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";

const orderSchema   = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });
const userSchema    = new mongoose.Schema({}, { strict: false });

const Order   = mongoose.models.Order   || mongoose.model("Order",   orderSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const User    = mongoose.models.User    || mongoose.model("User",    userSchema);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URL!, { dbName: "clerk-db" });
};

type Range = "7d" | "30d" | "90d" | "all";

function getRangeFrom(range: Range): Date {
  const d = new Date();
  if      (range === "7d")  d.setDate(d.getDate() - 7);
  else if (range === "30d") d.setDate(d.getDate() - 30);
  else if (range === "90d") d.setDate(d.getDate() - 90);
  else                      d.setFullYear(2000);
  return d;
}

function bucketKey(date: Date, range: Range): string {
  const wide = range === "90d" || range === "all";
  return wide
    ? date.toLocaleString("default", { month: "short", year: "2-digit" })
    : date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short" });
}

export async function GET(req: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const tab   = req.nextUrl.searchParams.get("tab")   ?? "overview";
    const range = (req.nextUrl.searchParams.get("range") ?? "30d") as Range;
    const from  = getRangeFrom(range);

    const [orders, products, users] = await Promise.all([
      Order.find({}).sort({ createdAt: 1 }).lean(),
      Product.find({}).lean(),
      User.find({}).lean(),
    ]);

    const productLookup = (products as any[]).reduce<Record<number, any>>((acc, p) => {
      acc[p.id] = p; return acc;
    }, {});

    const hasCostData = (products as any[]).some(p => p.cost != null && p.cost > 0);
    const customerMap:   Record<string, { name: string; email: string; city: string; totalSpent: number; orderCount: number; firstOrder: Date; lastOrder: Date }> = {};
    const productStats:  Record<string, { id: number; name: string; category: string; price: number; qtySold: number; revenue: number; orderCount: number }> = {};
    const categoryStats: Record<string, { revenue: number; qtySold: number }> = {};
    const statusStats:   Record<string, number> = {};
    const paymentStats:  Record<string, number> = {};
    const paymentRev:    Record<string, number> = {};
    const trendBuckets:  Record<string, { revenue: number; cogs: number; orders: number }> = {};
    const signupMap:     Record<string, number> = {};

    let totalRevenue   = 0;
    let totalCogs      = 0;
    let totalOrders    = 0;
    let cancelledCount = 0;

    const valueRanges = [
      { label: "R0–R100",   min: 0,    max: 100      },
      { label: "R100–R300", min: 100,  max: 300      },
      { label: "R300–R500", min: 300,  max: 500      },
      { label: "R500–R1k",  min: 500,  max: 1000     },
      { label: "R1k+",      min: 1000, max: Infinity },
    ];
    const orderValueDist: Record<string, number> = Object.fromEntries(
      valueRanges.map(r => [r.label, 0])
    );

    const priceBands = [
      { label: "Under R50",  min: 0,   max: 50       },
      { label: "R50–R150",   min: 50,  max: 150      },
      { label: "R150–R300",  min: 150, max: 300      },
      { label: "R300–R500",  min: 300, max: 500      },
      { label: "R500+",      min: 500, max: Infinity },
    ];
    const priceBandSales: Record<string, { revenue: number; qty: number }> = Object.fromEntries(
      priceBands.map(b => [b.label, { revenue: 0, qty: 0 }])
    );

    for (const order of orders as any[]) {
      const status     = order.status || "Pending";
      const orderTotal = order.totalAmount || 0;
      const date       = new Date(order.createdAt);

      statusStats[status] = (statusStats[status] || 0) + 1;

      if (status === "Cancelled") { cancelledCount++; continue; }

      totalRevenue += orderTotal;
      totalOrders  += 1;

      const method = order.paymentMethod || "Cash on Delivery";
      paymentStats[method] = (paymentStats[method] || 0) + 1;
      paymentRev[method]   = (paymentRev[method]   || 0) + orderTotal;

      const bracket = valueRanges.find(r => orderTotal >= r.min && orderTotal < r.max);
      if (bracket) orderValueDist[bracket.label]++;

      const email = order.customerDetails?.email;
      const name  = order.customerDetails?.name || "Guest";
      const city  = order.customerDetails?.city || "Unknown";
      if (email) {
        if (!customerMap[email]) {
          customerMap[email] = { name, email, city, totalSpent: 0, orderCount: 0, firstOrder: date, lastOrder: date };
        }
        customerMap[email].totalSpent  += orderTotal;
        customerMap[email].orderCount  += 1;
        if (date < customerMap[email].firstOrder) customerMap[email].firstOrder = date;
        if (date > customerMap[email].lastOrder)  customerMap[email].lastOrder  = date;
      }

      if (date >= from) {
        const key = bucketKey(date, range);
        if (!trendBuckets[key]) trendBuckets[key] = { revenue: 0, cogs: 0, orders: 0 };
        trendBuckets[key].revenue += orderTotal;
        trendBuckets[key].orders  += 1;

        if (order.items && hasCostData) {
          for (const item of order.items) {
            const unitCost = productLookup[item.productId]?.cost ?? 0;
            const lineCogs = unitCost * (item.quantity || 1);
            trendBuckets[key].cogs += lineCogs;
            totalCogs              += lineCogs;
          }
        }

        if (order.items) {
          for (const item of order.items) {
            const ref  = productLookup[item.productId];
            const cat  = ref?.category || "Uncategorised";
            const qty  = item.quantity || 1;
            const rev  = item.price * qty;
            const pKey = `${item.productId}`;

            if (!productStats[pKey]) {
              productStats[pKey] = { id: item.productId, name: item.name, category: cat, price: item.price, qtySold: 0, revenue: 0, orderCount: 0 };
            }
            productStats[pKey].qtySold    += qty;
            productStats[pKey].revenue    += rev;
            productStats[pKey].orderCount += 1;

            if (!categoryStats[cat]) categoryStats[cat] = { revenue: 0, qtySold: 0 };
            categoryStats[cat].revenue += rev;
            categoryStats[cat].qtySold += qty;

            const band = priceBands.find(b => item.price >= b.min && item.price < b.max);
            if (band) {
              priceBandSales[band.label].revenue += rev;
              priceBandSales[band.label].qty     += qty;
            }
          }
        }
      }
    }

    for (const user of users as any[]) {
      const createdAt = user.createdAt ? new Date(user.createdAt) : null;
      if (!createdAt || createdAt < from) continue;
      const key = bucketKey(createdAt, range);
      signupMap[key] = (signupMap[key] || 0) + 1;
    }

    const allCustomers  = Object.values(customerMap);
    const productList   = Object.values(productStats);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingOrders = (statusStats["Pending"] || 0) + (statusStats["Processing"] || 0);
    const grossProfit   = hasCostData ? totalRevenue - totalCogs : null;
    const grossMargin   = hasCostData && totalRevenue > 0
      ? Number(((grossProfit! / totalRevenue) * 100).toFixed(1))
      : null;

    const freqSegs: Record<string, number> = { "1 order": 0, "2–3 orders": 0, "4–6 orders": 0, "7+ orders": 0 };
    const segSpend: Record<string, number> = { "1 order": 0, "2–3 orders": 0, "4–6 orders": 0, "7+ orders": 0 };
    for (const c of allCustomers) {
      const seg = c.orderCount === 1 ? "1 order" : c.orderCount <= 3 ? "2–3 orders" : c.orderCount <= 6 ? "4–6 orders" : "7+ orders";
      freqSegs[seg]++;
      segSpend[seg] += c.totalSpent;
    }
    const avgSpendBySeg = Object.fromEntries(
      Object.keys(freqSegs).map(k => [k, freqSegs[k] > 0 ? segSpend[k] / freqSegs[k] : 0])
    );

    const topProducts  = [...productList].sort((a, b) => b.revenue    - a.revenue).slice(0, 10);
    const topCustomers = [...allCustomers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10)
      .map(c => ({
        ...c,
        avgOrder:      c.totalSpent / c.orderCount,
        daysSinceLast: Math.floor((Date.now() - new Date(c.lastOrder).getTime()) / 86400000),
      }));

    const newCustomersInRange       = allCustomers.filter(c => new Date(c.firstOrder) >= from).length;
    const returningCustomersInRange = allCustomers.filter(c => new Date(c.firstOrder) < from && new Date(c.lastOrder) >= from).length;
    const cityAccumulator = allCustomers.reduce<Record<string, { count: number; revenue: number }>>((acc, c) => {
      const k = (!c.city || c.city === "N/A" || c.city === "n/a") ? "Unspecified" : c.city;
      if (!acc[k]) acc[k] = { count: 0, revenue: 0 };
      acc[k].count   += c.orderCount;
      acc[k].revenue += c.totalSpent;
      return acc;
    }, {});

    return NextResponse.json({
      meta: { range, tab, hasCostData },

      overview: {
        kpis: { totalRevenue, avgOrderValue, pendingOrders, totalOrders: orders.length },
        topProducts:  [...productList].sort((a, b) => b.qtySold - a.qtySold).slice(0, 5),
        topCustomers: topCustomers.slice(0, 5),
      },

      financial: {
        summary: { totalRevenue, totalCogs: hasCostData ? totalCogs : null, grossProfit, grossMargin, totalOrders, cancelledCount, avgOrderValue },
        trend: Object.entries(trendBuckets).map(([label, d]) => ({
          label,
          revenue: d.revenue,
          cogs:    hasCostData ? d.cogs             : null,
          profit:  hasCostData ? d.revenue - d.cogs : null,
          orders:  d.orders,
        })),
        paymentRevenue: Object.entries(paymentRev).map(([method, revenue]) => ({ method, revenue })),
        orderValueDist: Object.entries(orderValueDist).map(([label, count]) => ({ label, count })),
      },

      products: {
        summary: {
          totalProducts:   products.length,
          totalCategories: Object.keys(categoryStats).length,
          topProduct:      topProducts[0]?.name ?? null,
          topCategory:     Object.entries(categoryStats).sort((a, b) => b[1].revenue - a[1].revenue)[0]?.[0] ?? null,
        },
        topByRevenue: topProducts,
        topByQty:     [...productList].sort((a, b) => b.qtySold - a.qtySold).slice(0, 10),
        categoryPerformance: Object.entries(categoryStats)
          .map(([name, d]) => ({ name, revenue: d.revenue, qtySold: d.qtySold }))
          .sort((a, b) => b.revenue - a.revenue),
        priceBandSales: Object.entries(priceBandSales)
          .map(([label, d]) => ({ label, revenue: d.revenue, qty: d.qty })),
      },

      customers: {
        summary: { totalCustomers: allCustomers.length, totalRegisteredUsers: users.length, avgLifetimeValue: allCustomers.length > 0 ? totalRevenue / allCustomers.length : 0, newCustomersInRange, returningCustomersInRange },
        topCustomers,
        signupTrend:       Object.entries(signupMap).map(([label, count]) => ({ label, count })),
        cityBreakdown:     Object.entries(cityAccumulator)
          .map(([city, d]) => ({ city, count: d.count, revenue: d.revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10),
        frequencySegments: Object.entries(freqSegs).map(([label, count]) => ({ label, count })),
        avgSpendBySegment: Object.entries(avgSpendBySeg).map(([label, avg]) => ({ label, avg })),
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}