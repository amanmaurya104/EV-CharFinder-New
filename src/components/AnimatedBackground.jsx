import { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create moving dots/particles with trails
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 5 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random starting position
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      particle.style.left = `${startX}%`;
      particle.style.top = `${startY}%`;
      
      // Random movement direction and distance
      const angle = Math.random() * 360;
      const distance = 30 + Math.random() * 50;
      const moveX = Math.cos(angle * Math.PI / 180) * distance;
      const moveY = Math.sin(angle * Math.PI / 180) * distance;
      
      const duration = Math.random() * 15 + 10;
      particle.style.animation = `floatParticle ${duration}s linear infinite`;
      particle.style.setProperty('--move-x', `${moveX}vw`);
      particle.style.setProperty('--move-y', `${moveY}vh`);
      particle.style.animationDelay = `${Math.random() * 2}s`;
      
      // Random color
      const colors = [
        'rgba(66, 134, 244, 0.8)',
        'rgba(0, 212, 255, 0.8)',
        'rgba(100, 200, 255, 0.8)',
        'rgba(255, 255, 255, 0.6)'
      ];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      container.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, (duration + 2) * 1000);
    };

    // Create moving vehicles (EV cars)
    const createVehicle = () => {
      const vehicle = document.createElement('div');
      vehicle.className = 'vehicle';
      const vehicleType = Math.random() > 0.6 ? 'car' : Math.random() > 0.5 ? 'truck' : 'suv';
      vehicle.classList.add(vehicleType);
      
      // Random direction
      const direction = Math.floor(Math.random() * 4);
      const duration = Math.random() * 8 + 12;
      
      switch(direction) {
        case 0: // Right
          vehicle.style.left = '-80px';
          vehicle.style.top = `${Math.random() * 100}%`;
          vehicle.style.animation = `moveRight ${duration}s linear`;
          break;
        case 1: // Down
          vehicle.style.top = '-80px';
          vehicle.style.left = `${Math.random() * 100}%`;
          vehicle.style.animation = `moveDown ${duration}s linear`;
          break;
        case 2: // Left
          vehicle.style.left = 'calc(100% + 80px)';
          vehicle.style.top = `${Math.random() * 100}%`;
          vehicle.style.animation = `moveLeft ${duration}s linear`;
          break;
        case 3: // Up
          vehicle.style.top = 'calc(100% + 80px)';
          vehicle.style.left = `${Math.random() * 100}%`;
          vehicle.style.animation = `moveUp ${duration}s linear`;
          break;
      }
      
      container.appendChild(vehicle);

      // Remove vehicle after animation
      setTimeout(() => {
        if (vehicle.parentNode) {
          vehicle.parentNode.removeChild(vehicle);
        }
      }, duration * 1000);
    };

    // Create energy sparks
    const createSpark = () => {
      const spark = document.createElement('div');
      spark.className = 'spark';
      spark.style.left = `${Math.random() * 100}%`;
      spark.style.top = `${Math.random() * 100}%`;
      spark.style.animationDuration = `${Math.random() * 2 + 1}s`;
      container.appendChild(spark);

      setTimeout(() => {
        if (spark.parentNode) {
          spark.parentNode.removeChild(spark);
        }
      }, 3000);
    };

    // Create initial particles
    for (let i = 0; i < 80; i++) {
      setTimeout(() => createParticle(), i * 100);
    }

    // Create initial vehicles
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createVehicle(), i * 2000);
    }

    // Create particles continuously
    const particleInterval = setInterval(() => {
      createParticle();
    }, 800);

    // Create vehicles periodically
    const vehicleInterval = setInterval(() => {
      createVehicle();
    }, 2500);

    // Create energy sparks
    const sparkInterval = setInterval(() => {
      createSpark();
    }, 500);

    return () => {
      clearInterval(particleInterval);
      clearInterval(vehicleInterval);
      clearInterval(sparkInterval);
    };
  }, []);

  return <div ref={containerRef} className="animated-background"></div>;
};

export default AnimatedBackground;


