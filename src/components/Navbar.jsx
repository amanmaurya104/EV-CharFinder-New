import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = ({ isLoggedIn, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.Swal) {
      window.Swal.fire({
        title: 'Logging Out',
        text: 'Thank you for using our service!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        onLogout();
        window.location.href = '/';
      });
    } else {
      onLogout();
      window.location.href = '/';
    }
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: 'fas fa-home' },
    { path: '/#services', label: 'Services', icon: 'fas fa-concierge-bell' },
    { path: '/#stations', label: 'Stations', icon: 'fas fa-charging-station' },
    { path: '/#about', label: 'About', icon: 'fas fa-info-circle' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="navbar-brand">
            <motion.img
              src={`${import.meta.env.BASE_URL}images/logo.png`}
              alt="Logo"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </Link>
          <button
            className="navbar-toggler"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className={`navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
            <div className="navbar-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className={link.icon}></i>
                  <span>{link.label}</span>
                </Link>
              ))}
              {isLoggedIn ? (
                <a href="#" className="nav-link logout-btn" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </a>
              ) : (
                <Link to="/login" className="nav-link login-btn">
                  <i className="fas fa-user"></i>
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <div className="mobile-nav-items">
          <Link to="/" className="mobile-nav-item">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link to="/#services" className="mobile-nav-item">
            <i className="fas fa-concierge-bell"></i>
            <span>Services</span>
          </Link>
          <Link to="/#stations" className="mobile-nav-item">
            <i className="fas fa-charging-station"></i>
            <span>Stations</span>
          </Link>
          <Link to="/#about" className="mobile-nav-item">
            <i className="fas fa-info-circle"></i>
            <span>About</span>
          </Link>
          {isLoggedIn ? (
            <a href="#" className="mobile-nav-item logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </a>
          ) : (
            <Link to="/login" className="mobile-nav-item login-btn">
              <i className="fas fa-user"></i>
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;

