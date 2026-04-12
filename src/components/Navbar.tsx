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

  // Listen for Supabase Auth Changes
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

  // Click Outside, Scroll & Route Change Logic
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

  // Dynamic Cart Counter Logic
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

    updateCount();
    window.addEventListener('cart-updated', updateCount);
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
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #000;
          z-index: 5001;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
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
        .cart-icon-container {
          position: relative;
          display: flex;
          align-items: center;
          color: #000;
          transition: transform 0.2s ease;
        }
        .cart-icon-container:hover {
          transform: translateY(-2px);
        }
        .cart-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #d4af37;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 900px) {
          .nav-desktop-links { display: none !important; }
          .desktop-auth { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>

      <nav style={{ 
        position: 'fixed', top: 0, left: 0, width: '100%', 
        background: '#fff', zIndex: 5000, 
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
        transition: 'box-shadow 0.3s ease'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', overflow: 'visible' }}>
          
          {/* BRAND LOGO */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', zIndex: 5001 }}>
            <img src="/logo.png" alt="VG" style={{ height: '30px' }} />
            <span style={{ fontFamily: 'Italiana, serif', fontSize: '1.3rem', fontWeight: 'bold', color: '#000', letterSpacing: '1px' }}>VITO GINGLIES</span>
          </Link>

          {/* CENTER DESKTOP LINKS */}
          <div className="nav-desktop-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">Our Story</Link>
            <Link to="/shop" className="nav-link">Collection</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="nav-actions">
            
            {/* AUTH SECTION (Desktop Only) */}
            <div className="desktop-auth">
              {!user ? (
                <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}>Sign In</Link>
              ) : (
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
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
            </div>

            {/* CART SYMBOL */}
            <a href="#" onClick={openCart} className="cart-icon-container" style={{ textDecoration: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </a>

            {/* MOBILE HAMBURGER BUTTON */}
            <button className="hamburger-btn" onClick={toggleMobileMenu} style={{ display: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* FULL SCREEN MOBILE MENU OVERLAY */}
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
          <Link to={user ? "/profile" : "/login"} style={{ color: '#d4af37', fontSize: '2rem', fontFamily: 'Italiana, serif', textDecoration: 'none', textTransform: 'uppercase', marginTop: '1rem' }}>
            {user ? 'My Account' : 'Sign In'}
          </Link>
        </div>
      </div>
    </>
  );
}