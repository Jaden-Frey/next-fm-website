"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const getStatusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'pending')   return { cls: 'bg-warning text-dark', icon: 'bi-clock',        label: 'Pending'   };
  if (s === 'completed') return { cls: 'bg-success',           icon: 'bi-check-circle', label: 'Completed' };
  if (s === 'cancelled') return { cls: 'bg-danger',            icon: 'bi-x-circle',     label: 'Cancelled' };
  return                        { cls: 'bg-secondary',         icon: 'bi-circle',       label: status      };
};

export default function OrdersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoaded) return;

      const guestId = localStorage.getItem('guestId');
      if (!isSignedIn && !guestId) { setLoading(false); return; }

      try {
        const headers: HeadersInit = {};
        if (guestId) headers['x-guest-id'] = guestId;

        const res = await fetch('/api/orders', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.orders) setOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoaded, isSignedIn]);

  if (loading) return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
      <div className="text-center p-5 shadow-sm rounded bg-light">
        <i className="bi bi-box-seam text-secondary" style={{ fontSize: '4rem' }}></i>
        <h2 className="mt-4 fw-bold">No orders found</h2>
        <p className="text-muted">You haven't placed any orders yet.</p>
        <Link href="/products" className="btn btn-dark rounded-pill mt-3 px-4">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <main className="bg-light min-vh-100" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <h1 className="h3 fw-bold mb-4">My Orders</h1>

        <div className="row">
          <div className="col-lg-10 mx-auto">
            {orders.map(order => {
              const badge = getStatusBadge(order.status);
              const isCancelled = order.status.toLowerCase() === 'cancelled';

              return (
                <div key={order._id} className={`card border-0 shadow-sm rounded-4 mb-4 overflow-hidden${isCancelled ? ' opacity-75' : ''}`}>

                  <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex flex-column">
                      <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Order Placed</span>
                      <span className="fw-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="text-end d-none d-sm-block">
                        <span className="text-muted small fw-bold text-uppercase d-block" style={{ fontSize: '0.7rem' }}>Order ID</span>
                        <span className="font-monospace text-dark">#{order._id.slice(-6).toUpperCase()}</span>
                      </div>
                      <span className={`badge rounded-pill px-3 py-2 ${badge.cls}`}>
                        <i className={`bi ${badge.icon} me-1`}></i>{badge.label}
                      </span>
                    </div>
                  </div>

                  <div className="card-body p-0">
                    {order.items.map((item, index) => (
                      <div key={index} className="p-3 border-bottom bg-white">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 border rounded overflow-hidden" style={{ width: '60px', height: '60px' }}>
                            <img src={item.image} alt={item.name} className="w-100 h-100 object-fit-cover" />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-0 fw-bold">{item.name}</h6>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                          <div className="text-end">
                            <span className={`fw-medium${isCancelled ? ' text-decoration-line-through text-muted' : ''}`}>
                              R{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card-footer p-3 d-flex justify-content-between align-items-center" style={{ background: isCancelled ? '#fff5f5' : undefined }}>
                    {isCancelled
                      ? <span className="small text-danger fw-medium"><i className="bi bi-info-circle me-1"></i>This order was cancelled.</span>
                      : <span className="text-muted fw-medium">Total Amount</span>
                    }
                    <span className={`h5 mb-0 fw-bold${isCancelled ? ' text-muted text-decoration-line-through' : ' text-dark'}`}>
                      R{order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}