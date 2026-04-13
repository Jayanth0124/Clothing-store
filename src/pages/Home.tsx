import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  
  // PDP Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      // 1. Fetch Featured Products
      const { data: products } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('status', 'Published')
        .limit(4);
      if (products) setFeaturedProducts(products);

      // 2. Fetch ONLY Featured & Approved Reviews from Database
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*, products(name)')
        .eq('status', 'Approved') 
        .eq('is_featured', true) // CRITICAL: Only pulls featured reviews
        .order('created_at', { ascending: false });
      if (reviews) setLiveReviews(reviews);
    }
    fetchData();
  }, []);

  const openPdp = (product: any) => {
    setSelectedProduct(product);
    setQty(1);
    setSelectedSize(product.sizes?.[0] || 'Standard');
    setSelectedColor(product.colors?.[0] || 'Default');
    document.body.style.overflow = 'hidden'; 
  };

  const closePdp = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'auto'; 
  };

  const handleAddToCart = () => {
    if ((window as any).cart) {
      (window as any).cart.add(selectedProduct, qty, selectedSize, selectedColor);
      closePdp();
    }
  };

  const handleAddToWishlist = () => {
    const wlStr = localStorage.getItem('vg_wishlist');
    let wl = wlStr ? JSON.parse(wlStr) : [];
    
    if (wl.find((item: any) => item.id === selectedProduct.id)) {
      alert(`${selectedProduct.name} is already in your wishlist!`);
    } else {
      wl.push(selectedProduct);
      localStorage.setItem('vg_wishlist', JSON.stringify(wl));
      alert(`Added ${selectedProduct.name} to your Wishlist ❤️`);
    }
  };

  return (
    <main>
      <header className="hero">
        <h1 data-speed="0.5">Vito Ginglies</h1>
        <p style={{ margin: '2rem 0', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', color: '#fff' }}>
          Premium Menswear • Italian Craftsmanship
        </p>
        <div>
          <Link to="/shop" className="btn" style={{ borderColor: '#fff', color: '#fff', marginRight: '1rem' }}>Pick Your Style</Link>
          <Link to="/contact" className="btn" style={{ borderColor: 'transparent', color: '#fff' }}>Contact Us</Link>
        </div>
      </header>

      <section className="container">
        <div className="about-grid">
          <div className="about-content">
            <h2>The Weight of Quality</h2>
            <p style={{ marginTop: '2rem', fontSize: '1.1rem', color: '#333' }}>
              We do not sell jackets. We sell armor for the modern world.
              Experience inertia-based fabrics that drape with purpose and elegance.
            </p>
            <Link to="/about" className="btn" style={{ marginTop: '2rem', color: 'var(--text)', borderColor: 'var(--text)' }}>
              Read Our Story
            </Link>
          </div>
          <div className="about-img-wrapper" data-speed="0.2">
            <img src="https://images.pexels.com/photos/31387659/pexels-photo-31387659.jpeg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Craftsmanship" />
          </div>
        </div>
      </section>

      <section className="container">
        <h2 style={{ marginBottom: '4rem', textAlign: 'center' }}>Curated Collections</h2>
        
        <div className="product-grid">
          {featuredProducts.length === 0 ? (
            <p style={{ textAlign: 'center', width: '100%', color: '#888' }}>Loading collection...</p>
          ) : (
            featuredProducts.map(p => {
              const totalStock = p.product_variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0;
              const isSoldOut = totalStock <= 0;

              return (
                <div key={p.id} className="product-card" onClick={() => openPdp(p)} style={{ cursor: 'pointer', opacity: isSoldOut ? 0.6 : 1 }}>
                  <div className="img-wrapper" style={{ overflow: 'hidden', height: '450px', backgroundColor: '#f4f4f4', position: 'relative' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isSoldOut && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#000', color: '#fff', padding: '0.5rem 1rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Sold Out</div>
                    )}
                  </div>
                  <div style={{ paddingTop: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontFamily: 'Italiana, serif' }}>{p.name}</h3>
                    <div style={{ marginTop: '5px' }}>
                      {p.original_price && <span className="price-original" style={{ textDecoration: 'line-through', color: '#888', marginRight: '8px' }}>₹{p.original_price}</span>}
                      <span className="price-discount" style={{ color: '#D4AF37', fontWeight: 'bold' }}>₹{p.price}</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px', textTransform: 'uppercase' }}>{p.type}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link to="/shop" className="btn">View All Products</Link>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* --- LIVE DYNAMIC REVIEWS SECTION --- */}
      <section className="container" style={{ backgroundColor: '#fff', marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '4rem' }}>Client Voices</h2>
        <div className="testimonials-grid">
          
          {liveReviews.length > 0 ? (
            liveReviews.map(review => (
              <div key={review.id} className="testimonial-card" style={{ border: '1px solid #eee', padding: '2rem', background: '#fafafa' }}>
                <div className="stars" style={{ color: '#D4AF37', marginBottom: '1rem', fontSize: '1.2rem', letterSpacing: '2px' }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p className="testimonial-text" style={{ fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.6, color: '#333' }}>"{review.comment}"</p>
                <div className="testimonial-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="profile-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'Manrope, sans-serif' }}>
                    {review.customer_name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="profile-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="profile-name" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#000', fontFamily: 'Manrope, sans-serif' }}>{review.customer_name}</span>
                    <span className="profile-status" style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Verified Buyer • {review.products?.name || 'Vito Ginglies'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <p style={{ textAlign: 'center', width: '100%', color: '#888', gridColumn: '1 / -1' }}>No featured reviews available at this time.</p>
          )}
        </div>
      </section>

      {/* --- PRODUCT DETAIL MODAL (PDP) --- */}
      {selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', position: 'relative' }}>
            
            <button onClick={closePdp} style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', zIndex: 10 }}>&times;</button>
            
            <div style={{ background: '#f4f4f4', height: '100%', minHeight: '500px' }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ padding: '3rem 3rem 3rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'Italiana, serif' }}>{selectedProduct.name}</h2>
              <p style={{ fontSize: '1.5rem', color: '#D4AF37', marginBottom: '2rem' }}>₹{selectedProduct.price}</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Select Size</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(selectedProduct.sizes || ['Standard']).map((size: string) => (
                    <button key={size} onClick={() => setSelectedSize(size)} style={{ border: `1px solid ${selectedSize === size ? '#000' : '#ddd'}`, background: selectedSize === size ? '#000' : '#fff', color: selectedSize === size ? '#fff' : '#000', padding: '0.5rem 1rem', cursor: 'pointer' }}>{size}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Select Color</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(selectedProduct.colors || ['Default']).map((color: string) => {
                    const isHex = color.startsWith('#');
                    return (
                      <button key={color} onClick={() => setSelectedColor(color)} style={{ border: `2px solid ${selectedColor === color ? '#000' : 'transparent'}`, background: isHex ? color : '#eee', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', padding: 0 }} title={color}></button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', height: '50px' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '0 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
                  <span style={{ width: '30px', textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={{ padding: '0 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                </div>
                
                <button onClick={handleAddToWishlist} style={{ height: '50px', padding: '0 1.5rem', background: '#fff', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  ❤️ Wishlist
                </button>
              </div>

              <button onClick={handleAddToCart} style={{ width: '100%', height: '50px', background: '#000', color: '#fff', textTransform: 'uppercase', border: 'none', cursor: 'pointer', letterSpacing: '1px', fontWeight: 600 }}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}