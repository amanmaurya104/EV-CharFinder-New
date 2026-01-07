import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Route, 
  Zap, 
  TrendingUp, 
  Shield,
  Clock,
  Battery,
  Navigation
} from 'lucide-react';
import MovingCars from '../../components/modern/MovingCars';
import TypingEffect from '../../components/modern/TypingEffect';
import './ModernHome.css';

const ModernHome = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Live Station Discovery',
      description: 'Real-time availability of charging stations near you',
      color: 'var(--electric-blue)',
      delay: 0.1
    },
    {
      icon: Route,
      title: 'Smart Route Planning',
      description: 'Battery-aware navigation with optimal charging stops',
      color: 'var(--electric-cyan)',
      delay: 0.2
    },
    {
      icon: TrendingUp,
      title: 'Traffic Intelligence',
      description: 'Avoid congestion and find faster charging routes',
      color: 'var(--neon-green)',
      delay: 0.3
    },
    {
      icon: Battery,
      title: 'Availability Prediction',
      description: 'AI-powered forecasts for station availability',
      color: 'var(--electric-purple)',
      delay: 0.4
    }
  ];

  const stats = [
    { value: '50K+', label: 'Charging Stations', icon: Zap },
    { value: '200+', label: 'Cities Covered', icon: MapPin },
    { value: '15min', label: 'Avg Time Saved', icon: Clock },
    { value: '99.9%', label: 'Uptime', icon: Shield }
  ];

  const checkLogin = (e, path) => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <motion.div
      className="modern-home"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MovingCars />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            className="hero-text"
            variants={itemVariants}
          >
            <motion.div
              className="hero-heading-container"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.h1
                className="hero-title"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Power Your Journey
                <span className="gradient-text"> Anywhere</span>
              </motion.h1>
              
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <TypingEffect text="The most intelligent EV charging network. Find stations, plan routes, and never worry about running out of power." speed={30} />
              </motion.p>
            </motion.div>

            <motion.div
              className="hero-cta"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link to="/search" onClick={(e) => checkLogin(e, '/search')}>
                <motion.button
                  className="cta-primary"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MapPin size={20} />
                  Find Charging Near Me
                </motion.button>
              </Link>
              
              <Link to="/routing" onClick={(e) => checkLogin(e, '/routing')}>
                <motion.button
                  className="cta-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Route size={20} />
                  Plan EV Trip
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Navigation size={20} />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">
              Everything You Need for <span className="gradient-text">EV Travel</span>
            </h2>
            <p className="section-description">
              Advanced features powered by real-time data and AI
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const imagePaths = [
                '/images/stations.jpg',
                '/images/route1.jpg',
                '/images/traffic.jpg',
                '/images/power.jpg'
              ];
              return (
                <motion.div
                  key={index}
                  className="feature-card glass"
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="feature-image-wrapper">
                    <img 
                      src={imagePaths[index]} 
                      alt={feature.title}
                      className="feature-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <motion.div
                      className="feature-icon-overlay"
                      style={{ '--icon-color': feature.color }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon size={32} />
                    </motion.div>
                  </div>
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="section-container">
          <motion.div
            className="stats-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="stat-card glass"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="stat-icon">
                    <Icon size={28} />
                  </div>
                  <motion.div
                    className="stat-value"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default ModernHome;

