import React from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
           <img
  src="/ecosa-logo.jpeg"
  alt="ECOSA Logo"
  className="footer-logo"
/>
          
          <div>
            <h3>ECOSA</h3>

            <p>Equatorial College Ibanda Old Students Association</p>

            <p className="footer-tagline">
              Together for a <br />
              Brighter Future.
            </p>

            <div className="social-links">
              <a href="#" aria-label="X">
                <img src="/x.png" alt="X" style={{ width: 20, height: 20 }} />
              </a>

              <a href="#" aria-label="Facebook">
                <img src="/f.png" alt="Facebook" style={{ width: 20, height: 20 }} />
              </a>

              <a href="#" aria-label="LinkedIn">
                <img src="/in.png" alt="LinkedIn" style={{ width: 20, height: 20 }} />
              </a>
            </div>
          </div>
        </div>

        {/* Explore */}
        <div className="footer-links">
          <h4>Explore</h4>

          <Link to="/">Home</Link>
          <Link to="/about">About ECOSA</Link>
          <Link to="/leaders">Leadership Team</Link>
          <Link to="/projects">Initiatives</Link>
          <Link to="/resources">Resources</Link>
        </div>

        {/* Membership */}
        <div className="footer-links">
          <h4>Alumni Network</h4>

          <Link to="/register">Join ECOSA</Link>
          <Link to="/members">Alumni Directory</Link>
          <Link to="/chapters">Alumni Chapters</Link>
          <Link to="/payments">Alumni Payments</Link>
        </div>

        {/* Community */}
        <div className="footer-links">
          <h4>Community</h4>

          <Link to="/community">Community</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        {/* Contact */}
        <div className="footer-links">
          <h4>Contact</h4>

          <p><Icon name="phone" size={16} /> <a href="tel:+256753414058">+256 753 414 058</a></p>
          <p><Icon name="mail" size={16} /> info@ecosa.org</p>

          <p>
            <Icon name="map-pin" size={16} /> Equatorial College Ibanda
            <br />
            Ibanda District, Uganda
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} ECOSA — Equatorial College Ibanda Old
        Students Association. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
