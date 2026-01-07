import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Battery } from 'lucide-react';
import './MovingCars.css';

const MovingCars = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createCar = () => {
      const car = document.createElement('div');
      car.className = 'moving-car';
      
      // Random car type
      const carTypes = ['car', 'suv', 'truck'];
      const carType = carTypes[Math.floor(Math.random() * carTypes.length)];
      car.classList.add(carType);

      // Random direction
      const directions = ['right', 'left', 'up', 'down'];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      car.classList.add(`move-${direction}`);

      // Random starting position
      const duration = Math.random() * 8 + 12; // 12-20 seconds
      
      switch(direction) {
        case 'right':
          car.style.left = '-100px';
          car.style.top = `${Math.random() * 100}%`;
          break;
        case 'left':
          car.style.left = 'calc(100% + 100px)';
          car.style.top = `${Math.random() * 100}%`;
          break;
        case 'down':
          car.style.top = '-100px';
          car.style.left = `${Math.random() * 100}%`;
          break;
        case 'up':
          car.style.top = 'calc(100% + 100px)';
          car.style.left = `${Math.random() * 100}%`;
          break;
      }

      car.style.animationDuration = `${duration}s`;
      container.appendChild(car);

      // Remove car after animation
      setTimeout(() => {
        if (car.parentNode) {
          car.parentNode.removeChild(car);
        }
      }, duration * 1000);
    };

    // Create initial cars
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createCar(), i * 2000);
    }

    // Create cars continuously
    const carInterval = setInterval(() => {
      createCar();
    }, 3000);

    return () => {
      clearInterval(carInterval);
    };
  }, []);

  return (
    <div ref={containerRef} className="moving-cars-container">
      {/* This will be populated by the useEffect */}
    </div>
  );
};

export default MovingCars;

