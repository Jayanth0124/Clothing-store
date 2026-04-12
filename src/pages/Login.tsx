import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      if (data.user?.email === 'admin@vito.com') navigate('/admin');
      else navigate('/profile');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', paddingTop: '150px', paddingBottom: '4rem' }}>
      
      <div style={{ background: '#fff', padding: '3rem', border: '1px solid #e5e5e5', width: '100%', maxWidth: '450px', borderRadius: '0' }}>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#000', fontFamily: 'Italiana, serif', textTransform: 'none' }}>Welcome Back</h1>
        <p style={{ color: '#888', marginBottom: '2.5rem', fontSize: '0.95rem', fontFamily: 'Manrope, sans-serif' }}>Enter your credentials to access your account.</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#000', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'Manrope, sans-serif' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '1.2rem', border: '1px solid #e5e5e5', borderRadius: '0', fontFamily: 'Manrope, sans-serif', fontSize: '1rem', outline: 'none', background: '#fafafa' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#000', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'Manrope, sans-serif' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '1.2rem', border: '1px solid #e5e5e5', borderRadius: '0', fontFamily: 'Manrope, sans-serif', fontSize: '1rem', outline: 'none', background: '#fafafa' }} />
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#000', color: '#fff', padding: '1.2rem', border: '1px solid #000', fontWeight: 600, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: '0.9rem', marginTop: '1rem', letterSpacing: '1px' }}>
            {loading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem', color: '#888', fontFamily: 'Manrope, sans-serif' }}>
        Don't have an account? <Link to="/signup" style={{ color: '#000', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
      </p>
    </main>
  );
}