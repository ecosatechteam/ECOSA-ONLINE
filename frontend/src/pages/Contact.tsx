import React from "react";

export default function Contact() {
  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">Contact</span>
          <h1 style={{ margin: '10px 0 8px' }}>Get in touch with ECOSA</h1>
          <p className="muted" style={{ margin: 0, maxWidth: '72ch', lineHeight: 1.8 }}>
            Reach the association through the official phone number, email address, or postal location below.
          </p>
        </div>
      </section>

      <section className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <article className="card feature-card">
          <span className="feature-kicker">Phone</span>
          <h3>+256 700 123 456</h3>
          <p>Call the ECOSA office for alumni and association inquiries.</p>
        </article>

        <article className="card feature-card">
          <span className="feature-kicker">Email</span>
          <h3>info@ecosa.org</h3>
          <p>Use email for general communication, support, and official correspondence.</p>
        </article>

        <article className="card feature-card">
          <span className="feature-kicker">Location</span>
          <h3>Equatorial College Ibanda</h3>
          <p>Ibanda District, Uganda</p>
        </article>
      </section>
    </div>
  );
}
