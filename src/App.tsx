import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AdminShell from './pages/AdminShell';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound'; // <-- IMPORT THE NEW 404 PAGE

import { CartManager } from './ts/cart';
import { CheckoutManager } from './ts/checkout';

export default function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.toLowerCase().startsWith('/admin');
    // Check if we are on Auth pages
    const isAuthRoute = ['/login', '/signup'].includes(location.pathname.toLowerCase());

    useEffect(() => {
        if (!(window as any).cart) {
            (window as any).cart = new CartManager();
            new CheckoutManager((window as any).cart);
        }
    }, []);

    // --- NEW: THE BULLETPROOF ROUTE WATCHER ---
    // Every time the URL changes, this guarantees the cart and modals are closed
    useEffect(() => {
        document.getElementById('cart-sidebar')?.classList.remove('active');
        document.getElementById('checkout-modal')?.classList.remove('active');
        document.querySelector('.overlay')?.classList.remove('active');
        document.body.style.overflow = 'auto'; // Always unlock scrolling on new pages
    }, [location.pathname]); 

    const closeCart = (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById('cart-sidebar')?.classList.remove('active');
        document.getElementById('checkout-modal')?.classList.remove('active');
        document.querySelector('.overlay')?.classList.remove('active');
        document.body.style.overflow = 'auto'; // Ensure scroll is restored on manual close
    };

    if (isAdminRoute) {
        return <AdminShell />;
    }

    return (
        <>
            <Navbar />

            <div className="storefront-wrapper">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    
                    {/* --- CATCH-ALL ROUTE: This fixes the UI collapse --- */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>

            {/* HIDE FOOTER ON LOGIN/SIGNUP */}
            {!isAuthRoute && <Footer />}

            <div id="toast">Item added to cart</div>
            <div className="overlay" onClick={closeCart}></div>

            <aside id="cart-sidebar" className="modal-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Your Cart</h2>
                    <button onClick={closeCart} className="btn-close-cart" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>
                <div id="cart-list" style={{ flex: 1, marginTop: '2rem' }}></div>
                <button id="trigger-checkout" className="btn" style={{ width: '100%', textAlign: 'center', background: '#000', color: '#fff', padding: '1rem', textTransform: 'uppercase' }}>
                    Checkout
                </button>
            </aside>

            <section id="checkout-modal" className="modal-panel" style={{ width: '600px', zIndex: 300 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Finalize Order</h2>
                    <button onClick={closeCart} id="close-checkout" className="no-print" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>CLOSE</button>
                </div>
                <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <strong>Order #: <span id="order-id-display"></span></strong>
                </div>
                <form id="checkout-form">
                    <div className="form-group">
                        <label>Full Name</label><input type="text" id="c-name" required placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label><input type="tel" id="c-phone" required placeholder="+1 234..." />
                    </div>
                    <div className="form-group">
                        <label>Shipping Address</label><textarea id="c-address" rows={3} required></textarea>
                    </div>
                    
                    <div style={{ background: '#f9f9f9', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                            <input type="text" id="promo-code-input" placeholder="Have a Promo Code?" style={{ flex: 1, padding: '0.8rem', border: '1px solid #ddd', borderRadius: 0, fontFamily: 'inherit', outline: 'none', textTransform: 'uppercase' }} />
                            <button type="button" id="apply-promo-btn" style={{ background: '#000', color: '#fff', padding: '0 1.5rem', border: 'none', cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Apply</button>
                        </div>
                        <h4 style={{ textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '1rem', letterSpacing: '1px' }}>Order Summary</h4>
                        <div id="checkout-summary"></div>
                    </div>
                    <button type="submit" className="btn no-print" style={{ width: '100%', background: '#000', color: '#fff', padding: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, border: 'none' }}>
                        Confirm & Pay
                    </button>
                </form>
            </section>
        </>
    );
}