'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
);

type Range = '7d' | '30d' | '90d' | 'all';

const T = {
  primary:   '#2563eb',
  success:   '#059669',
  warning:   '#d97706',
  danger:    '#dc2626',
  info:      '#0891b2',
  purple:    '#7c3aed',
  orange:    '#ea580c',
  teal:      '#0d9488',
  pink:      '#db2777',
  muted:     '#64748b',
  border:    '#e2e8f0',
  surface:   '#ffffff',
  bg:        '#f8fafc',
  text:      '#0f172a',
  textLight: '#94a3b8',
};

const MULTI  = [T.primary, T.teal, T.purple, T.orange, T.pink, T.success, T.warning, T.danger];
const PIE_COLORS = [T.success, T.warning, T.danger, T.info, T.muted];
const PAY_COLORS = [T.primary, T.teal, T.purple, T.orange, T.pink];

ChartJS.defaults.font.family = "'DM Sans', sans-serif";
ChartJS.defaults.color       = T.muted;

const formatCompact = (v: number | string) =>
  typeof v === 'number'
    ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', notation: 'compact' }).format(v)
    : v;

const gridLine = { color: '#f1f5f9', lineWidth: 1 };

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: T.text,
      titleColor:      '#fff',
      bodyColor:       '#cbd5e1',
      padding:         12,
      cornerRadius:    8,
      displayColors:   true,
      boxPadding:      4,
    },
  },
  scales: {
    x: {
      grid:  { display: false },
      border:{ display: false },
      ticks: { color: T.muted, font: { size: 11 }, maxRotation: 0 },
    },
    y: {
      grid:        gridLine,
      border:      { display: false, dash: [4, 4] },
      beginAtZero: true,
      ticks:       { color: T.muted, font: { size: 11 }, callback: formatCompact },
    },
  },
};

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: T.text,
      titleColor:      '#fff',
      bodyColor:       '#cbd5e1',
      padding:         12,
      cornerRadius:    8,
      boxPadding:      4,
    },
  },
  scales: {
    x: {
      grid:  { display: false },
      border:{ display: false },
      ticks: { color: T.muted, font: { size: 11 } },
    },
    y: {
      grid:        gridLine,
      border:      { display: false },
      beginAtZero: true,
      ticks:       { color: T.muted, font: { size: 11 }, callback: formatCompact },
    },
  },
};

const arcOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position:  'bottom' as const,
      labels:    { boxWidth: 10, boxHeight: 10, padding: 16, color: T.text, font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: T.text,
      titleColor:      '#fff',
      bodyColor:       '#cbd5e1',
      padding:         12,
      cornerRadius:    8,
      boxPadding:      4,
    },
  },
};

const countOpts = {
  ...lineOpts,
  scales: {
    ...lineOpts.scales,
    y: { ...lineOpts.scales.y, ticks: { ...lineOpts.scales.y.ticks, callback: (v: any) => v } },
  },
};

