import { motion } from 'framer-motion';
import { Zap, MapPin, Navigation } from 'lucide-react';
import './MapLoading.css';

const MapLoading = () => {
  return (
    <motion.div
      className="map-loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="map-loading-content">
        <motion.div
          className="loading-icon-container"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Zap className="loading-icon" size={64} />
        </motion.div>
        
        <motion.h2
          className="loading-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading Map
        </motion.h2>
        
        <motion.p
          className="loading-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Preparing your EV charging journey...
        </motion.p>

        <div className="loading-dots">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="loading-dot"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="loading-features">
          <motion.div
            className="loading-feature"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <MapPin size={20} />
            <span>Finding Stations</span>
          </motion.div>
          <motion.div
            className="loading-feature"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Navigation size={20} />
            <span>Planning Routes</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MapLoading;

