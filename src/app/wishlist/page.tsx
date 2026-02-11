"use client";
import { useWishlist } from '../../context/wishlistcontext'; 
import Link from 'next/link';
import HeartButton from '../../components/heartbutton'; 

export default function WishlistPage() {
  const { wishlist: wishlistItems, loading } = useWishlist();

  if (loading) {
    return <div className="container py-3 text-center" style={{ marginTop: '40px' }}>Loading...</div>;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container py-3 text-center" style={{ marginTop: '40px' }}>
        <i className="bi bi-heart text-muted display-1"></i>
        <h2 className="mt-4">Your Wishlist is Empty</h2>
        <Link href="/products" className="btn btn-dark mt-3 px-4">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container py-3" style={{ marginTop: '30px', minHeight: '80vh' }}>
      <h2 className="mb-4 border-bottom pb-3">My Wishlist ({wishlistItems.length})</h2>
      
      {/* Grid Layout: Items align left */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {wishlistItems.map((product) => (
          <div className="col" key={product.id}>
             <div className="card h-100 shadow-sm border-0">
                <Link href={`/products/${product.id}`}>
                   <div className="ratio ratio-1x1 bg-light">
                      <img 
                        src={product.image} 
                        className="card-img-top object-fit-cover" 
                        alt={product.name} 
                      />
                   </div>
                </Link>
                <div className="card-body d-flex flex-column">
                   <h5 className="card-title text-truncate">{product.name}</h5>
                   <p className="card-text fw-bold text-danger">R{product.price}</p>
                   
                   <div className="mt-auto">
                      <HeartButton product={product} />
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}