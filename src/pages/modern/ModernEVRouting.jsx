import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, MapPin, Navigation, X, Zap, Clock, Battery, TrendingUp, Locate } from 'lucide-react';
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
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
            const baseUrl = import.meta.env.BASE_URL;
            const chargingScript = document.createElement('script');
            chargingScript.src = `${baseUrl}chargingAvailability.js`;
            chargingScript.onload = () => {
              const routeScript = document.createElement('script');
              routeScript.src = `${baseUrl}calculateLongDistanceEVRoute.js`;
              routeScript.onload = () => {
                const modelScript = document.createElement('script');
                modelScript.src = `${baseUrl}ev_model.js`;
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address
        try {
          if (window.tt && window.tt.services) {
            const reverseGeocodeResults = await window.tt.services.reverseGeocode({
              key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
              position: { lat: latitude, lng: longitude }
            }).go();

            if (reverseGeocodeResults.addresses && reverseGeocodeResults.addresses.length > 0) {
              const address = reverseGeocodeResults.addresses[0].address;
              const addressString = address.freeformAddress || 
                                   `${address.streetName || ''} ${address.municipality || ''}`.trim() ||
                                   `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setStart(addressString);
            } else {
              setStart(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } else {
            setStart(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }

          // Fly to current location
          if (mapInstance.current && mapInstance.current.loaded()) {
            mapInstance.current.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 1500
            });
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setStart(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Error getting location: ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown error occurred.';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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

      // Extract coordinates - TomTom returns position as {lat, lng} object or [lng, lat] array
      let startLat, startLng, finishLat, finishLng;
      
      if (Array.isArray(startPos)) {
        // Array format: [lng, lat]
        startLng = startPos[0];
        startLat = startPos[1];
      } else {
        // Object format: {lat, lng} or {latitude, longitude}
        startLat = startPos.lat || startPos.latitude;
        startLng = startPos.lng || startPos.lon || startPos.longitude;
      }
      
      if (Array.isArray(finishPos)) {
        // Array format: [lng, lat]
        finishLng = finishPos[0];
        finishLat = finishPos[1];
      } else {
        // Object format: {lat, lng} or {latitude, longitude}
        finishLat = finishPos.lat || finishPos.latitude;
        finishLng = finishPos.lng || finishPos.lon || finishPos.longitude;
      }

      // Validate coordinates
      if (!startLat || !startLng || !finishLat || !finishLng) {
        console.error('Invalid coordinates:', { startPos, finishPos, startLat, startLng, finishLat, finishLng });
        setSummary('Error: Could not extract valid coordinates from locations. Please try different locations.');
        setIsCalculating(false);
        return;
      }

      // Validate coordinate ranges
      if (Math.abs(startLat) > 90 || Math.abs(finishLat) > 90 || 
          Math.abs(startLng) > 180 || Math.abs(finishLng) > 180) {
        setSummary('Error: Invalid coordinate values. Please check your locations.');
        setIsCalculating(false);
        return;
      }

      // Add markers - setLngLat expects [lng, lat] array format
      const startMarker = new window.tt.Marker({ color: '#39ff14' })
        .setLngLat([startLng, startLat])
        .addTo(mapInstance.current);
      
      const finishMarker = new window.tt.Marker({ color: '#ff006e' })
        .setLngLat([finishLng, finishLat])
        .addTo(mapInstance.current);

      markersRef.current.push(startMarker, finishMarker);

      // Calculate route - TomTom SDK expects array of position objects
      console.log('Calculating route with coordinates:', { startLat, startLng, finishLat, finishLng });
      console.log('Position objects:', { startPos, finishPos });
      
      // Create position objects in the format TomTom SDK expects: {lat, lng}
      const startLocation = { lat: startLat, lng: startLng };
      const finishLocation = { lat: finishLat, lng: finishLng };
      
      const routeResults = await window.tt.services.calculateRoute({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        locations: [startLocation, finishLocation], // Array of position objects
        travelMode: 'car',
        routeType: 'fastest'
      }).go();
      
      console.log('Route results:', routeResults);
      console.log('Route structure:', JSON.stringify(routeResults, null, 2));

      if (routeResults.routes && routeResults.routes.length > 0) {
        const route = routeResults.routes[0];
        console.log('Route object:', route);
        console.log('Route legs:', route.legs);

        // Extract coordinates from route geometry
        let coordinates = [];
        
        if (route.legs && route.legs.length > 0) {
          // Method 1: Extract from legs points
          route.legs.forEach(leg => {
            if (leg.points && leg.points.length > 0) {
              leg.points.forEach(point => {
                // Handle different point formats
                if (point.longitude !== undefined && point.latitude !== undefined) {
                  coordinates.push([point.longitude, point.latitude]);
                } else if (point.lng !== undefined && point.lat !== undefined) {
                  coordinates.push([point.lng, point.lat]);
                } else if (Array.isArray(point)) {
                  // Already in [lng, lat] format
                  coordinates.push(point);
                } else if (point instanceof window.tt.LngLat) {
                  coordinates.push([point.lng, point.lat]);
                }
              });
            }
          });
        } else if (route.geometry) {
          // Method 2: Use geometry if available
          if (route.geometry.coordinates) {
            coordinates = route.geometry.coordinates;
          } else if (route.geometry.points) {
            coordinates = route.geometry.points.map(point => {
              if (point.longitude !== undefined && point.latitude !== undefined) {
                return [point.longitude, point.latitude];
              } else if (point.lng !== undefined && point.lat !== undefined) {
                return [point.lng, point.lat];
              } else if (Array.isArray(point)) {
                return point;
              }
            });
          }
        }

        console.log('Extracted coordinates:', coordinates);
        console.log('Number of coordinate points:', coordinates.length);

        if (coordinates.length === 0) {
          setSummary('Error: Could not extract route geometry. Route calculated but cannot be displayed.');
          setIsCalculating(false);
          return;
        }

        // Remove existing route if present
        if (mapInstance.current.getSource('routeSource')) {
          if (mapInstance.current.getLayer('routeLayer')) {
            mapInstance.current.removeLayer('routeLayer');
          }
          mapInstance.current.removeSource('routeSource');
        }

        // Wait for map to be ready
        if (!mapInstance.current.loaded()) {
          mapInstance.current.once('load', () => {
            addRouteToMap(coordinates);
          });
        } else {
          addRouteToMap(coordinates);
        }

        function addRouteToMap(coords) {
          try {
            // Remove existing route if present
            if (mapInstance.current.getSource('routeSource')) {
              if (mapInstance.current.getLayer('routeLayer')) {
                mapInstance.current.removeLayer('routeLayer');
              }
              mapInstance.current.removeSource('routeSource');
            }

            mapInstance.current.addSource('routeSource', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: coords
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
                'line-width': 5,
                'line-opacity': 0.9
              }
            });

            routeLayerRef.current = 'routeLayer';
            console.log('Route layer added successfully');

            // Fit bounds after route is added - include all route points and markers
            setTimeout(() => {
              try {
                const bounds = new window.tt.LngLatBounds();
                // Add all route coordinates
                coords.forEach(coord => {
                  if (Array.isArray(coord) && coord.length === 2) {
                    bounds.extend(coord);
                  }
                });
                // Also include start and end markers
                bounds.extend([startLng, startLat]);
                bounds.extend([finishLng, finishLat]);
                mapInstance.current.fitBounds(bounds, { padding: 100, duration: 1000 });
              } catch (boundsError) {
                console.error('Error fitting bounds:', boundsError);
              }
            }, 100);
          } catch (error) {
            console.error('Error adding route to map:', error);
            setSummary('Route calculated but error displaying on map: ' + (error.message || error));
          }
        }

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
      console.error('Route calculation error:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status
      });
      
      let errorMessage = 'Error calculating route. ';
      
      // Handle different error types
      if (error?.response?.data) {
        // API error response with data
        const errorData = error.response.data;
        if (errorData.error?.message) {
          errorMessage += errorData.error.message;
        } else if (errorData.message) {
          errorMessage += errorData.message;
        } else if (error.response.status === 400) {
          errorMessage += 'Invalid request. Please check your start and destination locations.';
        } else if (error.response.status === 401) {
          errorMessage += 'API key authentication failed.';
        } else if (error.response.status === 403) {
          errorMessage += 'Access forbidden. Please check your API key permissions.';
        } else {
          errorMessage += `API error (${error.response.status}). Please try again.`;
        }
      } else if (error?.message) {
        errorMessage += error.message;
      } else if (typeof error === 'string') {
        errorMessage += error;
      } else {
        errorMessage += 'Please check your locations and try again. If the problem persists, the locations may be too far apart or unreachable by road.';
      }
      
      setSummary(errorMessage);
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
            initial={{ x: window.innerWidth <= 768 ? 0 : -400, y: window.innerWidth <= 768 ? '100%' : 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: window.innerWidth <= 768 ? 0 : -400, y: window.innerWidth <= 768 ? '100%' : 0 }}
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
                <div className="input-with-button">
                  <input
                    id="start"
                    type="text"
                    placeholder="Enter starting point"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="modern-input"
                  />
                  <motion.button
                    type="button"
                    className="current-location-btn-small"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation || isCalculating}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Use current location"
                  >
                    {isGettingLocation ? (
                      <div className="spinner-small" />
                    ) : (
                      <Locate size={16} />
                    )}
                  </motion.button>
                </div>
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

