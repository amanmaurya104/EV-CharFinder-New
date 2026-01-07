import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, MapPin, Navigation, X, Zap, Clock, Battery, TrendingUp } from 'lucide-react';
import './ModernEVRouting.css';

const ModernEVRouting = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);
  const [start, setStart] = useState('');
  const [finish, setFinish] = useState('');
  const [summary, setSummary] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const loadTomTom = () => {
      if (window.tt) {
        initializeMap();
      } else {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.36.1/maps/maps.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.36.1/maps/maps-web.min.js';
        script.onload = () => {
          const servicesScript = document.createElement('script');
          servicesScript.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.36.1/services/services-web.min.js';
          servicesScript.onload = () => {
            const chargingScript = document.createElement('script');
            chargingScript.src = '/chargingAvailability.js';
            chargingScript.onload = () => {
              const routeScript = document.createElement('script');
              routeScript.src = '/calculateLongDistanceEVRoute.js';
              routeScript.onload = () => {
                const modelScript = document.createElement('script');
                modelScript.src = '/ev_model.js';
                modelScript.onload = initializeMap;
                document.body.appendChild(modelScript);
              };
              document.body.appendChild(routeScript);
            };
            document.body.appendChild(chargingScript);
          };
          document.body.appendChild(servicesScript);
        };
        document.body.appendChild(script);
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || mapInstance.current) return;

      const application = {
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        name: 'EV Routing',
        version: '1.0'
      };

      window.tt.setProductInfo(application.name, application.version);
      mapInstance.current = window.tt.map({
        key: application.key,
        container: mapRef.current,
        style: 'tomtom://vector/1/basic-main',
        center: [0, 0],
        zoom: 2
      });
    };

    loadTomTom();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const clearRoute = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    setSummary('');

    if (routeLayerRef.current && mapInstance.current?.getLayer(routeLayerRef.current)) {
      mapInstance.current.removeLayer(routeLayerRef.current);
      mapInstance.current.removeSource('routeSource');
      routeLayerRef.current = null;
    }
  };

  const calculateRoute = async () => {
    if (!mapInstance.current || !mapInstance.current.loaded()) {
      setSummary('Please try again later, map is still loading.');
      return;
    }

    setIsCalculating(true);
    clearRoute();

    if (!window.tt || !window.tt.services) {
      setSummary('TomTom services not loaded yet. Please wait.');
      setIsCalculating(false);
      return;
    }

    try {
      const startResults = await window.tt.services.fuzzySearch({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        query: start
      }).go();

      const finishResults = await window.tt.services.fuzzySearch({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        query: finish
      }).go();

      if (startResults.results.length === 0 || finishResults.results.length === 0) {
        setSummary('Could not find one or both locations. Please check your input.');
        setIsCalculating(false);
        return;
      }

      const startPos = startResults.results[0].position;
      const finishPos = finishResults.results[0].position;

      // Add markers
      const startMarker = new window.tt.Marker({ color: '#39ff14' })
        .setLngLat(startPos)
        .addTo(mapInstance.current);
      
      const finishMarker = new window.tt.Marker({ color: '#ff006e' })
        .setLngLat(finishPos)
        .addTo(mapInstance.current);

      markersRef.current.push(startMarker, finishMarker);

      // Calculate route
      const routeResults = await window.tt.services.calculateRoute({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        locations: `${startPos.lat},${startPos.lng}:${finishPos.lat},${finishPos.lng}`,
        travelMode: 'car',
        routeType: 'fastest'
      }).go();

      if (routeResults.routes && routeResults.routes.length > 0) {
        const route = routeResults.routes[0];
        const geometry = route.legs[0].points;

        // Draw route
        if (mapInstance.current.getSource('routeSource')) {
          mapInstance.current.removeLayer(routeLayerRef.current);
          mapInstance.current.removeSource('routeSource');
        }

        mapInstance.current.addSource('routeSource', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: geometry.map(point => [point.longitude, point.latitude])
            }
          }
        });

        mapInstance.current.addLayer({
          id: 'routeLayer',
          type: 'line',
          source: 'routeSource',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00d4ff',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        routeLayerRef.current = 'routeLayer';

        // Fit bounds
        const bounds = new window.tt.LngLatBounds();
        bounds.extend([startPos.lng, startPos.lat]);
        bounds.extend([finishPos.lng, finishPos.lat]);
        mapInstance.current.fitBounds(bounds, { padding: 100 });

        // Format summary
        const summaryText = route.summary
          ? `Distance: ${(route.summary.lengthInMeters / 1000).toFixed(1)} km\n` +
            `Travel Time: ${Math.round(route.summary.travelTimeInSeconds / 60)} minutes\n` +
            `Route Type: ${route.summary.routeType || 'Fastest'}`
          : 'Route calculated successfully!';

        setSummary(summaryText);
      } else {
        setSummary('No route found between these locations.');
      }

      setIsCalculating(false);
    } catch (error) {
      setSummary('Error calculating route: ' + error.message);
      setIsCalculating(false);
    }
  };

  return (
    <div className="modern-ev-routing">
      <div id="map" ref={mapRef} className="map-container"></div>
      
      {/* Side Panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="routing-sidebar glass"
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="sidebar-header">
              <h2>Plan EV Trip</h2>
              <button 
                className="close-btn"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="routing-form">
              <div className="form-group">
                <label htmlFor="start">
                  <MapPin size={18} />
                  Start Location
                </label>
                <input
                  id="start"
                  type="text"
                  placeholder="Enter starting point"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="finish">
                  <Navigation size={18} />
                  Destination
                </label>
                <input
                  id="finish"
                  type="text"
                  placeholder="Enter destination"
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && calculateRoute()}
                  className="modern-input"
                />
              </div>

              <motion.button
                className="route-btn"
                onClick={calculateRoute}
                disabled={isCalculating || !start || !finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isCalculating ? (
                  <>
                    <div className="spinner" />
                    Calculating Route...
                  </>
                ) : (
                  <>
                    <Route size={20} />
                    Calculate Route
                  </>
                )}
              </motion.button>

              {summary && (
                <button
                  className="clear-btn"
                  onClick={clearRoute}
                >
                  Clear Route
                </button>
              )}
            </div>

            {/* Route Summary */}
            {summary && (
              <motion.div
                className="route-summary glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="summary-header">
                  <TrendingUp size={20} />
                  <h3>Route Summary</h3>
                </div>
                <div className="summary-content">
                  {summary.split('\n').map((line, index) => (
                    <div key={index} className="summary-line">
                      {line}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Sidebar Button */}
      {!sidebarOpen && (
        <motion.button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Route size={20} />
        </motion.button>
      )}
    </div>
  );
};

export default ModernEVRouting;

