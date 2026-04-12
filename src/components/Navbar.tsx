import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Listen for Supabase Auth Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Click Outside & Scroll & Route Change Logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'auto';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);

  // 3. Dynamic Cart Counter Logic
  useEffect(() => {
    const updateCount = () => {
      const cartData = localStorage.getItem('vito_cart_v2');
      if (cartData) {
        const items = JSON.parse(cartData);
        const total = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    };

    updateCount(); // Initial load
    window.addEventListener('cart-updated', updateCount); // Listen for cart updates
    return () => window.removeEventListener('cart-updated', updateCount);
  }, []);

  const openCart = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('cart-sidebar')?.classList.add('active');
    document.querySelector('.overlay')?.classList.add('active');
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  return (
    <>
      <style>{`
        .nav-desktop-links {
          display: flex;
          gap: 2.5rem;
          align-items: center;
        }
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: #000;
          z-index: 5001;
        }
        .nav-link {
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 1px;
          color: #333;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }
        .nav-link:hover {
          color: #d4af37;
        }
        
        @media (max-width: 900px) {
          .nav-desktop-links { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>

      <nav style={{ 
        position: 'fixed', top: 0, left: 0, width: '100%', 
        background: '#fff', zIndex: 5000, 
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
        transition: 'box-shadow 0.3s ease'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', overflow: 'visible' }}>
          
          {/* YOUR ORIGINAL LOGO */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', zIndex: 5001 }}>
            <img src="/logo.png" alt="VG" style={{ height: '30px' }} />
            <span style={{ fontFamily: 'Italiana, serif', fontSize: '1.2rem', fontWeight: 'bold', color: '#000' }}>VITO GINGLIES</span>
          </Link>

          {/* DESKTOP LINKS & AUTH */}
          <div className="nav-desktop-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">Our Story</Link>
            <Link to="/shop" className="nav-link">Collection</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            
            {/* YOUR ORIGINAL AUTH DROPDOWN */}
            {!user ? (
              <Link to="/login" className="nav-link">Sign In</Link>
            ) : (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
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
                  </div>
                )}
              </div>
            )}
            
            <a href="#" onClick={openCart} className="nav-link">CART ({cartCount})</a>
          </div>

          <button className="hamburger-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: '#000',
        zIndex: 4999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        opacity: isMobileMenuOpen ? 1 : 0, visibility: isMobileMenuOpen ? 'visible' : 'hidden', transition: 'opacity 0.4s ease, visibility 0.4s ease',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#fff', fontSize: '2rem', fontFamily: 'Italiana, serif', textDecoration: 'none', textTransform: 'uppercase' }}>Home</Link>
          <Link to="/about" style={{ color: '#fff', fontSize: '2rem', fontFamily: 'Italiana, serif', textDecoration: 'none', textTransform: 'uppercase' }}>Our Story</Link>
          <Link to="/shop" style={{ color: '#fff', fontSize: '2rem', fontFamily: 'Italiana, serif', textDecoration: 'none', textTransform: 'uppercase' }}>Collection</Link>
          <Link to="/contact" style={{ color: '#fff', fontSize: '2rem', fontFamily: 'Italiana, serif', textDecoration: 'none', textTransform: 'uppercase' }}>Contact</Link>
          <Link to={user ? "/profile" : "/login"} style={{ color: '#fff', fontSize: '2rem', fontFamily: 'Italiana, serif', textDecoration: 'none', textTransform: 'uppercase' }}>
            {user ? 'My Account' : 'Sign In'}
          </Link>
          <button onClick={openCart} style={{ background: 'none', border: 'none', color: '#d4af37', fontSize: '2rem', fontFamily: 'Italiana, serif', textTransform: 'uppercase', cursor: 'pointer' }}>
            Cart ({cartCount})
          </button>
        </div>
      </div>
    </>
  );
}