const s = {
  page: {
    background:  T.bg,
    minHeight:   '100vh',
    padding:     '32px 32px 64px',
    fontFamily:  "'DM Sans', sans-serif",
  } as React.CSSProperties,

  header: {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    marginBottom:   '32px',
    gap:            '16px',
    flexWrap:       'wrap' as const,
  },

  pageTitle: {
    fontSize:   '1.75rem',
    fontWeight: 700,
    color:      T.text,
    lineHeight: 1.2,
    margin:     0,
  } as React.CSSProperties,

  pageSubtitle: {
    fontSize: '0.875rem',
    color:    T.muted,
    margin:   '4px 0 0',
  } as React.CSSProperties,

  rangeGroup: {
    display:      'flex',
    gap:          '6px',
    flexWrap:     'wrap' as const,
    alignItems:   'center',
  },

  rangeBtn: (active: boolean): React.CSSProperties => ({
    padding:       '7px 14px',
    borderRadius:  '8px',
    border:        `1.5px solid ${active ? T.primary : T.border}`,
    background:    active ? T.primary : T.surface,
    color:         active ? '#fff' : T.muted,
    fontWeight:    active ? 600 : 400,
    fontSize:      '0.8125rem',
    cursor:        'pointer',
    transition:    'all 0.15s ease',
    whiteSpace:    'nowrap',
  }),

  card: {
    background:   T.surface,
    borderRadius: '16px',
    border:       `1px solid ${T.border}`,
    boxShadow:    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    overflow:     'hidden',
    height:       '100%',
    display:      'flex',
    flexDirection:'column' as const,
  },

  cardHeader: (accent: string): React.CSSProperties => ({
    padding:         '18px 24px',
    borderBottom:    `1px solid ${T.border}`,
    background:      T.surface,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    gap:             '12px',
    borderTop:       `3px solid ${accent}`,
  }),

  cardTitle: {
    fontSize:   '0.9375rem',
    fontWeight: 600,
    color:      T.text,
    margin:     0,
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
  } as React.CSSProperties,

  badge: (color: string): React.CSSProperties => ({
    fontSize:     '0.6875rem',
    fontWeight:   600,
    padding:      '3px 8px',
    borderRadius: '20px',
    background:   `${color}18`,
    color:        color,
    letterSpacing:'0.02em',
    textTransform:'uppercase',
    whiteSpace:   'nowrap',
  }),

  cardBody: (height: number): React.CSSProperties => ({
    padding: '24px',
    flex:    1,
    height:  height,
  }),

  emptyState: {
    display:        'flex',
    flexDirection:  'column' as const,
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
    color:          T.textLight,
    fontSize:       '0.875rem',
    gap:            '8px',
  },

  grid2: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap:                 '20px',
    marginBottom:        '20px',
  },

  grid8_4: {
    display:             'grid',
    gridTemplateColumns: '2fr 1fr',
    gap:                 '20px',
    marginBottom:        '20px',
  },

  grid5_7: {
    display:             'grid',
    gridTemplateColumns: '5fr 7fr',
    gap:                 '20px',
    marginBottom:        '20px',
  },

  loader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '360px',
    color:          T.primary,
    flexDirection:  'column' as const,
    gap:            '16px',
  },

  arcWrap: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
    padding:        '8px 0',
  },
};

function EmptyState() {
  return (
    <div style={s.emptyState}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      No data for this period
    </div>
  );
}

