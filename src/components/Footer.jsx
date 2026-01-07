import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h5>About</h5>
            <p>EV CharFinder helps you locate and navigate to the nearest charging stations for your electric vehicle.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            </div>
          </motion.div>
          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h5>Quick Links</h5>
            <ul className="footer-links">
              <li><Link to="/#about"><i className="fas fa-chevron-right"></i> About Us</Link></li>
              <li><Link to="/#services"><i className="fas fa-chevron-right"></i> Services</Link></li>
              <li><Link to="/#stations"><i className="fas fa-chevron-right"></i> Stations</Link></li>
              <li><Link to="/#ports"><i className="fas fa-chevron-right"></i> Charging Ports</Link></li>
            </ul>
          </motion.div>
          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h5>Services</h5>
            <ul className="footer-links">
              <li><Link to="/search"><i className="fas fa-search"></i> Station Search</Link></li>
              <li><Link to="/routing"><i className="fas fa-route"></i> Route Finding</Link></li>
              <li><Link to="/traffic"><i className="fas fa-traffic-light"></i> Traffic Detection</Link></li>
            </ul>
          </motion.div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 EV CharFinder. All rights reserved.</p>
          <p className="mt-2">Created by Aman Maurya and Anantkumar Shrivastav</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

