import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

interface HamburgerProps {
  isOpen: boolean;
  onClick: () => void;
}

const Hamburger: React.FC<HamburgerProps> = ({ isOpen, onClick }) => {
  return (
    <button
      className={`header-toggle${isOpen ? " open" : ""}`}
      type="button"
      onClick={onClick}
      aria-label="Menu"
      aria-expanded={isOpen}
    >
      <span />
      <span />
      <span />
    </button>
  );
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [membershipOpen, setMembershipOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const membershipRef = useRef<HTMLDivElement>(null);

  const logoBase = `${import.meta.env.BASE_URL}ecosa-logo`;

  const closeMenus = () => {
    setOpen(false);
    setAboutOpen(false);
    setMembershipOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        closeMenus();
      }

      if (
        aboutRef.current &&
        !aboutRef.current.contains(event.target as Node)
      ) {
        setAboutOpen(false);
      }

      if (
        membershipRef.current &&
        !membershipRef.current.contains(event.target as Node)
      ) {
        setMembershipOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);

    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  return (
    <>
      {open && (
        <button
          className="mobile-menu-backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenus}
          onTouchMove={closeMenus}
          onWheel={closeMenus}
        />
      )}
      <header ref={headerRef} className="card header-bar" style={{ margin: "12px" }}>
        <div className="container nav">
          <div className="header-top">
            <Link to="/" className="header-brand" onClick={closeMenus}>
              <img
                src={`${logoBase}.png`}
                alt="ECOSA Logo"
                className="header-logo"
                onError={(e: any) => {
                  try {
                    if (!e.target._triedJpg) {
                      e.target._triedJpg = true;
                      e.target.src = `${logoBase}.jpg`;
                    } else if (!e.target._triedJpeg) {
                      e.target._triedJpeg = true;
                      e.target.src = `${logoBase}.jpeg`;
                    } else {
                      e.target.style.display = "none";
                    }
                  } catch {
                    e.target.style.display = "none";
                  }
                }}
              />

              <div className="header-title">
                <strong>ECOSA</strong>
                <span className="header-title-full">
                  {' '}— Equatorial College Old Students Association
                </span>
              </div>
            </Link>

            <Hamburger
              isOpen={open}
              onClick={() => setOpen((prev) => !prev)}
            />
          </div>

          <nav className={`header-nav${open ? " open" : ""}`}>
          {/* Home */}
          <NavLink to="/" end onClick={closeMenus}>
            Home
          </NavLink>

          {/* About Dropdown */}
          <div className="nav-dropdown" ref={aboutRef}>
            <button
              type="button"
              className={`nav-dropdown-btn${aboutOpen ? " active" : ""}`}
              onClick={() => setAboutOpen((prev) => !prev)}
            >
              <span>About</span>
              <span className={`dropdown-arrow${aboutOpen ? " open" : ""}`}>
                ▼
              </span>
            </button>

            <div className={`nav-dropdown-menu${aboutOpen ? " open" : ""}`}>
              <NavLink to="/about" onClick={closeMenus}>
                What is ECOSA?
              </NavLink>

              <NavLink to="/leaders" onClick={closeMenus}>
                Leaders
              </NavLink>

              <NavLink to="/projects" onClick={closeMenus}>
                Initiatives
              </NavLink>

              <NavLink to="/resources" onClick={closeMenus}>
                Resources
              </NavLink>
            </div>
          </div>

          {/* Membership Dropdown */}
          <div className="nav-dropdown" ref={membershipRef}>
            <button
              type="button"
              className={`nav-dropdown-btn${
                membershipOpen ? " active" : ""
              }`}
              onClick={() => setMembershipOpen((prev) => !prev)}
            >
              <span>Membership</span>
              <span
                className={`dropdown-arrow${
                  membershipOpen ? " open" : ""
                }`}
              >
                ▼
              </span>
            </button>

            <div
              className={`nav-dropdown-menu${
                membershipOpen ? " open" : ""
              }`}
            >
              <NavLink to="/register" onClick={closeMenus}>
                Register
              </NavLink>

              <NavLink to="/members" onClick={closeMenus}>
                Members
              </NavLink>

              <NavLink to="/chapters" onClick={closeMenus}>
                Chapters
              </NavLink>
            </div>
          </div>

          {/* Standalone Pages */}
          <NavLink to="/payments" onClick={closeMenus}>
            Payments
          </NavLink>

          <NavLink to="/community" onClick={closeMenus}>
            Community
          </NavLink>

          <NavLink to="/contact" onClick={closeMenus}>
            Contact
          </NavLink>
          </nav>
        </div>
      </header>
    </>
  );
}