function ChartCard({
  title, accent, badge, children, bodyHeight = 300,
}: {
  title: React.ReactNode;
  accent: string;
  badge?: string;
  children: React.ReactNode;
  bodyHeight?: number;
}) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader(accent)}>
        <h5 style={s.cardTitle}>{title}</h5>
        {badge && <span style={s.badge(accent)}>{badge}</span>}
      </div>
      <div style={s.cardBody(bodyHeight)}>{children}</div>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]     = useState<Range>('30d');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reports?range=${range}`)
      .then((r) => r.json())
      .then((json) => { setData(json); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [range]);

  const charts = data?.charts;


  const revenueData = {
    labels:   charts?.revenueOverTime?.map((r: any) => r.label)   ?? [],
    datasets: [{
      label:                'Revenue',
      data:                 charts?.revenueOverTime?.map((r: any) => r.revenue) ?? [],
      borderColor:          T.primary,
      backgroundColor:      `${T.primary}18`,
      fill:                 true,
      tension:              0.45,
      pointRadius:          3,
      pointHoverRadius:     6,
      pointBackgroundColor: T.primary,
      borderWidth:          2.5,
    }],
  };

  const categoryData = {
    labels:   charts?.salesByCategory?.map((c: any) => c.category) ?? [],
    datasets: [{
      label:           'Revenue',
      data:            charts?.salesByCategory?.map((c: any) => c.revenue) ?? [],
      backgroundColor: MULTI.slice(0, charts?.salesByCategory?.length ?? 8).map((c) => `${c}cc`),
      hoverBackgroundColor: MULTI.slice(0, charts?.salesByCategory?.length ?? 8),
      borderRadius:    6,
      borderSkipped:   false,
      borderWidth:     0,
    }],
  };

  const statusData = {
    labels:   charts?.orderStatusBreakdown?.map((o: any) => o.status) ?? [],
    datasets: [{
      data:            charts?.orderStatusBreakdown?.map((o: any) => o.count) ?? [],
      backgroundColor: PIE_COLORS,
      hoverBackgroundColor: PIE_COLORS.map((c) => c + 'dd'),
      borderWidth:     0,
      hoverOffset:     8,
    }],
  };

  const paymentData = {
    labels:   charts?.paymentMethods?.map((p: any) => p.method) ?? [],
    datasets: [{
      data:            charts?.paymentMethods?.map((p: any) => p.count) ?? [],
      backgroundColor: PAY_COLORS,
      hoverBackgroundColor: PAY_COLORS.map((c) => c + 'dd'),
      borderWidth:     2,
      borderColor:     T.surface,
      hoverOffset:     8,
      cutout:          '68%',
    }],
  };

  const customerData = {
    labels:   charts?.customerGrowth?.map((c: any) => c.label)   ?? [],
    datasets: [{
      label:                'Signups',
      data:                 charts?.customerGrowth?.map((c: any) => c.signups) ?? [],
      borderColor:          T.success,
      backgroundColor:      `${T.success}18`,
      fill:                 true,
      tension:              0.45,
      pointRadius:          3,
      pointHoverRadius:     6,
      pointBackgroundColor: T.success,
      borderWidth:          2.5,
    }],
  };

  const RANGES: { value: Range; label: string }[] = [
    { value: '7d',  label: '7 Days'  },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>High Level Reporting</h1>
            <p style={s.pageSubtitle}>Visual insights into store performance</p>
          </div>
          <div style={s.rangeGroup}>
            {RANGES.map(({ value, label }) => (
              <button
                key={value}
                style={s.rangeBtn(range === value)}
                onClick={() => setRange(value)}
              >
                {value !== 'all' ? `Last ${label}` : label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div style={s.loader}>
            <div className="spinner-border" style={{ color: T.primary, width: '2rem', height: '2rem' }} role="status" />
            <span style={{ color: T.muted, fontSize: '0.875rem' }}>Loading report data…</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Row 1 — Revenue Growth (full width) */}
            <div style={{ marginBottom: '20px' }}>
              <ChartCard
                title={<><RevenueIcon color={T.primary} /> Revenue Growth</>}
                accent={T.primary}
                badge="Line · Area"
                bodyHeight={280}
              >
                {charts?.revenueOverTime?.length
                  ? <Line data={revenueData} options={lineOpts} />
                  : <EmptyState />}
              </ChartCard>
            </div>

            {/* Row 2 — Sales by Category + Order Status */}
            <div style={s.grid8_4}>
              <ChartCard
                title={<><BarIcon color={T.info} /> Sales by Category</>}
                accent={T.info}
                badge="Bar Chart"
                bodyHeight={300}
              >
                {charts?.salesByCategory?.length
                  ? <Bar data={categoryData} options={barOpts} />
                  : <EmptyState />}
              </ChartCard>

              <ChartCard
                title={<><PieIcon color={T.danger} /> Order Status</>}
                accent={T.danger}
                badge="Pie Chart"
                bodyHeight={300}
              >
                {charts?.orderStatusBreakdown?.length
                  ? <div style={{ ...s.arcWrap, maxHeight: 300 }}><Pie data={statusData} options={arcOpts} /></div>
                  : <EmptyState />}
              </ChartCard>
            </div>

            {/* Row 3 — Payment Methods + Customer Growth */}
            <div style={s.grid5_7}>
              <ChartCard
                title={<><CardIcon color={T.purple} /> Payment Methods</>}
                accent={T.purple}
                badge="Doughnut"
                bodyHeight={300}
              >
                {charts?.paymentMethods?.length
                  ? <div style={{ ...s.arcWrap, maxHeight: 300 }}><Doughnut data={paymentData} options={arcOpts} /></div>
                  : <EmptyState />}
              </ChartCard>

              <ChartCard
                title={<><UserIcon color={T.success} /> Customer Growth</>}
                accent={T.success}
                badge="Area Chart"
                bodyHeight={300}
              >
                {charts?.customerGrowth?.length
                  ? <Line data={customerData} options={countOpts} />
                  : <EmptyState />}
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const ico = (paths: React.ReactNode, color: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {paths}
  </svg>
);

const RevenueIcon = ({ color }: { color: string }) =>
  ico(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>, color);

const BarIcon = ({ color }: { color: string }) =>
  ico(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>, color);

const PieIcon = ({ color }: { color: string }) =>
  ico(<><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></>, color);

const CardIcon = ({ color }: { color: string }) =>
  ico(<><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>, color);

const UserIcon = ({ color }: { color: string }) =>
  ico(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>, color);