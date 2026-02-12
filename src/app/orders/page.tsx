"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs'; 

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoaded) return; 

      try {
        const guestId = localStorage.getItem('guestId');
        
        if (!guestId) {
            setLoading(false);
            return;
        }

        const res = await fetch('/api/orders', {
            headers: { 'x-guest-id': guestId }
        });

        if (res.ok) {
            const data = await res.json();
            setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoaded, user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{paddingTop: '80px'}}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-vh-100 bg-light" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container">
        <h1 className="h3 fw-bold mb-4">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center p-5 bg-white rounded shadow-sm">
            <i className="bi bi-bag-x text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="mt-3 text-muted">You haven't placed any orders yet.</p>
            <Link href="/products" className="btn btn-dark mt-2">Start Shopping</Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {orders.map((order: any) => (
              <div key={order._id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <span className="text-muted small d-block">Order ID</span>
                    <span className="fw-bold text-uppercase">#{order._id.slice(-6)}</span>
                  </div>
                  
                  <span className={`badge rounded-pill px-3 py-2 ${order.status === 'Pending' ? 'bg-warning text-dark' : 'bg-success'}`}>
                    {order.status === 'Pending' ? 'Pending Payment' : order.status}
                  </span>
                </div>
                
                <div className="card-body p-0">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="d-flex align-items-center p-3 border-bottom">
                      <div className="ms-2">
                        <h6 className="mb-0 fw-bold">{item.name}</h6>
                        <small className="text-muted">Qty: {item.quantity}</small>
                      </div>
                      <div className="ms-auto fw-bold">
                        R{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card-footer bg-light p-3 d-flex justify-content-between align-items-center">
                   <small className="text-muted">
                     {new Date(order.createdAt).toLocaleDateString()}
                   </small>
                   <div className="text-end">
                      <span className="text-muted me-2 small text-uppercase">Amount Due:</span>
                      <span className="h5 fw-bold text-dark mb-0">R{order.totalAmount.toFixed(2)}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}