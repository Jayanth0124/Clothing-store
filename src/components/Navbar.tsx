import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openCart = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('cart-sidebar')?.classList.add('active');
    document.querySelector('.overlay')?.classList.add('active');
  };

  return (
    <nav style={{ overflow: 'visible' }}>
      <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        {/* FIX: Removed filter: invert(1) to keep your original logo */}
        <img src="/logo.png" alt="VG" style={{ height: '30px' }} />
        <span style={{ fontFamily: 'Italiana, serif', fontSize: '1.2rem', fontWeight: 'bold' }}>VITO GINGLIES</span>
      </Link>

      <div className="mobile-toggle">
        <div className="bar" style={{ background: '#fff' }}></div>
        <div className="bar" style={{ background: '#fff' }}></div>
        <div className="bar" style={{ background: '#fff' }}></div>
      </div>

      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <Link to="/">Home</Link>
        <Link to="/about">Our Story</Link>
        <Link to="/shop">Collection</Link>
        <Link to="/contact">Contact</Link>
        
        {!user ? (
          <Link to="/login" style={{ fontWeight: 600, borderBottom: '1px solid transparent' }}>Sign In</Link>
        ) : (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #fff' }}>
                {user.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : (user.email?.charAt(0).toUpperCase() || 'U')}
              </div>
            </button>

            {dropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '15px', width: '220px', background: '#fff', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '4px', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
                <div style={{ padding: '1.2rem', borderBottom: '1px solid #eee' }}>
                  <p style={{ margin: 0, color: '#000', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.user_metadata?.full_name || 'Member'}
                  </p>
                  <p style={{ margin: 0, color: '#888', fontSize: '0.75rem' }}>{user.email}</p>
                </div>
                <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column' }}>
                  <Link to="/profile#orders" onClick={() => setDropdownOpen(false)} style={{ padding: '0.8rem 1.2rem', color: '#555', textDecoration: 'none', fontSize: '0.85rem' }}>📦 My Orders</Link>
                  <Link to="/profile#wishlist" onClick={() => setDropdownOpen(false)} style={{ padding: '0.8rem 1.2rem', color: '#555', textDecoration: 'none', fontSize: '0.85rem' }}>❤️ Wishlist</Link>
                  <Link to="/profile#addresses" onClick={() => setDropdownOpen(false)} style={{ padding: '0.8rem 1.2rem', color: '#555', textDecoration: 'none', fontSize: '0.85rem' }}>📍 Addresses</Link>
                  <Link to="/profile#settings" onClick={() => setDropdownOpen(false)} style={{ padding: '0.8rem 1.2rem', color: '#555', textDecoration: 'none', fontSize: '0.85rem' }}>⚙️ Settings</Link>
                </div>
                {/* FIX: Sign Out button strictly removed from here */}
              </div>
            )}
          </div>
        )}
        
        <a href="#" id="cart-trigger" onClick={openCart} style={{ fontWeight: 600 }}>CART (<span id="cart-count">0</span>)</a>
      </div>
    </nav>
  );
}  