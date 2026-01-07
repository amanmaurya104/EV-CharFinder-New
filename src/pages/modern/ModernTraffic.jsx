import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Car, GitMerge, MapPin, X, AlertCircle, Layers } from 'lucide-react';
import './ModernTraffic.css';

const ModernTraffic = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const trafficIncidentsTierRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [incidentsEnabled, setIncidentsEnabled] = useState(false);
  const [flowEnabled, setFlowEnabled] = useState(false);
  const [location, setLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const loadTomTom = () => {
      if (window.tt) {
        initializeMap();
      } else {
        // Load CSS files
        const cssFiles = [
          'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.57.0/maps/maps.css',
          'https://api.tomtom.com/maps-sdk-for-web/cdn/plugins/SearchBox/2.23.1/SearchBox.css',
          'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.57.0/maps/css-styles/traffic-incidents.css',
          'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.57.0/maps/css-styles/routing.css',
          'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.57.0/maps/css-styles/poi.css'
        ];

        cssFiles.forEach(href => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          document.head.appendChild(link);
        });

        // Load JS files
        const script = document.createElement('script');
        script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.57.0/maps/maps-web.min.js';
        script.onload = () => {
          const servicesScript = document.createElement('script');
          servicesScript.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.57.0/services/services-web.min.js';
          servicesScript.onload = () => {
            const searchBoxScript = document.createElement('script');
            searchBoxScript.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/plugins/SearchBox/2.23.1/SearchBox-web.js';
            searchBoxScript.onload = () => {
              const baseUrl = import.meta.env.BASE_URL;
              const trafficScript = document.createElement('script');
              trafficScript.src = `${baseUrl}traffic.js`;
              trafficScript.onload = () => {
                // Prevent automatic initialization from traffic.js
                if (window.initApplication) {
                  // Store original initApplication
                  window._originalInitApplication = window.initApplication;
                  // Clear the automatic call
                  window.initApplication = null;
                }
                
                // Expose traffic.js functions to window for React access
                // Wait a bit for traffic.js to fully initialize
                setTimeout(() => {
                  // The functions should be available after traffic.js loads
                  // We'll access them through the map instance
                  initializeMap();
                }, 100);
              };
              document.body.appendChild(trafficScript);
            };
            document.body.appendChild(searchBoxScript);
          };
          document.body.appendChild(servicesScript);
        };
        document.body.appendChild(script);
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || mapInstance.current) return;

      const apiKey = "btVdXlLhF1rgfMqkkAZv8aWClICR4ruk";
      const centerCoords = [4.89218, 52.37187];
      const initialZoom = 13;

      mapInstance.current = window.tt.map({
        key: apiKey,
        container: mapRef.current,
        center: centerCoords,
        zoom: initialZoom
      });

      // Initialize traffic application after map loads
      mapInstance.current.on('load', () => {
        // Clear any existing search boxes first
        const searchPanel = document.getElementById('search-panel');
        if (searchPanel) {
          searchPanel.innerHTML = '';
        }
        
        // Set the map instance for traffic.js (override the one created in traffic.js)
        window.map = mapInstance.current;
        
        // Create traffic incidents tier for showing incidents on map
        if (window.tt && !trafficIncidentsTierRef.current) {
          try {
            trafficIncidentsTierRef.current = new window.tt.TrafficIncidentTier({
              key: "btVdXlLhF1rgfMqkkAZv8aWClICR4ruk",
              incidentDetails: {
                style: "s1"
              },
              incidentTiles: {
                style: "tomtom://vector/1/s1",
              },
              refresh: 30000
            });
            console.log('Traffic incidents tier created');
          } catch (error) {
            console.error('Error creating traffic incidents tier:', error);
          }
        }
        
        // Restore and call initApplication only once
        if (window._originalInitApplication && !window.trafficInitialized) {
          window.trafficInitialized = true;
          window.initApplication = window._originalInitApplication;
          window.initApplication();
          
          // Override onSearchBoxResult to handle location selection and show results
          if (window.onSearchBoxResult) {
            const originalOnSearchBoxResult = window.onSearchBoxResult;
            window.onSearchBoxResult = (result) => {
              // Call original function (handles map flyTo)
              originalOnSearchBoxResult(result);
              
              // Update React state with selected location and show traffic incidents
              if (result && result.data && result.data.result) {
                const resultData = result.data.result;
                const position = resultData.position;
                
                // Extract address information
                const address = resultData.address?.freeformAddress || 
                               resultData.poi?.name || 
                               resultData.address?.municipality ||
                               'Selected location';
                
                // Determine coordinates
                let coords;
                if (Array.isArray(position)) {
                  coords = [position[0], position[1]];
                } else {
                  coords = [position.lng || position.longitude, position.lat || position.latitude];
                }
                
                setSelectedLocation({
                  address: address,
                  position: position,
                  coords: coords
                });
                
                // Show traffic incidents on the map and in the list
                setTimeout(() => {
                  if (mapInstance.current && mapInstance.current.loaded()) {
                    console.log('Showing traffic incidents for location:', coords);
                    
                    // Add traffic incidents tier to map if not already added
                    if (trafficIncidentsTierRef.current) {
                      try {
                        // Check if tier is already added
                        const tierId = trafficIncidentsTierRef.current.getId();
                        const hasTier = mapInstance.current.getTier && mapInstance.current.getTier(tierId);
                        
                        if (!hasTier) {
                          mapInstance.current.addTier(trafficIncidentsTierRef.current);
                          console.log('Traffic incidents tier added to map');
                        }
                      } catch (error) {
                        console.error('Error adding traffic incidents tier:', error);
                      }
                    }
                    
                    // Enable traffic incidents toggle to match the state
                    const incidentsToggle = document.getElementById('incidents-toggle');
                    if (incidentsToggle && !incidentsToggle.checked) {
                      incidentsToggle.checked = true;
                      setIncidentsEnabled(true);
                      // Trigger change event for any listeners
                      const changeEvent = new Event('change', { bubbles: true });
                      incidentsToggle.dispatchEvent(changeEvent);
                    }
                    
                    // Create bounds around the selected location for incident details
                    const bounds = new window.tt.LngLatBounds();
                    bounds.extend(coords);
                    // Expand bounds to show nearby incidents (about 2km radius)
                    const expandedCoords1 = [coords[0] + 0.02, coords[1] + 0.02];
                    const expandedCoords2 = [coords[0] - 0.02, coords[1] - 0.02];
                    bounds.extend(expandedCoords1);
                    bounds.extend(expandedCoords2);
                    
                    // Show traffic incidents in the list for the selected area
                    // Try to use the displayTrafficIncidents function from traffic.js
                    if (window.displayTrafficIncidents && typeof window.displayTrafficIncidents === 'function') {
                      window.displayTrafficIncidents(bounds);
                    } else {
                      // Fallback: call incidentDetails API directly and populate list
                      window.tt.services.incidentDetails({
                        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
                        boundingBox: bounds,
                        style: 's1',
                        zoomLevel: parseInt(mapInstance.current.getZoom())
                      }).go().then(function(results) {
                        console.log('Traffic incidents results:', results);
                        // The incidents should appear on map via the tier
                        // Populate the list if we have results
                        if (results && results.tm && results.tm.poi) {
                          const incidentList = document.getElementById('incident-list');
                          if (incidentList) {
                            // Clear existing incidents
                            incidentList.innerHTML = '';
                            
                            // Add new incidents to list
                            results.tm.poi.forEach(function(incident) {
                              const incidentBtn = document.createElement('button');
                              incidentBtn.setAttribute('type', 'button');
                              incidentBtn.classList.add('list-group-item', 'list-group-item-action');
                              incidentBtn.textContent = incident.d || 'Traffic Incident';
                              incidentBtn.addEventListener('click', function() {
                                mapInstance.current.flyTo({
                                  center: incident.p,
                                  zoom: 15
                                });
                              });
                              incidentList.appendChild(incidentBtn);
                            });
                          }
                        }
                      }).catch(function(error) {
                        console.error('Error fetching traffic incidents:', error);
                      });
                    }
                    
                    // Fit map to show the location and nearby incidents
                    mapInstance.current.fitBounds(bounds, {
                      padding: 100,
                      duration: 1000
                    });
                  }
                }, 1000);
              }
            };
          }
        }
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

  useEffect(() => {
    // Handle traffic toggles
    if (mapInstance.current && mapInstance.current.loaded()) {
      const incidentsToggle = document.getElementById('incidents-toggle');
      const flowToggle = document.getElementById('flow-toggle');

      if (incidentsToggle) {
        incidentsToggle.checked = incidentsEnabled;
        incidentsToggle.addEventListener('change', (e) => {
          setIncidentsEnabled(e.target.checked);
        });
      }

      if (flowToggle) {
        flowToggle.checked = flowEnabled;
        flowToggle.addEventListener('change', (e) => {
          setFlowEnabled(e.target.checked);
        });
      }
    }
  }, [mapInstance.current, incidentsEnabled, flowEnabled]);

  const handleBoundingBox = () => {
    if (window.drawBoundingBox) {
      window.drawBoundingBox();
    }
  };

  return (
    <div className="modern-traffic">
      <div id="map" ref={mapRef} className="map-container"></div>
      
      {/* Side Panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="traffic-sidebar glass"
            initial={{ x: window.innerWidth <= 768 ? 0 : -400, y: window.innerWidth <= 768 ? '100%' : 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: window.innerWidth <= 768 ? 0 : -400, y: window.innerWidth <= 768 ? '100%' : 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="sidebar-header">
              <h2>Traffic Information</h2>
              <button 
                className="close-btn"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="traffic-form">
              {/* Location Search */}
              <div className="form-group">
                <label htmlFor="location-search">
                  <MapPin size={18} />
                  Choose your location
                </label>
                <div id="search-panel-container" className="search-container">
                  <div id="search-panel"></div>
                </div>
              </div>

              {/* Traffic Layers */}
              <div className="traffic-layers">
                <div className="section-title">
                  <Layers size={18} />
                  <span>Show traffic layers</span>
                </div>

                <div className="toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-icon">
                      <Car size={20} />
                    </div>
                    <label htmlFor="incidents-toggle" className="toggle-label">
                      Traffic incidents
                    </label>
                    <label className="switch">
                      <input 
                        id="incidents-toggle" 
                        type="checkbox"
                        checked={incidentsEnabled}
                        onChange={(e) => setIncidentsEnabled(e.target.checked)}
                      />
                      <span className="toggle round"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-icon">
                      <GitMerge size={20} />
                    </div>
                    <label htmlFor="flow-toggle" className="toggle-label">
                      Traffic flow
                    </label>
                    <label className="switch">
                      <input 
                        id="flow-toggle" 
                        type="checkbox"
                        checked={flowEnabled}
                        onChange={(e) => setFlowEnabled(e.target.checked)}
                      />
                      <span className="toggle round"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bounding Box */}
              <div className="bounding-box-section">
                <div className="section-title">
                  <AlertCircle size={18} />
                  <span>Bounding box for traffic incidents</span>
                </div>
                <motion.button
                  className="bounding-box-btn"
                  onClick={handleBoundingBox}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Draw Bounding Box
                </motion.button>
              </div>

              {/* Selected Location Info */}
              {selectedLocation && (
                <motion.div
                  className="selected-location-info glass"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="location-info-header">
                    <MapPin size={16} />
                    <span>Selected Location</span>
                  </div>
                  <div className="location-info-content">
                    <p className="location-address">{selectedLocation.address}</p>
                    <button
                      className="clear-location-btn"
                      onClick={() => setSelectedLocation(null)}
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Incident List */}
              <div id="incident-list-wrapper" className="incident-list-wrapper">
                <div className="incident-list-header">
                  <AlertCircle size={16} />
                  <span>Traffic Incidents</span>
                </div>
                <div id="incident-list-container" className="incident-list-container">
                  <div className="list-group" id="incident-list"></div>
                </div>
              </div>

              {/* Traffic Flow Legend */}
              <div className="traffic-legend">
                <div className="legend-header">
                  <Activity size={18} />
                  <span>Traffic Flow</span>
                </div>
                <div className="legend-labels">
                  <span className="legend-label">Congested</span>
                  <span className="legend-label">Free</span>
                </div>
                <div className="legend-colors">
                  <div className="legend-color" style={{ backgroundColor: '#6e6e6e' }}></div>
                  <div className="legend-color" style={{ backgroundColor: 'rgba(245, 8, 2, 0.5)' }}></div>
                  <div className="legend-color" style={{ backgroundColor: '#ff2323' }}></div>
                  <div className="legend-color" style={{ backgroundColor: '#fad900' }}></div>
                  <div className="legend-color" style={{ backgroundColor: '#ffff37' }}></div>
                  <div className="legend-color" style={{ backgroundColor: '#2bc82b' }}></div>
                </div>
              </div>
            </div>
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
          <Activity size={20} />
        </motion.button>
      )}

      {/* Popup Wrapper */}
      <div id="popup-wrapper"></div>
    </div>
  );
};

export default ModernTraffic;

