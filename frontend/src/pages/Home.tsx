import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import schoolCrest from '../assets/school-crest.png';

const heroSlideImages = Object.values(
  import.meta.glob('../assets/hero-slides/*.{jpg,jpeg,png,webp,avif}', {
    eager: true,
    import: 'default',
  }),
) as string[];

const fallbackHeroImages = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541339907198-e9a9d86d7b9d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
];

const slides = heroSlideImages.length ? heroSlideImages : fallbackHeroImages;

const quickActions = [
  {
    icon: '👤',
    title: 'Pay Membership',
    description: 'Pay your ECOSA membership dues and support the work of our alumni community.',
    to: '/payments?purpose=Alumni%20Dues',
    accent: 'green',
  },
  {
    icon: '👥',
    title: 'Alumni Network',
    description: 'Find fellow alumni, build professional connections, and discover new opportunities.',
    to: '/members',
    accent: 'blue',
  },
  {
    icon: '💬',
    title: 'Community',
    description: 'Receive announcements, event updates, job opportunities, and news from ECOSA chapters.',
    to: '/community',
    accent: 'purple',
  },
  {
    icon: '💡',
    title: 'Impact Projects',
    description: 'Explore initiatives that turn alumni collaboration into meaningful community impact.',
    to: '/projects',
    accent: 'gold',
  },
  {
    icon: '🏅',
    title: 'Leaders',
    description: 'Meet the alumni leaders shaping the direction and future of ECOSA.',
    to: '/leaders',
    accent: 'green',
  },
  {
    icon: '📚',
    title: 'Resources',
    description: 'Find practical information, opportunities, and tools to help you move forward.',
    to: '/resources',
    accent: 'blue',
  },
  {
    icon: '📍',
    title: 'Chapters',
    description: 'Discover chapters near you and connect with alumni in your region.',
    to: '/chapters',
    accent: 'purple',
  },
  {
    icon: '🤝',
    title: 'Donation',
    description: 'Help sustain projects and initiatives that create lasting value for our communities.',
    to: '/payments?purpose=Project+Donation',
    accent: 'gold',
  },
];

const reasons = [
  { icon: '🤝', title: 'Stay Connected', description: 'Reunite with classmates and build new relationships.' },
  { icon: '📚', title: 'Grow Professionally', description: 'Access resources, mentorship and career opportunities.' },
  { icon: '💡', title: 'Make an Impact', description: 'Support initiatives that create real change.' },
  { icon: '🌍', title: 'Global Reach', description: 'A growing network of alumni across the world.' },
  { icon: '💛', title: 'Give Back', description: 'Share your knowledge, experience and support.' },
  { icon: '🤝', title: 'Stronger Together', description: 'Because our success is built on each other.' },
];

const Home: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) {
      return undefined;
    }

    const slideTimer = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(slideTimer);
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero card">
        <div className="home-hero-copy">
          <div className="home-hero-tag">ECOSA</div>
          <h1>
            Welcome to
            <span> ECOSA Online</span>
          </h1>
          <p>
            Welcome to the online home of the Equatorial College Old Students Association. Reconnect
            with fellow alumni, discover opportunities, support one another, and help build a stronger
            future for our communities.
          </p>
          <Link className="home-primary-btn" to="/register">
            Join ECOSA <span>→</span>
          </Link>
        </div>

        <div className="home-hero-visual" aria-label="ECOSA campus view">
          <div className="home-hero-slider">
            {slides.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`home-hero-slide${index === activeSlide ? ' active' : ''}`}
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(11, 74, 148, 0.15), rgba(10, 40, 64, 0.38)), url('${image}')`,
                }}
              />
            ))}
          </div>

          <div className="home-hero-panel">
            <img className="home-school-crest" src={schoolCrest} alt="Equatorial College School crest" />
            <div className="home-hero-panel-title">EQUATORIAL COLLEGE</div>
            <div className="home-hero-panel-sub">SCHOOL - IBANDA</div>
            <div className="home-hero-panel-meta">
              <span>DISCIPLINE</span>
              <span>KNOWLEDGE</span>
              <span>SERVICE</span>
            </div>
            <a
              className="home-school-link"
              href="https://ecs.ac.ug/"
              target="_blank"
              rel="noreferrer"
            >
              Visit our former school website <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="home-actions-heading">
        <p className="home-section-kicker">YOUR ECOSA JOURNEY</p>
        <h2>Connect, grow, and make an impact.</h2>
        <p>Everything you need to take part in the ECOSA network is within reach.</p>
      </section>

      <section className="home-actions-grid">
        {quickActions.map((action) => (
          <Link key={action.title} className={`home-action-card ${action.accent}`} to={action.to}>
            <div className="home-action-icon">{action.icon}</div>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <span className="home-action-link">
              {action.title === 'Pay Membership'
                ? 'Pay membership dues'
                : action.title === 'Alumni Network'
                  ? 'Explore network'
                  : action.title === 'Community'
                    ? 'View updates'
                    : action.title === 'Leaders'
                      ? 'Meet leaders'
                      : action.title === 'Resources'
                        ? 'View resources'
                        : action.title === 'Chapters'
                          ? 'Explore chapters'
                          : action.title === 'Donation'
                            ? 'Donate now'
                            : 'Learn more'}
              <span> →</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="home-why">
        <div className="home-why-intro">
          <h2>
            Why ECOSA?<br />
            <span>A lifelong community built on connection and shared purpose.</span>
          </h2>
          <p>
            ECOSA is a network of passionate professional graduates, businessmen, industry and global
            leaders committed to supporting each other, driving opportunity, and creating social impact.
          </p>
          <Link className="home-primary-btn alt" to="/about">
            About ECOSA <span>→</span>
          </Link>
        </div>

        <div className="home-value-grid">
          {reasons.map((reason) => (
            <div key={reason.title} className="home-value-card">
              <div className="home-value-icon">{reason.icon}</div>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-banner">
        <div className="home-banner-copy">
          <h3>Once a member, always part of ECOSA.</h3>
          <p>Reconnect • Support one another • Build the future</p>
          <Link className="home-banner-btn" to="/register">
            Join ECOSA <span>→</span>
          </Link>
        </div>

        <div className="home-banner-badge">
          <span>Same Spirit</span>
          <span>LifeLong Bonds</span>
        </div>
      </section>
    </div>
  );
};

export default Home;
