import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './EVSearch.css';

const EVSearch = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('10');

  useEffect(() => {
    // Load TomTom Maps SDK
    const loadTomTom = () => {
      if (window.tt) {
        initializeMap();
      } else {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/5.x/5.36.1/maps/maps.css';
        document.head.appendChild(link);

        // Load JS
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
        container: mapRef.current
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
  };

  const findLocation = async () => {
    if (!mapInstance.current || !mapInstance.current.loaded()) {
      alert('Please try again later, map is still loading.');
      return;
    }

    clearMarkers();

    if (!window.tt || !window.tt.services) {
      alert('TomTom services not loaded yet. Please wait.');
      return;
    }

    try {
      const results = await window.tt.services.fuzzySearch({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        query: location
      }).go();

      if (results.results.length === 0) {
        alert('Could not find location (' + location + ').');
        return;
      }

      const foundLocation = results.results[0];
      const radius = parseFloat(distance) * 1000;
      const center = foundLocation.position;

      const stationResults = await window.tt.services.categorySearch({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        query: 'electric vehicle station',
        center: center,
        radius: radius,
        limit: 100
      }).go();

      createMarkers(stationResults);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const createMarkers = (results) => {
    if (!results || results.results.length === 0) {
      alert('No charging stations were found.');
      return;
    }

    const bounds = new window.tt.LngLatBounds();

    results.results.forEach(location => {
      const popup = new window.tt.Popup({ offset: 10, maxWidth: 'none' })
        .setHTML(formatText(location));

      const marker = new window.tt.Marker({ color: 'blue' })
        .setLngLat(location.position)
        .setPopup(popup)
        .addTo(mapInstance.current);

      markersRef.current.push(marker);
      bounds.extend([location.position.lng, location.position.lat]);
    });

    mapInstance.current.fitBounds(bounds, { padding: 40 });
  };

  const formatText = (location) => {
    const div = document.createElement('div');
    const a = document.createElement('a');
    const link = document.createTextNode(location.address.freeformAddress);
    a.href = 'https://www.google.com/maps/search/?api=1&query=' + location.position.lat + ',' + location.position.lng;
    a.appendChild(link);
    div.appendChild(a);
    
    const h3 = document.createElement('h3');
    h3.textContent = 'Charging Station';
    div.appendChild(h3);
    
    const span = document.createElement('span');
    span.textContent = 'Address: ' + location.address.freeformAddress;
    div.appendChild(span);
    
    return div.innerHTML;
  };

  return (
    <div className="ev-search-page">
      <div id="map" ref={mapRef} className="map"></div>
      <div id="controls" className="controls">
        <label htmlFor="location" className="loc">Location:</label>
        <input
          className="text"
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <br />
        <label htmlFor="distance" className="loc">Maximum Distance (km):</label>
        <input
          className="text"
          id="distance"
          type="text"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        />
        <br />
        <input
          type="button"
          className="btn"
          value="Find Stations"
          onClick={findLocation}
        />
      </div>
      <Link to="/" className="home-button">
        <img src="/images/logo11.jpg" alt="Home" />
      </Link>
    </div>
  );
};

export default EVSearch;

