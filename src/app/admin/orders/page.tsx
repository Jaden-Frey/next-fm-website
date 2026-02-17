"use client";

import { useState, useEffect } from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface CustomerDetails {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  customerDetails?: CustomerDetails;
  paymentMethod?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) {
        setError("Unauthorized: You do not have admin access.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Server error: ${res.status}`);
        return;
      }
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError("Network error: Could not connect to the server.");
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(searchLower) ||
      (order.customerDetails?.name || '').toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return 'bg-warning text-dark';
    if (s === 'processing') return 'bg-info text-dark';
    if (s === 'completed') return 'bg-success text-white';
    if (s === 'cancelled') return 'bg-danger text-white';
    return 'bg-secondary text-white';
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  if (error) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <i className="bi bi-exclamation-triangle fs-1 text-danger mb-3 d-block"></i>
        <p className="text-danger fw-medium">{error}</p>
        <button className="btn btn-outline-primary mt-2" onClick={fetchOrders}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-5 bg-light font-sans" style={{ minHeight: '100vh' }}>
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">Order Management</h1>
            <p className="text-muted">Overview of all customer orders</p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="row g-3 align-items-center">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search by ID or Customer Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-4 text-md-end text-muted small">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-uppercase small text-muted">
                <tr>
                  <th className="py-4 ps-4 border-bottom-0">Order ID</th>
                  <th className="py-4 border-bottom-0">Date</th>
                  <th className="py-4 border-bottom-0">Customer</th>
                  <th className="py-4 border-bottom-0">Items</th>
                  <th className="py-4 border-bottom-0">Total</th>
                  <th className="py-4 border-bottom-0">Status</th>
                  <th className="py-4 text-end pe-4 border-bottom-0">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="ps-4 fw-bold text-primary">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="text-muted small">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="fw-medium">{order.customerDetails?.name || "Guest"}</td>
                      <td className="small text-muted">{order.items.length} items</td>
                      <td className="fw-bold">R{order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-2 fw-normal ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-sm btn-light border"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <div className="py-5">
                        <i className="bi bi-inbox fs-1 mb-3 d-block opacity-25"></i>
                        No orders found matching your criteria.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --- DETAILS MODAL --- */}
      {selectedOrder && (
        <>
          <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-4">

                <div className="modal-header border-bottom-0 p-4">
                  <div>
                    <h5 className="modal-title fw-bold">Order Details</h5>
                    <p className="text-muted small mb-0">ID: #{selectedOrder._id}</p>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                </div>

                <div className="modal-body p-4 pt-0">

                  {/* Status Control Section */}
                  <div className="card bg-light border-0 rounded-3 mb-4">
                    <div className="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                      <div className="d-flex align-items-center">
                        <span className="text-muted small me-2 text-uppercase fw-bold">Current Status:</span>
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="d-flex gap-2 w-100 w-md-auto">
                        <button
                          onClick={() => updateStatus(selectedOrder._id, 'Processing')}
                          className={`btn btn-sm flex-grow-1 ${selectedOrder.status === 'Processing' ? 'btn-primary' : 'btn-outline-primary'}`}>
                          Processing
                        </button>
                        <button
                          onClick={() => updateStatus(selectedOrder._id, 'Completed')}
                          className={`btn btn-sm flex-grow-1 ${selectedOrder.status === 'Completed' ? 'btn-success' : 'btn-outline-success'}`}>
                          Complete
                        </button>
                        <button
                          onClick={() => updateStatus(selectedOrder._id, 'Cancelled')}
                          className={`btn btn-sm flex-grow-1 ${selectedOrder.status === 'Cancelled' ? 'btn-danger' : 'btn-outline-danger'}`}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    {/* Customer Info */}
                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 h-100">
                        <h6 className="small text-uppercase fw-bold text-muted mb-3">Customer Details</h6>
                        <div className="d-flex align-items-center mb-2">
                          <div className="bg-light rounded-circle p-2 me-3"><i className="bi bi-person text-secondary"></i></div>
                          <div>
                            <p className="mb-0 fw-bold">{selectedOrder.customerDetails?.name || "Guest"}</p>
                            <p className="mb-0 small text-muted">Customer</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <div className="bg-light rounded-circle p-2 me-3"><i className="bi bi-envelope text-secondary"></i></div>
                          <p className="mb-0 small">{selectedOrder.customerDetails?.email || "No email provided"}</p>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3"><i className="bi bi-geo-alt text-secondary"></i></div>
                          <p className="mb-0 small">{selectedOrder.customerDetails?.address || "No address provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 h-100 bg-light">
                        <h6 className="small text-uppercase fw-bold text-muted mb-3">Payment Summary</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Payment Method</span>
                          <span className="fw-medium">{selectedOrder.paymentMethod || "COD"}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">Total Amount</span>
                          <span className="fw-bold fs-4 text-primary">R{selectedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <h6 className="small text-uppercase fw-bold text-muted mb-3">Items Ordered</h6>
                  <div className="border rounded-3 overflow-hidden">
                    <ul className="list-group list-group-flush">
                      {selectedOrder.items.map((item, idx) => (
                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center p-3">
                          <div className="d-flex align-items-center">
                            <span className="badge bg-light text-dark border me-3 rounded-pill">{item.quantity}x</span>
                            <span className="fw-medium">{item.name}</span>
                          </div>
                          <span className="fw-bold text-dark">R{item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                <div className="modal-footer border-top-0 p-4 pt-0">
                  <button type="button" className="btn btn-secondary w-100 py-2" onClick={() => setSelectedOrder(null)}>
                    Close Details
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}