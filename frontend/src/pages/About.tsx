import React from "react";

export default function About() {
  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">About ECOSA</span>
          <h1 style={{ margin: '10px 0 8px' }}>What is ECOSA?</h1>
          <p className="muted" style={{ margin: 0, maxWidth: '74ch', lineHeight: 1.8 }}>
            ECOSA is the official alumni association of former students of Equatorial College Ibanda. It exists to connect alumni, strengthen support networks, and promote lifelong collaboration.
          </p>
        </div>
        <div className="hero-metric" style={{ minWidth: 220 }}>
          <strong>Founded</strong>
          <span>2023 URSB registration</span>
        </div>
      </section>

      <section className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <article className="card feature-card">
          <span className="feature-kicker">Motto</span>
          <h3>Together for a Brighter Future.</h3>
          <p>Our motto captures the spirit of collective growth, support, and shared progress.</p>
        </article>

        <article className="card feature-card">
          <span className="feature-kicker">Vision</span>
          <h3>United and empowered alumni.</h3>
          <p>We aim to build an influential alumni community that transforms lives and communities.</p>
        </article>

        <article className="card feature-card">
          <span className="feature-kicker">Mission</span>
          <h3>Connect, empower, and serve.</h3>
          <p>Networking, mentorship, partnerships, and service guide everything ECOSA does.</p>
        </article>

        <article className="card feature-card">
          <span className="feature-kicker">Values</span>
          <h3>Unity, integrity, professionalism.</h3>
          <p>These core values keep the association accountable and forward-looking.</p>
        </article>
      </section>

      <section className="card">
        <div className="dashboard-section-head" style={{ marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0 }}>Our Story</h2>
            <p className="muted" style={{ margin: '6px 0 0', lineHeight: 1.8 }}>
              ECOSA traces its roots to the 2022 alumni reunion, where members elected an interim committee to establish the association and complete its registration.
            </p>
          </div>
        </div>

        <div className="page-stack" style={{ gap: 14 }}>
          <p style={{ margin: 0, lineHeight: 1.8 }}>
            The committee developed the constitution, governance structures, and legal registration process that led to ECOSA being officially recognized by the Uganda Registration Services Bureau in 2023.
          </p>

          <div className="dashboard-list" style={{ marginTop: 4 }}>
            {['Unity', 'Integrity', 'Professionalism', 'Service', 'Accountability', 'Innovation', 'Teamwork'].map((value) => (
              <div key={value} className="dashboard-list-item">
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
