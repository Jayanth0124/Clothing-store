import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- NEW: Free Frontend Password Validation ---
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("Security Requirement: Password must be at least 8 characters long and include at least one number.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      alert("Account created successfully! Welcome to the Atelier.");
      navigate('/login');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', paddingTop: '150px', paddingBottom: '4rem' }}>
      
      <div style={{ background: '#fff', padding: '3rem', border: '1px solid #e5e5e5', width: '100%', maxWidth: '450px', borderRadius: '0' }}>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#000', fontFamily: 'Italiana, serif', textTransform: 'none' }}>Join the Atelier</h1>
        <p style={{ color: '#888', marginBottom: '2.5rem', fontSize: '0.95rem', fontFamily: 'Manrope, sans-serif' }}>Create an account to track orders and save your preferences.</p>
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#000', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'Manrope, sans-serif' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '1.2rem', border: '1px solid #e5e5e5', borderRadius: '0', fontFamily: 'Manrope, sans-serif', fontSize: '1rem', outline: 'none', background: '#fafafa' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#000', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'Manrope, sans-serif' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '1.2rem', border: '1px solid #e5e5e5', borderRadius: '0', fontFamily: 'Manrope, sans-serif', fontSize: '1rem', outline: 'none', background: '#fafafa' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#000', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'Manrope, sans-serif' }}>Secure Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 8 characters & 1 number" style={{ width: '100%', padding: '1.2rem', border: '1px solid #e5e5e5', borderRadius: '0', fontFamily: 'Manrope, sans-serif', fontSize: '1rem', outline: 'none', background: '#fafafa' }} />
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#000', color: '#fff', padding: '1.2rem', border: '1px solid #000', fontWeight: 600, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: '0.9rem', marginTop: '1rem', letterSpacing: '1px' }}>
            {loading ? 'Setting up account...' : 'Create Account'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem', color: '#888', fontFamily: 'Manrope, sans-serif' }}>
        Already have an account? <Link to="/login" style={{ color: '#000', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
      </p>
    </main>
  );
}