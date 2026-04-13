import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/ui';

export default function Contact() {
  const [settings, setSettings] = useState({
    store_name: 'Vito Ginglies',
    store_email: 'Loading...',
    footer_address: 'Loading...',
    footer_phone: 'Loading...',
    footer_hours: 'Loading...',
    contact_text: 'Loading...',
    formsubmit_email: '' // Added dynamic state
  });

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); 
    
    async function fetchSettings() {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (data && !error) {
        setSettings(data);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      return showToast('Please fill out all fields.', 'error');
    }

    if (!settings.formsubmit_email) {
      return showToast('Contact form is currently offline. Missing destination email.', 'error');
    }

    setIsSubmitting(true);
    
    try {
      // 1. Send data to FormSubmit API in the background (No Redirects!)
      const response = await fetch(`https://formsubmit.co/ajax/${settings.formsubmit_email}`, {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            _subject: "New Inquiry from Vito Ginglies Storefront" // Beautiful email subject
        })
      });

      if (response.ok) {
        setFormData({ name: '', email: '', message: '' });
        showToast('Your message has been sent successfully. We will be in touch soon.', 'success');
      } else {
        showToast('Failed to send message. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ paddingTop: '150px', paddingBottom: '6rem', minHeight: '80vh' }}>
      <header className="container" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontFamily: 'Italiana, serif', fontSize: '3rem', textTransform: 'uppercase' }}>Contact Us</h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '1rem auto' }}>
          {settings.contact_text}
        </p>
      </header>

      <section className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
        
        {/* DYNAMIC CONTACT INFO PANEL */}
        <div style={{ background: '#fafafa', padding: '3rem', border: '1px solid #eee' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.8rem', marginBottom: '2rem' }}>Get in Touch</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#333' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '0.3rem' }}>Visit Us</span>
              <p style={{ fontSize: '1.1rem' }}>{settings.footer_address}</p>
            </div>
            
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '0.3rem' }}>Direct Line</span>
              <p style={{ fontSize: '1.1rem' }}>{settings.footer_phone}</p>
            </div>
            
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '0.3rem' }}>Email Support</span>
              <p style={{ fontSize: '1.1rem' }}><a href={`mailto:${settings.store_email}`} style={{ color: '#000', textDecoration: 'none' }}>{settings.store_email}</a></p>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '0.3rem' }}>Operating Hours</span>
              <p style={{ fontSize: '1.1rem' }}>{settings.footer_hours}</p>
            </div>
          </div>
        </div>

        {/* PREMIUM CONTACT FORM */}
        <div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', color: '#555' }}>Full Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', background: '#fff', fontFamily: 'inherit', fontSize: '1rem' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', color: '#555' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', background: '#fff', fontFamily: 'inherit', fontSize: '1rem' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', color: '#555' }}>Your Message</label>
              <textarea 
                required 
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', background: '#fff', fontFamily: 'inherit', fontSize: '1rem', resize: 'vertical' }}
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ padding: '1.2rem', background: '#000', color: '#fff', border: 'none', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

      </section>
    </main>
  );
}