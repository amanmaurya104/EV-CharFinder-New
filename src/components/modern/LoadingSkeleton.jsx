import { motion } from 'framer-motion';
import './LoadingSkeleton.css';

const LoadingSkeleton = () => {
  return (
    <div className="loading-skeleton">
      <motion.div
        className="skeleton-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="skeleton-header">
          <motion.div
            className="skeleton-line skeleton-title"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="skeleton-line skeleton-subtitle"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              className="skeleton-card"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingSkeleton;

