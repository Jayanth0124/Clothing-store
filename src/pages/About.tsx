export default function About() {
  return (
    <main style={{ paddingTop: '80px' }}>
      <header className="container" style={{ paddingTop: '70px', textAlign: 'center', maxWidth: '800px' }}>
        <h1 style={{ fontFamily: 'Italiana, serif', fontSize: '3.5rem' }}>The Philosophy</h1>
        <p style={{ marginTop: '2rem', fontSize: '1.1rem', color: '#555', lineHeight: 1.8 }}>
          Vito Ginglies was born from a desire to combine structural elegance
          with everyday utility. We believe that a jacket is not just clothing;
          it is the first layer of interaction with the world.
        </p>
      </header>

      <section className="container" style={{ paddingTop: '4rem' }}>
        <div style={{ width: '100%', height: '500px', overflow: 'hidden', background: '#eee' }}>
          <img
            src="https://images.pexels.com/photos/7622228/pexels-photo-7622228.jpeg"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt="Atelier"
          />
        </div>
      </section>

      <section className="container" style={{ maxWidth: '800px', paddingBottom: '6rem' }}>
        <h2 style={{ marginBottom: '2rem', fontFamily: 'Italiana, serif' }}>Craftsmanship</h2>
        <p style={{ marginBottom: '1.5rem', lineHeight: 1.8 }}>
          Every piece is engineered using inertia-based fabrics that maintain
          their silhouette while allowing fluid movement. Sourced from the
          finest mills in Northern Italy, our textiles undergo rigorous testing
          for durability and comfort.
        </p>
        <p style={{ lineHeight: 1.8 }}>
          Our design process is subtractive. We remove the unnecessary until
          only the essential remains. The result is a collection of jackets that
          feel heavy in quality but weightless in wear.
        </p>
      </section>
    </main>
  );
}