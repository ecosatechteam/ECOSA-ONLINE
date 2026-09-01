import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProjectsSection from '../components/ProjectsSection';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero-shell card">
        <div className="hero-copy">
          <div className="eyebrow">ECOSA Online</div>
          <h1>One polished home for ECOSA membership, updates, and initiatives.</h1>
          <p className="hero-lead">
            Equatorial College Old Students Association is built as a focused platform for registration, payments, leadership, initiatives, and community communication.
          </p>

          <div className="hero-actions">
            <Link className="btn" to="/register">Register</Link>
            <Link className="btn secondary" to="/payments">Pay Membership (UGX 20,000)</Link>
            <Link className="btn secondary" to="/community">Community</Link>
            <Link className="btn secondary" to="/members">Members Search</Link>
          </div>

          <div className="hero-points">
            <div>
              <strong>Fast onboarding</strong>
              <span>Submit your details and join the registry.</span>
            </div>
            <div>
              <strong>Official updates</strong>
              <span>Read announcements, events, and jobs in one feed.</span>
            </div>
            <div>
              <strong>Visible initiatives</strong>
              <span>Track initiatives and contribute where needed.</span>
            </div>
          </div>
        </div>

      </section>

      <section className="feature-grid">
        <article className="feature-card card">
          <span className="feature-kicker">Membership</span>
          <h3>Register as a member</h3>
          <p>Submit your details and join the ECOSA members list automatically.</p>
        </article>

        <article className="feature-card card">
          <span className="feature-kicker">Payments</span>
          <h3>Pay with confidence</h3>
          <p>Complete membership payments and get added to the members registry.</p>
        </article>

        <article className="feature-card card">
          <span className="feature-kicker">Updates</span>
          <h3>Follow official announcements</h3>
          <p>Receive ECOSA updates in a clean, read-only community feed.</p>
        </article>

        <article className="feature-card card">
          <span className="feature-kicker">Initiatives</span>
          <h3>See current initiatives</h3>
          <p>Explore featured work and contribute or donate with one click.</p>
        </article>
      </section>

      <ProjectsSection
        onContribute={() => navigate('/payments?purpose=Project+Donation')}
        onDonate={() => navigate('/payments?purpose=Project+Donation')}
      />
    </div>
  );
};

export default Home;
