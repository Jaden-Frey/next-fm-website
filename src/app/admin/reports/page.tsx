'use client';

import React, { useEffect, useState } from 'react';

const formatR = (amount: number) => 
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  const { charts, lists } = data || {};

  return (
    <div className="container-fluid px-4 mb-5">
      <div className="d-flex justify-content-between align-items-center">
        <div>
            <h1 className="mt-4 mb-2">Detailed Reports</h1>
            <p className="text-muted">Visual insights into store performance.</p>
        </div>
        <div>
            {/* Placeholder for future date picker */}
            <button className="btn btn-outline-secondary btn-sm me-2">
                <i className="bi bi-calendar3 me-2"></i>Last 30 Days
            </button>
            <button className="btn btn-primary btn-sm">
                <i className="bi bi-download me-2"></i>Export CSV
            </button>
        </div>
      </div>

      {/* --- ROW 1: MAIN FINANCIAL TREND --- */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="m-0 fw-bold text-primary">
            <i className="bi bi-graph-up me-2"></i>Revenue Growth
          </h5>
          <span className="badge bg-light text-dark border">Line Chart Area</span>
        </div>
        <div className="card-body">
          {/* CHART CONTAINER: Target for <LineChart /> */}
          <div className="d-flex justify-content-center align-items-center bg-light rounded border border-dashed mb-4" style={{ height: '350px' }}>
            <div className="text-center text-muted">
                <i className="bi bi-graph-up fs-1 d-block mb-2"></i>
                <span>Revenue vs. Time Chart will render here</span>
            </div>
          </div>

          {/* Data Summary Table (Temporary view of data) */}
          <div className="table-responsive">
            <table className="table table-sm text-center table-bordered mb-0">
                <thead className="table-light">
                    <tr>
                        {charts?.monthlyTrend?.map((m: any, i: number) => <th key={i}>{m.month}</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {charts?.monthlyTrend?.map((m: any, i: number) => <td key={i}>{formatR(m.revenue)}</td>)}
                    </tr>
                </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row">
        
        {/* --- ROW 2, COL 1: CATEGORY PERFORMANCE --- */}
        <div className="col-lg-8 mb-4">
            <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="m-0 fw-bold">
                        <i className="bi bi-bar-chart-fill me-2"></i>Sales by Category
                    </h5>
                    <span className="badge bg-light text-dark border">Bar Chart Area</span>
                </div>
                <div className="card-body">
                    {/* CHART CONTAINER: Target for <BarChart /> */}
                    <div className="d-flex justify-content-center align-items-center bg-light rounded border border-dashed mb-3" style={{ height: '300px' }}>
                        <div className="text-center text-muted">
                            <i className="bi bi-bar-chart-fill fs-2 d-block mb-2"></i>
                            <span>Category Comparison Chart</span>
                        </div>
                    </div>
                    
                    {/* Data List */}
                    <div className="row g-2">
                        {lists?.topCategories?.slice(0, 6).map((c: any, i: number) => (
                            <div key={i} className="col-4">
                                <div className="p-2 border rounded bg-white small">
                                    <div className="fw-bold text-truncate">{c.name}</div>
                                    <div className="text-primary">{formatR(c.value)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* --- ROW 2, COL 2: ORDER STATUS --- */}
        <div className="col-lg-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="m-0 fw-bold">Order Status</h5>
                    <span className="badge bg-light text-dark border">Pie Chart Area</span>
                </div>
                <div className="card-body">
                    {/* CHART CONTAINER: Target for <PieChart /> */}
                    <div className="d-flex justify-content-center align-items-center bg-light rounded border border-dashed mb-3" style={{ height: '200px' }}>
                        <div className="text-center text-muted">
                            <i className="bi bi-pie-chart-fill fs-2 d-block"></i>
                        </div>
                    </div>

                    <ul className="list-group list-group-flush small">
                        {Object.entries(charts?.statusStats || {}).map(([status, count]: any) => (
                            <li key={status} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                <span>{status}</span>
                                <span className="badge bg-secondary rounded-pill">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

      </div>

      <div className="row">
         {/* --- ROW 3: PAYMENT METHODS --- */}
         <div className="col-lg-6 mb-4">
            <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="m-0 fw-bold">Payment Methods</h5>
                </div>
                <div className="card-body d-flex align-items-center">
                    <div className="flex-grow-1">
                         {/* CHART CONTAINER: Target for <DoughnutChart /> */}
                        <div className="d-flex justify-content-center align-items-center bg-light rounded border border-dashed" style={{ height: '150px' }}>
                            <span className="text-muted small">Doughnut Chart</span>
                        </div>
                    </div>
                    <div className="ms-4" style={{ minWidth: '200px' }}>
                        <ul className="list-unstyled mb-0 small">
                            {Object.entries(charts?.paymentStats || {}).map(([method, count]: any) => (
                                <li key={method} className="mb-2 d-flex justify-content-between border-bottom pb-1">
                                    <span>{method}</span>
                                    <span className="fw-bold">{count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
         </div>
         
         {/* --- ROW 3: FUTURE METRIC (User Signups) --- */}
         <div className="col-lg-6 mb-4">
            <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="m-0 fw-bold">Customer Growth</h5>
                </div>
                <div className="card-body">
                     {/* CHART CONTAINER: Target for <AreaChart /> */}
                    <div className="d-flex justify-content-center align-items-center bg-light rounded border border-dashed h-100" style={{ minHeight: '150px' }}>
                        <span className="text-muted">User Signups Over Time (Area Chart)</span>
                    </div>
                </div>
            </div>
         </div>
      </div>

    </div>
  );
}