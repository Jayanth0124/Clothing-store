import { useEffect } from 'react';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main style={{ paddingTop: '150px', paddingBottom: '6rem', minHeight: '80vh' }} className="container">
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontFamily: 'Italiana, serif', fontSize: '3rem', textTransform: 'uppercase' }}>Privacy Policy</h1>
        <p style={{ color: '#888', marginTop: '1rem', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      <section style={{ maxWidth: '800px', margin: '0 auto', color: '#333', lineHeight: '1.8', fontFamily: 'Manrope, sans-serif' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>1. Our Commitment</h3>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            At Vito Ginglies, we respect your privacy and are committed to protecting the personal data you share with us. This policy outlines how we collect, use, and safeguard your information.
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>2. Information We Collect</h3>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support. This may include your name, email address, shipping address, and payment information.
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>3. How We Use Your Data</h3>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            We use the information we collect to fulfill your orders, communicate with you regarding your purchases, improve our website offerings, and provide a personalized shopping experience.
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>4. Data Security</h3>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            We implement high-end security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
          </p>
        </div>
      </section>
    </main>
  );
}