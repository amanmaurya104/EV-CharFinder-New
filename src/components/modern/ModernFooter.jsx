import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import './ModernFooter.css';

const ModernFooter = () => {
  const footerLinks = {
    product: [
      { label: 'Find Stations', path: '/search' },
      { label: 'Plan Trip', path: '/routing' },
      { label: 'Traffic Info', path: '/traffic' },
      { label: 'Features', path: '/' }
    ],
    company: [
      { label: 'About Us', path: '/' },
      { label: 'Blog', path: '/' },
      { label: 'Careers', path: '/' },
      { label: 'Contact', path: '/' }
    ],
    legal: [
      { label: 'Privacy Policy', path: '/' },
      { label: 'Terms of Service', path: '/' },
      { label: 'Cookie Policy', path: '/' }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Mail, href: '#', label: 'Email' }
  ];

  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-content">
          <motion.div
            className="footer-brand"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="footer-logo">
              <Zap size={32} />
              <span>EV<span className="logo-accent">Charge</span></span>
            </div>
            <p className="footer-tagline">
              Powering the future of electric mobility with intelligent charging solutions.
            </p>
            <div className="footer-social">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="social-link"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          <div className="footer-links">
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                className="footer-link-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <h4 className="link-group-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <ul className="link-list">
                  {links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link to={link.path} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="footer-divider" />
          <div className="footer-copyright">
            <p>&copy; 2024 EVCharge. All rights reserved.</p>
            <p className="footer-credits">
              Built with ⚡ by <span className="gradient-text">Aman Maurya</span> & <span className="gradient-text">Anantkumar Shrivastav</span>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default ModernFooter;

