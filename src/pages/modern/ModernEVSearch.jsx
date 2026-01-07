import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Zap, X, Navigation, Clock, Battery } from 'lucide-react';
import './ModernEVSearch.css';

const ModernEVSearch = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('10');
  const [isSearching, setIsSearching] = useState(false);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
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
            chargingScript.onload = initializeMap;
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
        name: 'EV Search',
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

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    setStations([]);
    setSelectedStation(null);
  };

  const findLocation = async () => {
    if (!mapInstance.current || !mapInstance.current.loaded()) {
      alert('Please try again later, map is still loading.');
      return;
    }

    setIsSearching(true);
    clearMarkers();

    if (!window.tt || !window.tt.services) {
      alert('TomTom services not loaded yet. Please wait.');
      setIsSearching(false);
      return;
    }

    try {
      const results = await window.tt.services.fuzzySearch({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        query: location
      }).go();

      if (results.results.length === 0) {
        alert('Could not find location (' + location + ').');
        setIsSearching(false);
        return;
      }

      const foundLocation = results.results[0];
      const radius = parseFloat(distance) * 1000;
      const center = foundLocation.position;

      mapInstance.current.flyTo({
        center: [center.lng, center.lat],
        zoom: 12
      });

      const stationResults = await window.tt.services.categorySearch({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        query: 'electric vehicle station',
        center: center,
        radius: radius,
        limit: 100
      }).go();

      createMarkers(stationResults);
      setIsSearching(false);
    } catch (error) {
      alert('Error: ' + error.message);
      setIsSearching(false);
    }
  };

  const createMarkers = (results) => {
    if (!results || results.results.length === 0) {
      alert('No charging stations were found.');
      return;
    }

    const stationsList = results.results.map(location => ({
      id: location.id,
      name: location.poi?.name || 'Charging Station',
      address: location.address.freeformAddress,
      position: location.position,
      distance: location.dist ? (location.dist / 1000).toFixed(1) : 'N/A'
    }));

    setStations(stationsList);

    const bounds = new window.tt.LngLatBounds();

    results.results.forEach((location, index) => {
      const station = stationsList[index];
      
      const popup = new window.tt.Popup({ offset: 10, maxWidth: '300px' })
        .setHTML(`
          <div class="popup-content">
            <h3>${station.name}</h3>
            <p>${station.address}</p>
            <p><strong>Distance:</strong> ${station.distance} km</p>
          </div>
        `);

      const marker = new window.tt.Marker({ 
        color: '#00d4ff',
        scale: 0.8
      })
        .setLngLat(location.position)
        .setPopup(popup)
        .addTo(mapInstance.current);

      marker.getElement().addEventListener('click', () => {
        setSelectedStation(station);
        setSidebarOpen(true);
      });

      markersRef.current.push(marker);
      bounds.extend([location.position.lng, location.position.lat]);
    });

    mapInstance.current.fitBounds(bounds, { padding: 100 });
  };

  return (
    <div className="modern-ev-search">
      <div id="map" ref={mapRef} className="map-container"></div>
      
      {/* Side Panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="search-sidebar glass"
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="sidebar-header">
              <h2>Find Charging Stations</h2>
              <button 
                className="close-btn"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="search-form">
              <div className="form-group">
                <label htmlFor="location">
                  <MapPin size={18} />
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="Enter city or address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && findLocation()}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="distance">
                  <Navigation size={18} />
                  Max Distance (km)
                </label>
                <input
                  id="distance"
                  type="number"
                  min="1"
                  max="100"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="modern-input"
                />
              </div>

              <motion.button
                className="search-btn"
                onClick={findLocation}
                disabled={isSearching || !location}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSearching ? (
                  <>
                    <div className="spinner" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Find Stations
                  </>
                )}
              </motion.button>

              {stations.length > 0 && (
                <button
                  className="clear-btn"
                  onClick={clearMarkers}
                >
                  Clear Results
                </button>
              )}
            </div>

            {/* Stations List */}
            {stations.length > 0 && (
              <div className="stations-list">
                <h3>{stations.length} Stations Found</h3>
                <div className="stations-scroll">
                  {stations.map((station) => (
                    <motion.div
                      key={station.id}
                      className={`station-card ${selectedStation?.id === station.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedStation(station);
                        mapInstance.current?.flyTo({
                          center: [station.position.lng, station.position.lat],
                          zoom: 15
                        });
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="station-icon">
                        <Zap size={20} />
                      </div>
                      <div className="station-info">
                        <h4>{station.name}</h4>
                        <p className="station-address">{station.address}</p>
                        <div className="station-meta">
                          <span>
                            <Navigation size={14} />
                            {station.distance} km
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
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
          <Search size={20} />
        </motion.button>
      )}

      {/* Station Detail Drawer */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div
            className="station-drawer glass"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="drawer-header">
              <div className="drawer-title">
                <Zap size={24} />
                <h3>{selectedStation.name}</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedStation(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="drawer-content">
              <div className="detail-item">
                <MapPin size={18} />
                <div>
                  <strong>Address</strong>
                  <p>{selectedStation.address}</p>
                </div>
              </div>
              <div className="detail-item">
                <Navigation size={18} />
                <div>
                  <strong>Distance</strong>
                  <p>{selectedStation.distance} km away</p>
                </div>
              </div>
              <div className="detail-item">
                <Battery size={18} />
                <div>
                  <strong>Charger Type</strong>
                  <p>Level 2 & DC Fast Charging</p>
                </div>
              </div>
              <div className="detail-item">
                <Clock size={18} />
                <div>
                  <strong>Estimated Time</strong>
                  <p>~30-45 minutes</p>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedStation.position.lat},${selectedStation.position.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-btn"
              >
                <Navigation size={20} />
                Get Directions
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernEVSearch;

