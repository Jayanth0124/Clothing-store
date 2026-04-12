import { useEffect } from 'react';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main style={{ paddingTop: '150px', paddingBottom: '6rem', minHeight: '80vh' }} className="container">
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontFamily: 'Italiana, serif', fontSize: '3rem', textTransform: 'uppercase' }}>Terms & Conditions</h1>
        <p style={{ color: '#888', marginTop: '1rem', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      <section style={{ maxWidth: '800px', margin: '0 auto', color: '#333', lineHeight: '1.8', fontFamily: 'Manrope, sans-serif' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>1. Introduction</h3>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            Welcome to Vito Ginglies. These Terms and Conditions govern your use of our website and the purchase of our premium menswear products. By accessing this website, you agree to be bound by these terms in full.
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>2. Intellectual Property</h3>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            All content published and made available on our site is the property of Vito Ginglies and the site's creators. This includes, but is not limited to images, text, logos, documents, downloadable files and anything that contributes to the composition of our site.
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>3. Orders and Acceptance</h3>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            All orders are subject to acceptance and availability. Items in your shopping basket are not reserved and may be purchased by other customers. We reserve the right to refuse any order placed with us.
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>4. Pricing & Modifications</h3>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontFamily: 'Italiana, serif', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>5. Contact Information</h3>
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            Questions about the Terms of Service should be sent to us via our Contact Page or our official support email.
          </p>
        </div>
      </section>
    </main>
  );
}