import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { showToast, showConfirm, showPrompt } from '../lib/ui';

export default function Profile() {
  const [userEmail, setUserEmail] = useState<string>('Loading...');
  const [orders, setOrders] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]); // New state for tracking return requests
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('orders');
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string>('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0); 
    if (location.hash) setActiveTab(location.hash.replace('#', ''));

    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/login');
      
      setUserEmail(session.user.user_metadata?.full_name || session.user.email || 'Premium Member');

      // Fetch Orders
      const { data: orderData } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (orderData) {
        setOrders(orderData);
        
        // Fetch Returns linked to these orders
        const orderIds = orderData.map(o => o.id);
        if (orderIds.length > 0) {
          const { data: returnData } = await supabase.from('returns').select('*').in('order_id', orderIds);
          if (returnData) setReturns(returnData);
        }
      }

      const { data: prodData } = await supabase.from('products').select('id, name').eq('status', 'Published');
      if (prodData) setProductsList(prodData);

      const wlStr = localStorage.getItem('vg_wishlist');
      if (wlStr) setWishlist(JSON.parse(wlStr));

      const addrStr = localStorage.getItem('vg_addresses');
      if (addrStr) setAddresses(JSON.parse(addrStr));
    };

    checkUserAndFetchData();
  }, [navigate, location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAddAddress = async () => {
    const newAddr = await showPrompt("Add Shipping Address", "e.g., 123 Heritage Lane, NY");
    if (newAddr && newAddr.trim() !== '') {
      const updated = [...addresses, newAddr];
      setAddresses(updated);
      localStorage.setItem('vg_addresses', JSON.stringify(updated));
      showToast("Address saved successfully.");
    }
  };

  const removeAddress = async (index: number) => {
    const confirmed = await showConfirm("Remove this address from your profile?");
    if (confirmed) {
      const updated = addresses.filter((_, i) => i !== index);
      setAddresses(updated);
      localStorage.setItem('vg_addresses', JSON.stringify(updated));
      showToast("Address removed.");
    }
  };

  const cancelOrder = async (orderId: string) => {
    const confirmed = await showConfirm('Are you sure you want to cancel this order?');
    if (confirmed) {
      const { error } = await supabase.from('orders').update({ status: 'Cancelled' }).eq('id', orderId);
      if (!error) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
        showToast('Order Cancelled Successfully', 'success');
      } else {
        showToast('Failed to cancel order.', 'error');
      }
    }
  };

  const submitReturn = async () => {
    if (!returningOrderId) return;
    if (!returnReason.trim()) return showToast("Please provide a reason for your return.", "error");

    const { data: { session } } = await supabase.auth.getSession();
    const { data: newReturn, error } = await supabase.from('returns').insert({
      order_id: returningOrderId,
      customer_name: session?.user?.user_metadata?.full_name || session?.user?.email,
      type: 'Return',
      reason: returnReason,
      status: 'Requested'
    }).select().single();

    if (!error && newReturn) {
      showToast('Return request submitted. We will contact you shortly.');
      setReturns([...returns, newReturn]); // Instantly show it in UI
      setReturningOrderId(null);
      setReturnReason('');
    } else {
      showToast('Error submitting return request.', 'error');
    }
  };

  const submitReview = async () => {
    if (!reviewProductId) return showToast('Please select a product to review.', 'error');
    if (!reviewText.trim()) return showToast('Please enter your review comments.', 'error');

    const { data: { session } } = await supabase.auth.getSession();
    const customerName = session?.user?.user_metadata?.full_name || session?.user?.email || 'Verified Customer';

    const { error } = await supabase.from('reviews').insert({
      product_id: reviewProductId,
      customer_name: customerName,
      rating: parseInt(reviewRating, 10),
      comment: reviewText,
      status: 'Pending'
    });

    if (!error) {
      showToast('Review submitted successfully!');
      setReviewingOrderId(null);
      setReviewText('');
      setReviewProductId('');
    } else {
      showToast('Error submitting review.', 'error');
    }
  };

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('vg_wishlist', JSON.stringify(updated));
    showToast('Removed from Wishlist', 'info');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) setIsSidebarOpen(false);
  };

  const sidebarStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', top: 0, left: isSidebarOpen ? 0 : '-300px', width: '280px', height: '100vh',
    background: '#fff', zIndex: 4000, transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: '3rem 2rem', boxShadow: isSidebarOpen ? '4px 0 15px rgba(0,0,0,0.1)' : 'none', overflowY: 'auto'
  } : {
    border: '1px solid var(--border)', padding: '2rem', background: '#fff', width: '250px', flexShrink: 0
  };

  return (
    <main style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '6rem' }} className="container">
      {isMobile && isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 3999, backdropFilter: 'blur(2px)' }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '0.5rem', textTransform: 'uppercase', fontFamily: 'Italiana, serif' }}>My Account</h1>
          <p style={{ color: '#666', fontSize: '0.95rem', letterSpacing: '1px', wordBreak: 'break-all' }}>{userEmail}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ width: isMobile ? '100%' : 'auto' }}>Sign Out</button>
      </div>

      {isMobile && (
        <button className="btn btn-dark" onClick={() => setIsSidebarOpen(true)} style={{ marginBottom: '2rem', width: '100%' }}>
          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>☰</span> Account Menu
        </button>
      )}

      <div style={{ display: 'flex', gap: isMobile ? '0' : '4rem', alignItems: 'flex-start' }}>
        
        <aside style={sidebarStyle}>
          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', margin: 0 }}>Menu</h3>
              <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
            </div>
          )}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: 0, padding: 0 }}>
            <li><button onClick={() => handleTabChange('orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === 'orders' ? '#000' : '#888', fontWeight: activeTab === 'orders' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.85rem', width: '100%', transition: 'color 0.3s' }}>📦 My Orders</button></li>
            <li><button onClick={() => handleTabChange('wishlist')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === 'wishlist' ? '#000' : '#888', fontWeight: activeTab === 'wishlist' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.85rem', width: '100%', transition: 'color 0.3s' }}>❤️ Wishlist</button></li>
            <li><button onClick={() => handleTabChange('addresses')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === 'addresses' ? '#000' : '#888', fontWeight: activeTab === 'addresses' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.85rem', width: '100%', transition: 'color 0.3s' }}>📍 Addresses</button></li>
            <li><button onClick={() => handleTabChange('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === 'settings' ? '#000' : '#888', fontWeight: activeTab === 'settings' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.85rem', width: '100%', transition: 'color 0.3s' }}>⚙️ Settings</button></li>
          </ul>
        </aside>

        <section style={{ width: '100%', flex: 1 }}>
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontFamily: 'Italiana, serif' }}>Order History</h2>
              {orders.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#fafafa', border: '1px solid #eee' }}>
                  <p style={{ color: '#666', marginBottom: '1.5rem' }}>You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/shop')} className="btn btn-dark">Explore Collection</button>
                </div>
              ) : (
                orders.map(order => {
                  const isPreShipment = ['Pending', 'Paid', 'Processing'].includes(order.status);
                  const isCancelled = order.status === 'Cancelled';
                  const isRefunded = order.status === 'Refunded';
                  
                  // Check if there is an active return request for this specific order
                  const activeReturn = returns.find(r => r.order_id === order.id);

                  return (
                    <div key={order.id} style={{ border: '1px solid #e5e5e5', padding: isMobile ? '1.5rem 1rem' : '1.5rem', marginBottom: '2rem', background: '#fff', width: '100%' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '0', borderBottom: '1px solid #f4f4f4', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Ref</span>
                          <h4 style={{ fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '0.2rem' }}>
                            {order.id.substring(0, 8).toUpperCase()}
                          </h4>
                        </div>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Date Placed</span>
                          <p style={{ marginTop: '0.2rem', fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          
                          <span style={{ background: isPreShipment ? '#fff3cd' : (isCancelled || isRefunded ? '#fee2e2' : '#e6f4ea'), color: isPreShipment ? '#856404' : (isCancelled || isRefunded ? '#991b1b' : '#1e8e3e'), padding: '6px 12px', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {order.status}
                          </span>
                          
                          {isPreShipment && (
                            <button onClick={() => cancelOrder(order.id)} className="btn btn-action-danger">Cancel Order</button>
                          )}
                          
                          {/* Only show "Request Return" if Delivered AND no return request exists yet */}
                          {order.status === 'Delivered' && !activeReturn && (
                            <button onClick={() => {
                              setReturningOrderId(returningOrderId === order.id ? null : order.id);
                              setReviewingOrderId(null);
                            }} className="btn btn-action">Request Return</button>
                          )}
                          
                          {order.status === 'Delivered' && (
                            <button onClick={() => {
                              setReviewingOrderId(reviewingOrderId === order.id ? null : order.id);
                              setReturningOrderId(null);
                            }} className="btn btn-action">Write a Review</button>
                          )}
                        </div>
                        <div style={{ textAlign: isMobile ? 'left' : 'right', width: isMobile ? '100%' : 'auto', paddingTop: isMobile ? '1rem' : '0', borderTop: isMobile ? '1px solid #eee' : 'none' }}>
                          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</span>
                          <p style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.2rem', textDecoration: isCancelled || isRefunded ? 'line-through' : 'none', color: isCancelled || isRefunded ? '#888' : '#000' }}>₹{order.total_amount?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* --- LIVE RETURN STATUS TRACKER --- */}
                      {activeReturn && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fafafa', borderLeft: `3px solid ${activeReturn.status === 'Refunded' ? '#1e8e3e' : (activeReturn.status === 'Rejected' ? '#d93025' : '#d4af37')}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Return Status</span>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(activeReturn.created_at).toLocaleDateString()}</span>
                          </div>
                          <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0.5rem 0', color: activeReturn.status === 'Refunded' ? '#1e8e3e' : (activeReturn.status === 'Rejected' ? '#d93025' : '#d4af37') }}>
                            {activeReturn.status === 'Requested' ? 'Pending Review' : activeReturn.status}
                          </p>
                          <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', margin: 0 }}>"{activeReturn.reason}"</p>
                        </div>
                      )}

                      {/* INLINE RETURN FORM */}
                      {returningOrderId === order.id && (
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #e5e5e5' }}>
                          <h5 style={{ fontFamily: 'Italiana, serif', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Request a Return</h5>
                          <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder="Reason for return..." rows={3} style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', marginBottom: '1rem', resize: 'vertical', fontFamily: 'inherit' }}></textarea>
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button onClick={submitReturn} className="btn btn-dark">Submit Request</button>
                            <button onClick={() => setReturningOrderId(null)} className="btn btn-outline">Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* INLINE REVIEW FORM */}
                      {reviewingOrderId === order.id && (
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #e5e5e5' }}>
                          <h5 style={{ fontFamily: 'Italiana, serif', fontSize: '1.2rem', marginBottom: '1rem' }}>Review your items</h5>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <select value={reviewProductId} onChange={(e) => setReviewProductId(e.target.value)} style={{ padding: '0.8rem', border: '1px solid #ddd', flex: 1, minWidth: '100%', outline: 'none', fontFamily: 'inherit' }}>
                              <option value="">Select product...</option>
                              {productsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} style={{ padding: '0.8rem', border: '1px solid #ddd', outline: 'none', width: '100%', fontFamily: 'inherit' }}>
                              <option value="5">★★★★★ (5/5)</option>
                              <option value="4">★★★★☆ (4/5)</option>
                              <option value="3">★★★☆☆ (3/5)</option>
                              <option value="2">★★☆☆☆ (2/5)</option>
                              <option value="1">★☆☆☆☆ (1/5)</option>
                            </select>
                          </div>
                          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Tell us what you loved..." rows={3} style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', marginBottom: '1rem', resize: 'vertical', fontFamily: 'inherit' }}></textarea>
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button onClick={submitReview} className="btn btn-dark">Submit Review</button>
                            <button onClick={() => setReviewingOrderId(null)} className="btn btn-outline">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontFamily: 'Italiana, serif' }}>My Wishlist</h2>
              {wishlist.length === 0 ? (
                <p style={{ color: '#666' }}>Your wishlist is empty.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
                  {wishlist.map(item => (
                    <div key={item.id} style={{ border: '1px solid #eee', padding: '1rem', background: '#fff' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '250px', objectFit: 'cover', marginBottom: '1rem' }} />
                      <h4 style={{ fontSize: '1rem', fontFamily: 'Italiana, serif' }}>{item.name}</h4>
                      <p style={{ color: '#D4AF37', fontWeight: 'bold', margin: '0.5rem 0 1rem 0' }}>₹{item.price}</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button onClick={() => navigate('/shop')} className="btn btn-dark" style={{ width: '100%' }}>View Item</button>
                        <button onClick={() => removeFromWishlist(item.id)} className="btn btn-action-danger" style={{ width: '100%', borderRadius: '2px' }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'Italiana, serif', margin: 0 }}>Saved Addresses</h2>
                <button onClick={handleAddAddress} className="btn btn-dark">+ Add New</button>
              </div>
              
              {addresses.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: '#fafafa', border: '1px solid #eee' }}>
                  <p style={{ color: '#666' }}>You haven't saved any addresses yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {addresses.map((addr, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', border: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, color: '#333', lineHeight: 1.6, flex: 1 }}>{addr}</p>
                      <button onClick={() => removeAddress(idx)} className="btn btn-action-danger">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontFamily: 'Italiana, serif' }}>Account Settings</h2>
              <p style={{ color: '#666' }}>Password change and email preferences coming soon.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}