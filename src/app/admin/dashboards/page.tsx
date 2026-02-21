'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

type Tab   = 'overview' | 'financial' | 'products' | 'customers';
type Range = '7d' | '30d' | '90d' | 'all';
type PView = 'revenue' | 'qty';

const T = {
  bg: '#f8fafc', surface: '#ffffff', border: '#e2e8f0',
  text: '#0f172a', muted: '#64748b',
  blue: '#2563eb', green: '#059669', amber: '#d97706',
  red: '#dc2626', purple: '#7c3aed', sky: '#0891b2',
  orange: '#ea580c', teal: '#0d9488', pink: '#db2777',
};

const MULTI = [T.blue, T.teal, T.purple, T.orange, T.pink, T.green, T.amber, T.red];

const formatR  = (v: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(v);
const formatRc = (v: number | string) =>
  typeof v === 'number'
    ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', notation: 'compact' }).format(v)
    : v;

ChartJS.defaults.font.family = "'DM Sans', sans-serif";
ChartJS.defaults.color       = T.muted;

const tip = {
  backgroundColor: T.text, titleColor: '#f1f5f9', bodyColor: '#94a3b8',
  padding: 12, cornerRadius: 8, borderColor: T.border, borderWidth: 1, boxPadding: 4,
};

const xAxis = { grid: { display: false }, border: { display: false }, ticks: { color: T.muted, font: { size: 11 } } };
const yAxis = { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { color: T.muted, font: { size: 11 } } };

const lineOpts: any = {
  responsive: true, maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: { legend: { labels: { color: T.muted, boxWidth: 10, padding: 16, font: { size: 12 } } }, tooltip: tip },
  scales: { x: xAxis, y: { ...yAxis, beginAtZero: true, ticks: { ...yAxis.ticks, callback: formatRc } } },
};
const barOpts: any = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: tip },
  scales: { x: xAxis, y: { ...yAxis, beginAtZero: true, ticks: { ...yAxis.ticks, callback: formatRc } } },
};
const hBarOpts: any = {
  ...barOpts, indexAxis: 'y' as const,
  scales: {
    x: { ...xAxis, ticks: { ...xAxis.ticks, callback: formatRc } },
    y: { ...yAxis, grid: { display: false } },
  },
};

const countBarOpts: any = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: tip },
  scales: {
    x: xAxis,
    y: { ...yAxis, beginAtZero: true, ticks: { ...yAxis.ticks, stepSize: 1, precision: 0 } },
  },
};
const countLineOpts: any = {
  ...lineOpts,
  plugins: { ...lineOpts.plugins, legend: { display: false } },
  scales: {
    x: xAxis,
    y: { ...yAxis, beginAtZero: true, ticks: { ...yAxis.ticks, stepSize: 1, precision: 0 } },
  },
};

const arcOpts: any = {
  responsive: true, maintainAspectRatio: false, cutout: '65%',
  plugins: { legend: { position: 'bottom', labels: { color: T.muted, boxWidth: 10, padding: 14, font: { size: 12 } } }, tooltip: tip },
};
const pieOpts: any = { ...arcOpts, cutout: '60%' };

function Empty() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.muted, gap: 8, fontSize: '0.875rem' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      No data for this period
    </div>
  );
}

