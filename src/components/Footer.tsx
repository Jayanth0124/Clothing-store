import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [settings, setSettings] = useState({
    store_name: 'Vito Ginglies',
    store_email: 'Loading...',
    footer_address: 'Loading...',
    footer_phone: 'Loading...',
    footer_hours: 'Loading...'
  });

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (data && !error) {
        setSettings(data);
      }
    }
    fetchSettings();
  }, []);

  return (
    <footer style={{ backgroundColor: '#000', color: '#fff', padding: '4rem 2rem 2rem 2rem', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', borderBottom: '1px solid #333', paddingBottom: '3rem', marginBottom: '2rem' }}>
        
        {/* Brand Info */}
        <div>
          <h2 style={{ fontFamily: 'Italiana, serif', fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
            {settings.store_name}
          </h2>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px' }}>
            Engineered for inertia. Crafted for the modern silhouette. Redefining premium menswear.
          </p>
        </div>

        {/* Dynamic Contact Info */}
        <div>
          <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#888', fontSize: '0.9rem', lineHeight: '2' }}>
            <li style={{ display: 'flex', gap: '10px' }}><span>📍</span> {settings.footer_address}</li>
            <li style={{ display: 'flex', gap: '10px' }}><span>✉️</span> <a href={`mailto:${settings.store_email}`} style={{ color: '#888', textDecoration: 'none' }}>{settings.store_email}</a></li>
            <li style={{ display: 'flex', gap: '10px' }}><span>📞</span> {settings.footer_phone}</li>
            <li style={{ display: 'flex', gap: '10px' }}><span>🕒</span> {settings.footer_hours}</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Explore</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', lineHeight: '2' }}>
            <li><Link to="/shop" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s' }}>The Collection</Link></li>
            <li><Link to="/about" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s' }}>Our Story</Link></li>
            <li><Link to="/profile" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s' }}>My Account</Link></li>
            <li><Link to="/contact" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s' }}>Contact</Link></li>
          </ul>
        </div>

        {/* NEW: Legal Links */}
        <div>
          <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', lineHeight: '2' }}>
            <li><Link to="/terms" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s' }}>Terms & Conditions</Link></li>
            <li><Link to="/privacy" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s' }}>Privacy Policy</Link></li>
          </ul>
        </div>

      </div>

      <div className="container" style={{ textAlign: 'center', color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        <p>&copy; {new Date().getFullYear()} {settings.store_name}. All rights reserved.</p>
      </div>
    </footer>
  );
}