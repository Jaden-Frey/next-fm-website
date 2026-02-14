"use client";
import { useCart } from '../../context/cartcontext';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { useState } from 'react'; 
import { useUser, useClerk } from "@clerk/nextjs"; // ADD THIS

export default function CartPage() {
  const { cart, cartTotal, itemCount, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const router = useRouter(); 
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  // ADD THESE
  const { isSignedIn, user } = useUser();
  const { openSignUp } = useClerk();

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId: number) => {
    if (confirm('Remove this item from cart?')) {
      await removeFromCart(productId);
    }
  };

  const handleCreateOrder = async () => {
    // ADD THIS CHECK - Require authentication at checkout
    if (!isSignedIn) {
      openSignUp({
        redirectUrl: '/cart',
        appearance: {
          elements: {
            headerSubtitle: "Create an account to complete your order."
          }
        }
      });
      return;
    }

    setIsCreatingOrder(true);
    try {
      const formattedItems = cart.map(item => ({
        productId: item.id,  
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const payload = {
        customerDetails: {
          // USE USER DATA from Clerk
          name: user.fullName || "Valued Customer",
          email: user.primaryEmailAddress?.emailAddress || "email@example.com",
          address: "Store Pickup / Not Provided",
          city: "N/A",
          postalCode: "0000",
          phone: "0000000000"
        },
        items: formattedItems,
        totalAmount: cartTotal 
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No need to send x-guest-id anymore - backend will use userId from auth
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (clearCart) clearCart(); 
        router.push('/orders');
      } else {
        alert("Failed to create order: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Order creation failed", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
        <div className="text-center p-5 shadow-sm rounded bg-light">
          <i className="bi bi-cart-x text-secondary" style={{ fontSize: '5rem' }}></i>
          <h2 className="mt-4 fw-bold">Your cart is currently empty</h2>
          <Link href="/products" className="btn btn-dark btn-lg px-5 rounded-pill mt-3">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-light min-vh-100" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row g-4">
          
          {/* LEFT: Cart Items */}
          <div className="col-lg-8">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 fw-bold text-dark">Shopping Cart</h1>
              <span className="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-sm">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden rounded-4">
              <div className="card-body p-0">
                {cart.map((item, index) => (
                  <div key={item.id} className={`p-3 p-md-4 ${index !== cart.length - 1 ? 'border-bottom' : ''} bg-white`}>
                    <div className="row align-items-center g-3">
                      <div className="col-4 col-md-2">
                        <div className="rounded-3 overflow-hidden border">
                          <img src={item.image} alt={item.name} className="img-fluid" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                        </div>
                      </div>
                      <div className="col-8 col-md-4">
                        <h6 className="mb-1 fw-bold text-truncate">{item.name}</h6>
                        <p className="text-muted small mb-1">{item.category}</p>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="input-group input-group-sm border rounded-pill overflow-hidden" style={{ maxWidth: '110px' }}>
                          <button className="btn btn-link text-dark p-0 px-2" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><i className="bi bi-dash-lg"></i></button>
                          <input type="text" className="form-control border-0 text-center bg-transparent fw-bold p-0" value={item.quantity} readOnly />
                          <button className="btn btn-link text-dark p-0 px-2" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}><i className="bi bi-plus-lg"></i></button>
                        </div>
                      </div>
                      <div className="col-6 col-md-3 text-end">
                        <div className="fw-bold h5 mb-2">R{(item.price * item.quantity).toFixed(2)}</div>
                        <button className="btn btn-sm btn-outline-danger border-0 px-2 rounded-pill" onClick={() => handleRemove(item.id)}>
                          <i className="bi bi-trash3 me-1"></i> <span className="d-none d-sm-inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Summary Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: '110px', zIndex: 10 }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Order Summary</h5>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Subtotal</span>
                  <span className="fw-medium">R{cartTotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">Shipping</span>
                  <span className="text-success fw-bold small">FREE</span>
                </div>
                <hr className="my-4 opacity-10" />
                <div className="d-flex justify-content-between align-items-end mb-4">
                  <div>
                    <span className="h5 mb-0 d-block fw-bold">Total</span>
                    <small className="text-muted">(Inc. VAT)</small>
                  </div>
                  <span className="h3 mb-0 fw-bold text-danger">R{cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCreateOrder} 
                  disabled={isCreatingOrder}
                  className="btn btn-dark w-100 py-3 rounded-3 fw-bold shadow-sm mb-4"
                >
                  {isCreatingOrder ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    "Create Order"
                  )}
                </button>

                <div className="mb-4 text-center">
                   <p className="text-muted small mb-2 opacity-75">We accept</p>
                   <div className="d-flex justify-content-center gap-3 opacity-75">
                     <i className="bi bi-credit-card-2-front fs-4"></i>
                     <i className="bi bi-paypal fs-4"></i>
                     <i className="bi bi-apple fs-4"></i>
                     <i className="bi bi-google fs-4"></i>
                   </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}