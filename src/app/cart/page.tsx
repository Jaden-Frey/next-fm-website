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
      <div className="container py-5" style={{ marginTop: '100px' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container text-center" style={{ marginTop: '120px', paddingTop: '60px', paddingBottom: '60px' }}>
        <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
        <h1 className="mt-4 mb-3">Your Cart is Empty</h1>
        <p className="text-muted mb-4">Add some delicious products to your cart!</p>
        <Link href="/products" className="btn btn-dark btn-lg">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '100px', paddingBottom: '60px' }}>
      <div className="row">
        {/* Cart Items */}
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">Shopping Cart</h1>
            <span className="text-muted">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {cart.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`p-4 ${index !== cart.length - 1 ? 'border-bottom' : ''}`}
                >
                  <div className="row align-items-center">
                    {/* Product Image */}
                    <div className="col-md-2 col-3">
                      <Link href={`/products/${item.id}`}>
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                        />
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="col-md-4 col-9">
                      <Link href={`/products/${item.id}`} className="text-decoration-none text-dark">
                        <h5 className="mb-1">{item.name}</h5>
                      </Link>
                      <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </p>
                      {item.onSale && (
                        <span className="badge bg-success mt-1" style={{ fontSize: '0.7rem' }}>
                          On Sale
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-md-3 col-6 mt-3 mt-md-0">
                      <div className="input-group" style={{ maxWidth: '130px' }}>
                        <button 
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <input 
                          type="text" 
                          className="form-control text-center" 
                          value={item.quantity}
                          readOnly
                          style={{ maxWidth: '50px' }}
                        />
                        <button 
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="col-md-3 col-6 mt-3 mt-md-0 text-end">
                      <div className="fw-bold text-danger mb-2" style={{ fontSize: '1.1rem' }}>
                        R{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemove(item.id)}
                      >
                        <i className="bi bi-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-3">
            <Link href="/products" className="btn btn-outline-dark">
              <i className="bi bi-arrow-left me-2"></i>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
            <div className="card-body p-4">
              <h4 className="mb-4">Order Summary</h4>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal ({itemCount} items)</span>
                <span className="fw-bold">R{cartTotal.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span className="text-success">FREE</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="h5 mb-0">Total</span>
                <span className="h4 mb-0 text-danger">R{cartTotal.toFixed(2)}</span>
              </div>

              <button className="btn btn-dark w-100 btn-lg mb-3">
                Proceed to Checkout
              </button>

              <div className="text-center">
                <small className="text-muted">
                  <i className="bi bi-lock-fill me-1"></i>
                  Secure Checkout
                </small>
              </div>

              {/* Promo Code Section */}
              <div className="mt-4 pt-4 border-top">
                <h6 className="mb-3">Have a promo code?</h6>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter code"
                  />
                  <button className="btn btn-outline-secondary" type="button">
                    Apply
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-4 pt-4 border-top">
                <h6 className="mb-3">Benefits</h6>
                <ul className="list-unstyled small text-muted">
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Free delivery on orders over R500
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    100% quality guarantee
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Fresh products delivered daily
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}