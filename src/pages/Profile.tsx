import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { showToast, showConfirm, showPrompt } from '../lib/ui';

export default function Profile() {
  const [userEmail, setUserEmail] = useState<string>('Loading...');
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('orders');
  
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string>('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState('5');

  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.hash) setActiveTab(location.hash.replace('#', ''));

    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/login');
      
      setUserEmail(session.user.user_metadata?.full_name || session.user.email || 'Premium Member');

      const { data: orderData } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);

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
    const { error } = await supabase.from('returns').insert({
      order_id: returningOrderId,
      customer_name: session?.user?.user_metadata?.full_name || session?.user?.email,
      type: 'Return',
      reason: returnReason,
      status: 'Requested'
    });

    if (!error) {
      showToast('Return request submitted. We will contact you shortly.');
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

  return (
    <main style={{ paddingTop: '150px', minHeight: '80vh' }} className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '2rem', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '0.5rem', textTransform: 'uppercase', fontFamily: 'Italiana, serif' }}>My Account</h1>
          <p style={{ color: '#666', fontSize: '0.95rem', letterSpacing: '1px' }}>{userEmail}</p>
        </div>
        <button onClick={handleLogout} className="btn" style={{ padding: '0.8rem 2rem' }}>Sign Out</button>
      </div>

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '4rem', alignItems: 'start' }}>
        <aside style={{ border: '1px solid var(--border)', padding: '2rem', background: '#fff' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: 0, padding: 0 }}>
            <li><button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === 'orders' ? '#000' : '#888', fontWeight: activeTab === 'orders' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.85rem', width: '100%' }}>📦 My Orders</button></li>
            <li><button onClick={() => setActiveTab('wishlist')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === 'wishlist' ? '#000' : '#888', fontWeight: activeTab === 'wishlist' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.85rem', width: '100%' }}>❤️ Wishlist</button></li>
            <li><button onClick={() => setActiveTab('addresses')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === 'addresses' ? '#000' : '#888', fontWeight: activeTab === 'addresses' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.85rem', width: '100%' }}>📍 Addresses</button></li>
            <li><button onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: activeTab === 'settings' ? '#000' : '#888', fontWeight: activeTab === 'settings' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.85rem', width: '100%' }}>⚙️ Settings</button></li>
          </ul>
        </aside>

        <section>
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontFamily: 'Italiana, serif' }}>Order History</h2>
              {orders.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', background: '#fafafa', border: '1px solid #eee' }}>
                  <p style={{ color: '#666', marginBottom: '1.5rem' }}>You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/shop')} className="btn" style={{ background: '#000', color: '#fff' }}>Explore Collection</button>
                </div>
              ) : (
                orders.map(order => {
                  const isPreShipment = ['Pending', 'Paid', 'Processing'].includes(order.status);
                  const isCancelled = order.status === 'Cancelled';
                  
                  return (
                    <div key={order.id} style={{ border: '1px solid #e5e5e5', padding: '2rem', marginBottom: '2rem', background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f4f4f4', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                        <div><span style={{ fontSize: '0.75rem', color: '#888' }}>Order Ref</span><h4>{order.id}</h4></div>
                        <div style={{ textAlign: 'right' }}><span style={{ fontSize: '0.75rem', color: '#888' }}>Date</span><p>{new Date(order.created_at).toLocaleDateString()}</p></div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ background: isPreShipment ? '#fff3cd' : (isCancelled ? '#fee2e2' : '#e6f4ea'), color: isPreShipment ? '#856404' : (isCancelled ? '#991b1b' : '#1e8e3e'), padding: '6px 12px', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {order.status}
                          </span>
                          
                          {isPreShipment && (
                            <button onClick={() => cancelOrder(order.id)} style={{ background: 'none', border: 'none', color: '#ff4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel Order</button>
                          )}
                          
                          {order.status === 'Delivered' && (
                            <>
                              <button onClick={() => {
                                setReturningOrderId(returningOrderId === order.id ? null : order.id);
                                setReviewingOrderId(null);
                              }} style={{ background: 'none', border: 'none', color: '#000', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>Request Return</button>
                              
                              <button onClick={() => {
                                setReviewingOrderId(reviewingOrderId === order.id ? null : order.id);
                                setReturningOrderId(null);
                              }} style={{ background: 'none', border: 'none', color: '#000', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>Write a Review</button>
                            </>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</span>
                          <p style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem' }}>₹{order.total_amount?.toLocaleString()}</p>
                        </div>
                      </div>

                      {returningOrderId === order.id && (
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #e5e5e5' }}>
                          <h5 style={{ fontFamily: 'Italiana, serif', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Request a Return</h5>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem', fontFamily: 'Manrope, sans-serif' }}>Please let us know why you are returning this item.</p>
                          <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder="Reason for return..." rows={3} style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', marginBottom: '1rem', resize: 'vertical' }}></textarea>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={submitReturn} style={{ background: '#000', color: '#fff', padding: '0.8rem 1.5rem', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 600 }}>Submit Request</button>
                            <button onClick={() => setReturningOrderId(null)} style={{ background: 'none', color: '#888', padding: '0.8rem 1.5rem', border: '1px solid #ddd', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Cancel</button>
                          </div>
                        </div>
                      )}

                      {reviewingOrderId === order.id && (
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #e5e5e5' }}>
                          <h5 style={{ fontFamily: 'Italiana, serif', fontSize: '1.2rem', marginBottom: '1rem' }}>Review your items</h5>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <select value={reviewProductId} onChange={(e) => setReviewProductId(e.target.value)} style={{ padding: '0.8rem', border: '1px solid #ddd', flex: 1, minWidth: '200px', outline: 'none' }}>
                              <option value="">Select the product you bought...</option>
                              {productsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} style={{ padding: '0.8rem', border: '1px solid #ddd', outline: 'none', minWidth: '150px' }}>
                              <option value="5">★★★★★ (5/5)</option>
                              <option value="4">★★★★☆ (4/5)</option>
                              <option value="3">★★★☆☆ (3/5)</option>
                              <option value="2">★★☆☆☆ (2/5)</option>
                              <option value="1">★☆☆☆☆ (1/5)</option>
                            </select>
                          </div>
                          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Tell us what you loved about the product..." rows={3} style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', marginBottom: '1rem', resize: 'vertical' }}></textarea>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={submitReview} style={{ background: '#000', color: '#fff', padding: '0.8rem 1.5rem', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 600 }}>Submit Review</button>
                            <button onClick={() => setReviewingOrderId(null)} style={{ background: 'none', color: '#888', padding: '0.8rem 1.5rem', border: '1px solid #ddd', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Cancel</button>
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
                      <p style={{ color: '#D4AF37', fontWeight: 'bold', margin: '0.5rem 0' }}>₹{item.price}</p>
                      <button onClick={() => navigate('/shop')} style={{ width: '100%', padding: '0.8rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: '0.5rem' }}>View Item</button>
                      <button onClick={() => removeFromWishlist(item.id)} style={{ width: '100%', padding: '0.5rem', background: 'none', color: '#d93025', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'Italiana, serif', margin: 0 }}>Saved Addresses</h2>
                <button onClick={handleAddAddress} className="btn" style={{ background: '#000', color: '#fff', padding: '0.8rem 1.5rem' }}>+ Add New Address</button>
              </div>
              
              {addresses.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: '#fafafa', border: '1px solid #eee' }}>
                  <p style={{ color: '#666' }}>You haven't saved any addresses yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {addresses.map((addr, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', border: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, color: '#333', lineHeight: 1.6 }}>{addr}</p>
                      <button onClick={() => removeAddress(idx)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>Remove</button>
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