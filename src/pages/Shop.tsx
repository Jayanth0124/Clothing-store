import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/ui';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

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
      showToast(`${selectedProduct.name} is already in your wishlist!`, 'info');
    } else {
      wl.push(selectedProduct);
      localStorage.setItem('vg_wishlist', JSON.stringify(wl));
      showToast(`Added ${selectedProduct.name} to Wishlist ❤️`, 'success');
    }
  };

  const displayedProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.type === activeCategory);

  return (
    <main style={{ paddingTop: '120px', minHeight: '100vh' }}>
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

              return (
                <div key={p.id} className="product-card" onClick={() => openPdp(p)} style={{ cursor: 'pointer', opacity: isSoldOut ? 0.6 : 1 }}>
                  <div className="img-wrapper" style={{ overflow: 'hidden', height: '450px', backgroundColor: '#f4f4f4', position: 'relative' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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