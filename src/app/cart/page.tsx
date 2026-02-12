"use client";
import { useCart } from '../../context/cartcontext';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { cart, cartTotal, itemCount, loading, removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId: number) => {
    if (confirm('Remove this item from cart?')) {
      await removeFromCart(productId);
    }
  };

  if (loading) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Refreshing your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
        <div className="text-center p-5 shadow-sm rounded bg-light">
          <i className="bi bi-cart-x text-secondary" style={{ fontSize: '5rem' }}></i>
          <h2 className="mt-4 fw-bold">Your cart is currently empty</h2>
          <p className="text-muted mb-4">It looks like you haven't added any delicious items yet.</p>
          <Link href="/products" className="btn btn-dark btn-lg px-5 rounded-pill">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-light min-vh-100" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row g-4">
          
          {/* LEFT: Cart Items List */}
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
                  <div 
                    key={item.id} 
                    className={`p-3 p-md-4 ${index !== cart.length - 1 ? 'border-bottom' : ''} bg-white transition-all`}
                    style={{ transition: 'background 0.2s' }}
                  >
                    <div className="row align-items-center g-3">
                      {/* Product Image */}
                      <div className="col-4 col-md-2">
                        <div className="rounded-3 overflow-hidden border">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="img-fluid"
                            style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="col-8 col-md-4">
                        <h6 className="mb-1 fw-bold text-truncate">{item.name}</h6>
                        <p className="text-muted small mb-1">{item.category}</p>
                        {item.onSale && (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: '0.65rem' }}>
                            SPECIAL OFFER
                          </span>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="col-6 col-md-3">
                        <div className="input-group input-group-sm border rounded-pill overflow-hidden" style={{ maxWidth: '110px' }}>
                          <button 
                            className="btn btn-link text-dark p-0 px-2 text-decoration-none"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <i className="bi bi-dash-lg"></i>
                          </button>
                          <input 
                            type="text" 
                            className="form-control border-0 text-center bg-transparent fw-bold p-0" 
                            value={item.quantity}
                            readOnly
                          />
                          <button 
                            className="btn btn-link text-dark p-0 px-2 text-decoration-none"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        </div>
                      </div>

                      {/* Price & Delete */}
                      <div className="col-6 col-md-3 text-end">
                        <div className="fw-bold h5 mb-2">R{(item.price * item.quantity).toFixed(2)}</div>
                        <button 
                          className="btn btn-sm btn-outline-danger border-0 px-2 rounded-pill"
                          onClick={() => handleRemove(item.id)}
                        >
                          <i className="bi bi-trash3 me-1"></i> <span className="d-none d-sm-inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Link href="/products" className="btn btn-link text-dark text-decoration-none p-0 fw-medium">
                <i className="bi bi-arrow-left me-2"></i> Continue Shopping
              </Link>
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

                <button className="btn btn-dark w-100 py-3 rounded-3 fw-bold shadow-sm mb-3">
                  Check Out Now
                </button>

                <div className="bg-light p-3 rounded-3">
                  <div className="d-flex align-items-center small text-muted">
                    <i className="bi bi-shield-lock-fill text-success me-2"></i>
                    Secure SSL Encrypted Payment
                  </div>
                </div>

                {/* Promo Code - Simplified UI */}
                <div className="mt-4">
                  <button className="btn btn-sm btn-link text-muted p-0 text-decoration-none w-100 text-start" type="button" data-bs-toggle="collapse" data-bs-target="#promoCollapse">
                    Do you have a promo code? <i className="bi bi-chevron-down ms-1 small"></i>
                  </button>
                  <div className="collapse mt-2" id="promoCollapse">
                    <div className="input-group">
                      <input type="text" className="form-control form-control-sm border-end-0" placeholder="Code" />
                      <button className="btn btn-sm btn-dark px-3">Apply</button>
                    </div>
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