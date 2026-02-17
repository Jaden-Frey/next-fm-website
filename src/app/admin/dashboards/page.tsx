'use client';

import React, { useEffect, useState } from 'react';

const formatR = (amount: number) => 
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboards')
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

  const { financial, lists } = data || {};

  return (
    <div className="container-fluid px-4 pb-5">
      <h1 className="mt-4 mb-4">Dashboard Overview</h1>

      {/* --- Top Level Metrics --- */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white h-100 shadow-sm">
            <div className="card-body">
              <div className="text-uppercase small fw-bold text-white-50">Total Revenue</div>
              <div className="h3 mb-0">{formatR(financial?.totalRevenue || 0)}</div>
            </div>
            <div className="card-footer d-flex align-items-center justify-content-between small text-white-50">
               <span>{financial?.activeOrders} Successful Orders</span>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-success text-white h-100 shadow-sm">
            <div className="card-body">
              <div className="text-uppercase small fw-bold text-white-50">Avg Order Value</div>
              <div className="h3 mb-0">{formatR(financial?.avgOrderValue || 0)}</div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-warning text-dark h-100 shadow-sm">
            <div className="card-body">
              <div className="text-uppercase small fw-bold text-dark-50">Discounts</div>
              <div className="h3 mb-0">{formatR(financial?.totalDiscounts || 0)}</div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-dark text-white h-100 shadow-sm">
            <div className="card-body">
              <div className="text-uppercase small fw-bold text-white-50">Total Volume</div>
              <div className="h3 mb-0">{financial?.totalOrders || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Detailed Lists --- */}
      <div className="row">
        {/* Top Products */}
        <div className="col-xl-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold"><i className="bi bi-box-seam me-2"></i>Top Selling Products</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Sold</th>
                    <th className="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {lists?.topProducts?.map((p: any, i: number) => (
                    <tr key={i}>
                      <td>
                        <div className="fw-medium">{p.name}</div>
                        <div className="small text-muted">{p.category}</div>
                      </td>
                      <td className="text-center">{p.qty}</td>
                      <td className="text-end">{formatR(p.revenue)}</td>
                    </tr>
                  ))}
                  {!lists?.topProducts?.length && <tr><td colSpan={3} className="text-center py-3">No data available</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="col-xl-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold"><i className="bi bi-people me-2"></i>VIP Customers</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th className="text-center">Orders</th>
                    <th className="text-end">Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {lists?.topCustomers?.map((c: any, i: number) => (
                    <tr key={i}>
                      <td>
                        <div className="fw-bold">{c.name}</div>
                        <div className="small text-muted">{c.email}</div>
                      </td>
                      <td className="text-center">{c.count}</td>
                      <td className="text-end text-success fw-bold">{formatR(c.spent)}</td>
                    </tr>
                  ))}
                   {!lists?.topCustomers?.length && <tr><td colSpan={3} className="text-center py-3">No data available</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}