function Card({ title, badge, badgeColor, headerRight, children, bodyHeight = 280 }: {
  title: React.ReactNode; badge?: string; badgeColor?: string;
  headerRight?: React.ReactNode; children: React.ReactNode; bodyHeight?: number | string;
}) {
  const bc = badgeColor ?? T.blue;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: T.text }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {headerRight}
          {badge && (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${bc}18`, color: bc, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {badge}
            </span>
          )}
        </div>
      </div>
      <div style={{ padding: 20, flex: 1, height: bodyHeight }}>{children}</div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent, wide = false }: {
  label: string; value: string | number; sub?: string; accent: string; wide?: boolean;
}) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderTop: `3px solid ${accent}`, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontSize: '0.7rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: wide || String(value).length > 12 ? '1.1rem' : '1.6rem', fontWeight: 700, color: T.text, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function Grid({ cols, children, gap = 16, className }: {
  cols: string; children: React.ReactNode; gap?: number; className?: string;
}) {
  return (
    <div className={className} style={{ display: 'grid', gridTemplateColumns: cols, gap, marginBottom: gap }}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [range,     setRange]     = useState<Range>('30d');
  const [data,      setData]      = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [pView,     setPView]     = useState<PView>('revenue');

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/dashboards?tab=${activeTab}&range=${range}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeTab, range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',  label: 'Overview',  icon: '⊞' },
    { id: 'financial', label: 'Financial', icon: '↑' },
    { id: 'products',  label: 'Products',  icon: '□' },
    { id: 'customers', label: 'Customers', icon: '◎' },
  ];
  const RANGES: { v: Range; l: string }[] = [
    { v: '7d', l: '7 Days' }, { v: '30d', l: '30 Days' },
    { v: '90d', l: '90 Days' }, { v: 'all', l: 'All Time' },
  ];

  const showRange = activeTab !== 'overview';
  const ov  = data?.overview;
  const fin = data?.financial;
  const prd = data?.products;
  const cst = data?.customers;
  const hcd = data?.meta?.hasCostData;

  const topList = pView === 'revenue' ? prd?.topByRevenue : prd?.topByQty;

  const productToggle = (
    <div className="db-tog">
      <button className={pView === 'revenue' ? 'on' : ''} onClick={() => setPView('revenue')}>Revenue</button>
      <button className={pView === 'qty'     ? 'on' : ''} onClick={() => setPView('qty')}>Units</button>
    </div>
  );



  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .db-wrap  { background:${T.bg}; min-height:100vh; padding:28px 32px 64px; font-family:'DM Sans',sans-serif; color:${T.text}; }
        .db-tab   { padding:8px 18px; border-radius:9px; border:none; cursor:pointer; font-size:0.875rem; font-weight:500; transition:all 0.15s; display:flex; align-items:center; gap:7px; background:transparent; color:${T.muted}; font-family:'DM Sans',sans-serif; }
        .db-tab:hover { color:${T.text}; background:#f1f5f9; }
        .db-tab.on { background:${T.surface}; color:${T.text}; font-weight:600; box-shadow:0 1px 3px rgba(0,0,0,0.08),0 0 0 1px ${T.border}; }
        .db-rng   { padding:6px 13px; border-radius:8px; font-size:0.8rem; font-weight:500; cursor:pointer; border:1.5px solid ${T.border}; background:transparent; color:${T.muted}; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
        .db-rng.on { background:${T.blue}; color:#fff; border-color:${T.blue}; }
        .db-tog   { display:flex; background:#f1f5f9; border-radius:8px; padding:3px; gap:2px; }
        .db-tog button { padding:5px 12px; border-radius:6px; border:none; cursor:pointer; font-size:0.8rem; font-weight:500; transition:all 0.15s; background:transparent; color:${T.muted}; font-family:'DM Sans',sans-serif; }
        .db-tog button.on { background:${T.surface}; color:${T.text}; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
        .db-notice { background:#fffbeb; border:1px solid #fde68a; color:#92400e; border-radius:10px; padding:10px 16px; font-size:0.8rem; margin-bottom:20px; }
        .db-table { width:100%; border-collapse:collapse; font-size:0.875rem; }
        .db-table thead tr { border-bottom:2px solid ${T.border}; }
        .db-table th { padding:9px 12px; font-weight:600; color:${T.muted}; text-align:left; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.06em; }
        .db-table td { padding:10px 12px; border-bottom:1px solid ${T.border}; }
        .db-table tbody tr:last-child td { border-bottom:none; }
        .db-table tbody tr:hover td { background:${T.bg}; }
        .db-bar   { height:5px; border-radius:3px; background:${T.border}; overflow:hidden; margin-top:5px; }
        .db-bar-f { height:100%; border-radius:3px; }
        .db-avatar { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.7rem; color:#fff; flex-shrink:0; }
        @media (max-width:960px) {
          .r-g4 { grid-template-columns:repeat(2,1fr) !important; }
          .r-g2,.r-g2a,.r-g2b,.r-g2c { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div className="db-wrap">

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.7rem', color: T.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Admin</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 11 }}>
            {TABS.map(t => (
              <button key={t.id} className={`db-tab${activeTab === t.id ? ' on' : ''}`} onClick={() => setActiveTab(t.id)}>
                <span style={{ fontSize: '0.9rem' }}>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          {showRange && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {RANGES.map(({ v, l }) => (
                <button key={v} className={`db-rng${range === v ? ' on' : ''}`} onClick={() => setRange(v)}>
                  {v !== 'all' ? `Last ${l}` : l}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
            <div className="spinner-border" style={{ color: T.blue }} role="status" />
          </div>
        )}

        {!loading && activeTab === 'overview' && ov && (
          <>
            <Grid cols="repeat(4,1fr)" gap={16} className="r-g4">
              <KpiCard label="Total Revenue"   value={formatR(ov.kpis.totalRevenue)}  sub={`${ov.kpis.totalOrders} total orders`} accent={T.blue}  />
              <KpiCard label="Avg Order Value" value={formatR(ov.kpis.avgOrderValue)} accent={T.green}  />
              <KpiCard label="Pending Orders"  value={ov.kpis.pendingOrders}          sub="Needs attention"                       accent={T.amber} />
              <KpiCard label="Total Orders"    value={ov.kpis.totalOrders}            sub="all-time"                              accent={T.text}  />
            </Grid>
            <Grid cols="1fr 1fr" gap={20} className="r-g2">
              <Card title="Top Selling Products" badge="By Units" badgeColor={T.blue} bodyHeight={320}>
                <div style={{ overflowY: 'auto', height: '100%' }}>
                  <table className="db-table">
                    <thead><tr><th>Product</th><th style={{ textAlign: 'center' }}>Sold</th><th style={{ textAlign: 'right' }}>Revenue</th></tr></thead>
                    <tbody>
                      {ov.topProducts?.length
                        ? ov.topProducts.map((p: any, i: number) => (
                            <tr key={i}>
                              <td><div style={{ fontWeight: 500 }}>{p.name}</div><div style={{ fontSize: '0.75rem', color: T.muted }}>{p.category}</div></td>
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.qtySold}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatR(p.revenue)}</td>
                            </tr>
                          ))
                        : <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24, color: T.muted }}>No data</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card title="VIP Customers" badge="By Spend" badgeColor={T.purple} bodyHeight={320}>
                <div style={{ overflowY: 'auto', height: '100%' }}>
                  <table className="db-table">
                    <thead><tr><th>Customer</th><th style={{ textAlign: 'center' }}>Orders</th><th style={{ textAlign: 'right' }}>Spent</th></tr></thead>
                    <tbody>
                      {ov.topCustomers?.length
                        ? ov.topCustomers.map((c: any, i: number) => (
                            <tr key={i}>
                              <td><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: '0.75rem', color: T.muted }}>{c.email}</div></td>
                              <td style={{ textAlign: 'center' }}>{c.orderCount}</td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: T.green }}>{formatR(c.totalSpent)}</td>
                            </tr>
                          ))
                        : <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24, color: T.muted }}>No data</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Grid>
          </>
        )}

        {!loading && activeTab === 'financial' && fin && (
          <>
            {!hcd && (
              <div className="db-notice">
                ⚠ Add a <code>cost</code> field to your products to unlock COGS, gross profit &amp; margin metrics.
              </div>
            )}
            <Grid cols="repeat(4,1fr)" gap={16} className="r-g4">
              <KpiCard label="Total Revenue"    value={formatR(fin.summary.totalRevenue)}  sub={`${fin.summary.totalOrders} orders`} accent={T.blue}   />
              <KpiCard label="Avg Order Value"  value={formatR(fin.summary.avgOrderValue)} accent={T.green}  />
              <KpiCard label="Gross Profit"     value={hcd && fin.summary.grossProfit != null ? formatR(fin.summary.grossProfit) : 'Add cost data'} accent={T.purple} />
              <KpiCard label="Gross Margin"     value={hcd && fin.summary.grossMargin != null ? `${fin.summary.grossMargin}%` : '—'} sub={hcd && fin.summary.grossMargin != null ? (fin.summary.grossMargin > 40 ? '✓ Healthy' : '↓ Below 40%') : undefined} accent={T.teal} />
            </Grid>

            <div style={{ marginBottom: 20 }}>
              <Card title={`Revenue${hcd ? ' · COGS · Gross Profit' : ''} Trend`} badge="Line" badgeColor={T.blue} bodyHeight={280}>
                {fin.trend?.length
                  ? <Line data={{
                      labels: fin.trend.map((t: any) => t.label),
                      datasets: [
                        { label: 'Revenue',      data: fin.trend.map((t: any) => t.revenue), borderColor: T.blue,  backgroundColor: `${T.blue}18`,  fill: false, tension: 0.4, pointRadius: 3, borderWidth: 2.5 },
                        ...(hcd ? [
                          { label: 'COGS',         data: fin.trend.map((t: any) => t.cogs),   borderColor: T.red,   backgroundColor: `${T.red}18`,   fill: false, tension: 0.4, pointRadius: 3, borderWidth: 2.5 },
                          { label: 'Gross Profit', data: fin.trend.map((t: any) => t.profit), borderColor: T.green, backgroundColor: `${T.green}18`, fill: true,  tension: 0.4, pointRadius: 3, borderWidth: 2.5 },
                        ] : []),
                      ],
                    }} options={lineOpts} />
                  : <Empty />}
              </Card>
            </div>

            <Grid cols="1fr 1fr" gap={20} className="r-g2a">
              <Card title="Orders Over Time" badge="Count" badgeColor={T.green} bodyHeight={260}>
                {fin.trend?.length
                  ? <Line data={{
                      labels: fin.trend.map((t: any) => t.label),
                      datasets: [{
                        label: 'Orders',
                        data:  fin.trend.map((t: any) => t.orders),
                        borderColor: T.green, backgroundColor: `${T.green}18`,
                        fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2.5,
                      }],
                    }} options={countLineOpts} />
                  : <Empty />}
              </Card>

              {/* Revenue by payment method */}
              <Card title="Revenue by Payment Method" badge="Doughnut" badgeColor={T.sky} bodyHeight={260}>
                {fin.paymentRevenue?.length
                  ? <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                      <div style={{ width: '100%', maxWidth: 260, height: 240 }}>
                        <Doughnut
                          data={{ labels: fin.paymentRevenue.map((p: any) => p.method), datasets: [{ data: fin.paymentRevenue.map((p: any) => p.revenue), backgroundColor: MULTI, borderWidth: 2, borderColor: T.surface, hoverOffset: 8 }] }}
                          options={arcOpts}
                        />
                      </div>
                    </div>
                  : <Empty />}
              </Card>
            </Grid>

            <Card title="Order Value Distribution" badge="How many orders fall into each value bracket" badgeColor={T.purple} bodyHeight={260}>
              {fin.orderValueDist?.some((d: any) => d.count > 0)
                ? <Bar
                    data={{ labels: fin.orderValueDist.map((d: any) => d.label), datasets: [{ label: 'Orders', data: fin.orderValueDist.map((d: any) => d.count), backgroundColor: MULTI.map(c => `${c}99`), hoverBackgroundColor: MULTI, borderRadius: 6, borderWidth: 0 }] }}
                    options={countBarOpts}
                  />
                : <Empty />}
            </Card>
          </>
        )}

        {!loading && activeTab === 'products' && prd && (
          <>
            <Grid cols="repeat(4,1fr)" gap={16} className="r-g4">
              <KpiCard label="Total Products"  value={prd.summary.totalProducts}        sub="in catalogue"  accent={T.orange} />
              <KpiCard label="Categories"      value={prd.summary.totalCategories}      sub="active"        accent={T.green}  />
              <KpiCard label="Top Product"     value={prd.summary.topProduct  ?? '—'}   sub="by units sold" accent={T.blue}   wide />
              <KpiCard label="Top Category"    value={prd.summary.topCategory ?? '—'}   sub="by revenue"    accent={T.purple} wide />
            </Grid>

            <div style={{ marginBottom: 20 }}>
              <Card title="Top Products" headerRight={productToggle} bodyHeight={360}>
                {topList?.length
                  ? <Bar
                      data={{
                        labels:   topList.map((p: any) => p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name),
                        datasets: [{
                          label:                pView === 'revenue' ? 'Revenue' : 'Units Sold',
                          data:                 topList.map((p: any) => pView === 'revenue' ? p.revenue : p.qtySold),
                          backgroundColor:      MULTI.map(c => `${c}cc`),
                          hoverBackgroundColor: MULTI,
                          borderRadius: 6, borderWidth: 0,
                        }],
                      }}
                      options={pView === 'revenue' ? hBarOpts : { ...hBarOpts, scales: { ...hBarOpts.scales, x: { ...xAxis, ticks: { ...xAxis.ticks, stepSize: 1, precision: 0 } } } }}
                    />
                  : <Empty />}
              </Card>
            </div>

            <Grid cols="1fr 1fr" gap={20} className="r-g2b">
              <Card title="Revenue by Category" badge="Doughnut" badgeColor={T.orange} bodyHeight={300}>
                {prd.categoryPerformance?.length
                  ? <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                      <div style={{ width: '100%', maxWidth: 280, height: 280 }}>
                        <Doughnut
                          data={{ labels: prd.categoryPerformance.map((c: any) => c.name), datasets: [{ data: prd.categoryPerformance.map((c: any) => c.revenue), backgroundColor: MULTI, borderWidth: 2, borderColor: T.surface, hoverOffset: 8 }] }}
                          options={pieOpts}
                        />
                      </div>
                    </div>
                  : <Empty />}
              </Card>

              <Card title="Category Performance" bodyHeight={300}>
                <div style={{ overflowY: 'auto', height: '100%' }}>
                  <table className="db-table">
                    <thead><tr><th>Category</th><th style={{ textAlign: 'right' }}>Revenue</th><th style={{ textAlign: 'right' }}>Units</th></tr></thead>
                    <tbody>
                      {prd.categoryPerformance?.length ? (() => {
                        const maxR = Math.max(...prd.categoryPerformance.map((c: any) => c.revenue));
                        return prd.categoryPerformance.map((c: any, i: number) => (
                          <tr key={i}>
                            <td>
                              <div style={{ fontWeight: 500 }}>{c.name}</div>
                              <div className="db-bar"><div className="db-bar-f" style={{ width: `${(c.revenue / maxR) * 100}%`, background: MULTI[i % MULTI.length] }} /></div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatR(c.revenue)}</td>
                            <td style={{ textAlign: 'right', color: T.muted }}>{c.qtySold}</td>
                          </tr>
                        ));
                      })() : <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24, color: T.muted }}>No data</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Grid>

            <Card title="Product Detail Breakdown" bodyHeight="auto">
              <div style={{ overflowX: 'auto' }}>
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'center' }}>Units Sold</th>
                      <th style={{ textAlign: 'right' }}>Revenue</th>
                      <th style={{ textAlign: 'center' }}>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prd.topByRevenue?.length
                      ? prd.topByRevenue.map((p: any, i: number) => (
                          <tr key={i}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: MULTI[i % MULTI.length], flexShrink: 0 }} />
                                <span style={{ fontWeight: 500 }}>{p.name}</span>
                              </div>
                            </td>
                            <td style={{ color: T.muted, fontSize: '0.875rem' }}>{p.category}</td>
                            <td style={{ textAlign: 'right' }}>{formatR(p.price)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.qtySold}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: T.green }}>{formatR(p.revenue)}</td>
                            <td style={{ textAlign: 'center', color: T.muted }}>{p.orderCount}</td>
                          </tr>
                        ))
                      : <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: T.muted }}>No data</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {!loading && activeTab === 'customers' && cst && (
          <>
            <Grid cols="repeat(4,1fr)" gap={16} className="r-g4">
              <KpiCard label="Total Customers"    value={cst.summary.totalCustomers}            sub={`${cst.summary.totalRegisteredUsers} registered`} accent={T.purple} />
              <KpiCard label="Avg Customer Spend" value={formatR(cst.summary.avgCustomerSpend)} sub="avg total per buyer"                            accent={T.green}  />
              <KpiCard label="New This Period"    value={cst.summary.newCustomersInRange}       sub="first-time buyers"                                accent={T.sky}    />
              <KpiCard label="Returning"          value={cst.summary.returningCustomersInRange} sub="repeat buyers"                                    accent={T.amber}  />
            </Grid>

            <Grid cols="1fr 1fr" gap={20} className="r-g2c">
              <Card title="New Customer Signups" badge="Over Time" badgeColor={T.purple} bodyHeight={260}>
                {cst.signupTrend?.length
                  ? <Line data={{
                      labels: cst.signupTrend.map((s: any) => s.label),
                      datasets: [{
                        label: 'Signups',
                        data:  cst.signupTrend.map((s: any) => s.count),
                        borderColor: T.purple, backgroundColor: `${T.purple}18`,
                        fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2.5,
                      }],
                    }} options={countLineOpts} />
                  : <Empty />}
              </Card>

              <Card title="Orders by Payment Method" badge="How customers pay" badgeColor={T.sky} bodyHeight={260}>
                {cst.paymentBreakdown?.length
                  ? <Bar data={{
                      labels:   cst.paymentBreakdown.map((p: any) => p.method),
                      datasets: [{
                        label: 'Orders',
                        data:  cst.paymentBreakdown.map((p: any) => p.count),
                        backgroundColor: [T.sky, T.purple, T.teal].map(c => `${c}99`),
                        hoverBackgroundColor: [T.sky, T.purple, T.teal],
                        borderRadius: 8, borderWidth: 0,
                      }],
                    }} options={countBarOpts} />
                  : <Empty />}
              </Card>
            </Grid>

            <Grid cols="1fr 1.6fr" gap={20} className="r-g2c">
              <Card title="Orders by Status" badge="All Time" badgeColor={T.orange} bodyHeight={280}>
                {cst.orderStatusBreakdown?.length
                  ? <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                      <div style={{ width: '100%', maxWidth: 260, height: 260 }}>
                        <Doughnut
                          data={{
                            labels:   cst.orderStatusBreakdown.map((s: any) => s.status),
                            datasets: [{
                              data:            cst.orderStatusBreakdown.map((s: any) => s.count),
                              backgroundColor: [T.green, T.sky, T.amber, T.red, T.purple],
                              borderWidth: 2, borderColor: T.surface, hoverOffset: 8,
                            }],
                          }}
                          options={arcOpts}
                        />
                      </div>
                    </div>
                  : <Empty />}
              </Card>

              <Card title="Customer Overview" badge="Quick Stats" badgeColor={T.green} bodyHeight={280}>
                <div style={{ overflowY: 'auto', height: '100%' }}>
                  <table className="db-table">
                    <thead><tr><th>Customer</th><th style={{ textAlign: 'center' }}>Orders</th><th style={{ textAlign: 'right' }}>Total Spent</th><th style={{ textAlign: 'center' }}>Last Order</th></tr></thead>
                    <tbody>
                      {cst.topCustomers?.slice(0, 6).length
                        ? cst.topCustomers.slice(0, 6).map((c: any, i: number) => {
                            const av = [T.purple, T.green, T.sky, T.amber, T.red];
                            const initials = c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                            return (
                              <tr key={i}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="db-avatar" style={{ background: av[i % av.length] }}>{initials}</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</div>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>{c.orderCount}</td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: T.purple }}>{formatR(c.totalSpent)}</td>
                                <td style={{ textAlign: 'center', fontSize: '0.8rem', color: T.muted }}>{c.daysSinceLast === 0 ? 'Today' : `${c.daysSinceLast}d ago`}</td>
                              </tr>
                            );
                          })
                        : <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: T.muted }}>No data</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Grid>

            <div style={{ marginBottom: 20 }}>
              <Card title="Top Customers by Total Spend" bodyHeight="auto">
                <div style={{ overflowX: 'auto' }}>
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Customer</th><th>City</th>
                        <th style={{ textAlign: 'center' }}>Orders</th>
                        <th style={{ textAlign: 'right' }}>Avg Order</th>
                        <th style={{ textAlign: 'right' }}>Total Spent</th>
                        <th style={{ textAlign: 'center' }}>Last Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cst.topCustomers?.length
                        ? cst.topCustomers.map((c: any, i: number) => {
                            const initials = c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                            const av = [T.purple, T.green, T.sky, T.amber, T.red];
                            return (
                              <tr key={i}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div className="db-avatar" style={{ background: av[i % av.length] }}>{initials}</div>
                                    <div>
                                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                                      <div style={{ fontSize: '0.75rem', color: T.muted }}>{c.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ color: T.muted, fontSize: '0.875rem' }}>{c.city === 'N/A' ? '—' : c.city}</td>
                                <td style={{ textAlign: 'center', fontWeight: 500 }}>{c.orderCount}</td>
                                <td style={{ textAlign: 'right', color: T.muted }}>{formatR(c.avgOrder)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: T.purple }}>{formatR(c.totalSpent)}</td>
                                <td style={{ textAlign: 'center', fontSize: '0.8rem', color: T.muted }}>
                                  {c.daysSinceLast === 0 ? 'Today' : `${c.daysSinceLast}d ago`}
                                </td>
                              </tr>
                            );
                          })
                        : <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: T.muted }}>No customer data</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        )}

      </div>
    </>
  );
}