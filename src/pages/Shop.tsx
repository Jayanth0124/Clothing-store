import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/ui';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  
  // PDP Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').eq('status', 'Active').order('name');
      if (catData) setCategories(catData);

      const { data: prodData } = await supabase.from('products').select('*, product_variants(*)').eq('status', 'Published');
      if (prodData) setProducts(prodData);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const openPdp = (product: any) => {
    setSelectedProduct(product);
    setQty(1);
    setSelectedSize(product.sizes?.[0] || 'Standard');
    setSelectedColor(product.colors?.[0] || 'Default');
    setCurrentImageIndex(0); // Reset carousel on open
    document.body.style.overflow = 'hidden'; 
  };

  const closePdp = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'auto'; 
  };

  const handleAddToCart = () => {
    if ((window as any).cart) {
      // Pass the primary image to the cart, not the full comma-separated string
      const firstImage = selectedProduct.image.split(',')[0].trim();
      (window as any).cart.add({ ...selectedProduct, image: firstImage }, qty, selectedSize, selectedColor);
      closePdp();
    }
  };

  const handleAddToWishlist = () => {
    const wlStr = localStorage.getItem('vg_wishlist');
    let wl = wlStr ? JSON.parse(wlStr) : [];
    
    if (wl.find((item: any) => item.id === selectedProduct.id)) {
      showToast(`${selectedProduct.name} is already in your wishlist!`, 'info');
    } else {
      const firstImage = selectedProduct.image.split(',')[0].trim();
      wl.push({ ...selectedProduct, image: firstImage });
      localStorage.setItem('vg_wishlist', JSON.stringify(wl));
      showToast(`Added ${selectedProduct.name} to Wishlist ❤️`, 'success');
    }
  };

  // Carousel Handlers
  const images = selectedProduct?.image ? selectedProduct.image.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
  
  const nextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
    setTouchStart(0);
    setTouchEnd(0);
  };

  const displayedProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.type === activeCategory);

  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh' }}>
      
      {/* CSS for Responsive Modal & Carousel */}
      <style>{`
        .vg-pdp-modal-content {
          background: #fff; width: 100%; max-width: 1000px; max-height: 90vh;
          overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; position: relative;
        }
        .vg-pdp-carousel { background: #f4f4f4; position: relative; display: flex; align-items: center; justify-content: center; height: 100%; min-height: 500px; user-select: none; }
        .vg-pdp-carousel img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
        .vg-pdp-details { padding: 3rem; display: flex; flex-direction: column; justify-content: center; }
        
        .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.8); border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.3s; z-index: 10; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .carousel-btn:hover { background: #fff; }
        .carousel-btn.left { left: 1rem; }
        .carousel-btn.right { right: 1rem; }
        .carousel-dots { position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 10; }
        .carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(0,0,0,0.3); cursor: pointer; transition: background 0.3s; }
        .carousel-dot.active { background: #000; }

        @media (max-width: 768px) {
          .vg-pdp-modal-content { grid-template-columns: 1fr; max-height: 85vh; }
          .vg-pdp-carousel { min-height: 400px; height: 400px; }
          .vg-pdp-details { padding: 2rem; }
        }
      `}</style>

      <header className="container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'Italiana, serif', fontSize: '3rem', textTransform: 'uppercase' }}>The Collection</h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '1rem auto' }}>Engineered for inertia. Crafted for the modern silhouette.</p>
      </header>

      <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveCategory('All')} 
          style={{ padding: '0.6rem 1.5rem', background: activeCategory === 'All' ? '#000' : 'transparent', color: activeCategory === 'All' ? '#fff' : '#888', border: '1px solid #000', borderRadius: '30px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', transition: 'all 0.3s' }}>
          All Items
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setActiveCategory(cat.name)} 
            style={{ padding: '0.6rem 1.5rem', background: activeCategory === cat.name ? '#000' : 'transparent', color: activeCategory === cat.name ? '#fff' : '#888', border: '1px solid #000', borderRadius: '30px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', transition: 'all 0.3s' }}>
            {cat.name}
          </button>
        ))}
      </div>

      <section className="container" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Collection...</div>
        ) : displayedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>No items found in this category.</div>
        ) : (
          <div className="product-grid">
            {displayedProducts.map(p => {
              const totalStock = p.product_variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0;
              const isSoldOut = totalStock <= 0;
              const firstImage = p.image ? p.image.split(',')[0].trim() : '';

              return (
                <div key={p.id} className="product-card" onClick={() => openPdp(p)} style={{ cursor: 'pointer', opacity: isSoldOut ? 0.6 : 1 }}>
                  <div className="img-wrapper" style={{ overflow: 'hidden', height: '450px', backgroundColor: '#f4f4f4', position: 'relative' }}>
                    <img src={firstImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isSoldOut && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#000', color: '#fff', padding: '0.5rem 1rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Sold Out</div>}
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
            })}
          </div>
        )}
      </section>

      {/* --- PRODUCT DETAIL MODAL (PDP) --- */}
      {selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="vg-pdp-modal-content">
            
            <button onClick={closePdp} style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: '#fff', border: '1px solid #eee', width: '35px', height: '35px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>&times;</button>
            
            <div className="vg-pdp-carousel" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              {images.length > 1 && <button className="carousel-btn left" onClick={prevImage}>&#10094;</button>}
              
              <img src={images[currentImageIndex]} alt={`${selectedProduct.name} view ${currentImageIndex + 1}`} />
              
              {images.length > 1 && <button className="carousel-btn right" onClick={nextImage}>&#10095;</button>}
              
              {images.length > 1 && (
                <div className="carousel-dots">
                  {images.map((_: any, idx: number) => (
                    <div key={idx} className={`carousel-dot ${idx === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(idx)}></div>
                  ))}
                </div>
              )}
            </div>

            <div className="vg-pdp-details">
              <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontFamily: 'Italiana, serif', lineHeight: 1.1 }}>{selectedProduct.name}</h2>
              <p style={{ fontSize: '1.5rem', color: '#D4AF37', marginBottom: '2rem' }}>₹{selectedProduct.price}</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Select Size</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(selectedProduct.sizes || ['Standard']).map((size: string) => (
                    <button key={size} onClick={() => setSelectedSize(size)} style={{ border: `1px solid ${selectedSize === size ? '#000' : '#ddd'}`, background: selectedSize === size ? '#000' : '#fff', color: selectedSize === size ? '#fff' : '#000', padding: '0.5rem 1rem', cursor: 'pointer' }}>{size}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Select Color</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                <button onClick={handleAddToWishlist} style={{ height: '50px', padding: '0 1.5rem', background: '#fff', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>❤️ Wishlist</button>
              </div>

              <button onClick={handleAddToCart} style={{ width: '100%', height: '50px', background: '#000', color: '#fff', textTransform: 'uppercase', border: 'none', cursor: 'pointer', letterSpacing: '1px', fontWeight: 600 }}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}