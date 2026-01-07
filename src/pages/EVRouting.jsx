import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './EVRouting.css';

const EVRouting = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);
  const [start, setStart] = useState('');
  const [finish, setFinish] = useState('');
  const [summary, setSummary] = useState('');

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

  const clearRoute = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    setSummary('');

    if (routeLayerRef.current && mapInstance.current.getLayer(routeLayerRef.current)) {
      mapInstance.current.removeLayer(routeLayerRef.current);
      mapInstance.current.removeSource('routeSource');
      routeLayerRef.current = null;
    }
  };

  const findStart = async () => {
    if (!mapInstance.current || !mapInstance.current.loaded()) {
      setSummary('Please try again later, map is still loading.');
      return;
    }

    clearRoute();

    if (!window.tt || !window.tt.services) {
      setSummary('TomTom services not loaded yet. Please wait.');
      return;
    }

    try {
      setSummary('Finding start location...');
      const startResults = await window.tt.services.fuzzySearch({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        query: start
      }).go();

      if (startResults.results.length === 0) {
        setSummary('Could not find start location (' + start + ').');
        return;
      }

      const startLocation = startResults.results[0];
      setSummary('Finding finish location...');

      const finishResults = await window.tt.services.fuzzySearch({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        query: finish
      }).go();

      if (finishResults.results.length === 0) {
        setSummary('Could not find finish location (' + finish + ').');
        return;
      }

      const finishLocation = finishResults.results[0];
      calculateRoute(startLocation, finishLocation);
    } catch (error) {
      setSummary('Error: ' + error.message);
    }
  };

  const calculateRoute = async (startLocation, finishLocation) => {
    setSummary('Calculating route...');

    try {
      if (!window.calculateLongDistanceEVRoute) {
        setSummary('Route calculation service not loaded yet.');
        return;
      }

      const routeData = await window.calculateLongDistanceEVRoute({
        key: 'btVdXlLhF1rgfMqkkAZv8aWClICR4ruk',
        locations: [startLocation.position, finishLocation.position],
        avoid: 'unpavedRoads',
        vehicleEngineType: 'electric',
        vehicleWeight: window.consumptionModel.vehicleWeight,
        accelerationEfficiency: window.consumptionModel.accelerationEfficiency,
        decelerationEfficiency: window.consumptionModel.decelerationEfficiency,
        uphillEfficiency: window.consumptionModel.uphillEfficiency,
        downhillEfficiency: window.consumptionModel.downhillEfficiency,
        constantSpeedConsumptionInkWhPerHundredkm: window.consumptionModel.constantSpeedConsumptionInkWhPerHundredkm,
        currentChargeInkWh: window.consumptionModel.currentChargeInkWh,
        maxChargeInkWh: window.consumptionModel.maxChargeInkWh,
        auxiliaryPowerInkW: window.consumptionModel.auxiliaryPowerInkW,
        minChargeAtDestinationInkWh: window.minChargeAtDestinationInkWh,
        minChargeAtChargingStopsInkWh: window.minChargeAtDestinationInkWh,
        chargingModes: window.chargingModes
      }).go();

      displayRoute(routeData, startLocation, finishLocation);
    } catch (error) {
      setSummary('Error calculating route: ' + (error.message || error));
    }
  };

  const displayRoute = (routeData, startLocation, finishLocation) => {
    setSummary('Formatting data for map...');

    const geoJson = routeData.toGeoJson();
    const route = routeData.routes[0];

    // Add route to map
    mapInstance.current.addSource('routeSource', { type: 'geojson', data: geoJson });
    mapInstance.current.addLayer({
      id: 'routeLayer',
      type: 'line',
      source: 'routeSource',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#224488', 'line-width': 6 }
    });
    routeLayerRef.current = 'routeLayer';

    // Add markers
    const startMarker = new window.tt.Marker({ color: 'green' })
      .setLngLat(startLocation.position)
      .addTo(mapInstance.current);
    markersRef.current.push(startMarker);

    const finishMarker = new window.tt.Marker({ color: 'red' })
      .setLngLat(finishLocation.position)
      .addTo(mapInstance.current);
    markersRef.current.push(finishMarker);

    // Fit bounds
    const bounds = new window.tt.LngLatBounds();
    bounds.extend(startLocation.position);
    bounds.extend(finishLocation.position);
    geoJson.features.forEach(feature => {
      feature.geometry.coordinates.forEach(coord => {
        bounds.extend(coord);
      });
    });
    mapInstance.current.fitBounds(bounds, { padding: 40 });

    // Display summary
    const summaryText = formatSummary(route.summary);
    setSummary(summaryText);
  };

  const formatSummary = (summary) => {
    let text = 'Route Summary:\n';
    if (summary.lengthInMeters) {
      text += `Travel Distance: ${(summary.lengthInMeters / 1000).toFixed(3)} km\n`;
    }
    if (summary.travelTimeInSeconds) {
      const hours = Math.floor(summary.travelTimeInSeconds / 3600);
      const minutes = Math.floor((summary.travelTimeInSeconds % 3600) / 60);
      const seconds = summary.travelTimeInSeconds % 60;
      text += `Travel Time: ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}\n`;
    }
    if (summary.batteryConsumptionInkWh) {
      text += `Battery Consumption: ${summary.batteryConsumptionInkWh.toFixed(4)} kWh\n`;
    }
    return text;
  };

  return (
    <div className="ev-routing-page">
      <div id="map" ref={mapRef} className="map"></div>
      <div id="controls" className="controls">
        <label htmlFor="start" className="loc">Starting Location:</label>
        <input
          className="text"
          id="start"
          type="text"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <br />
        <label htmlFor="finish" className="loc">Finish Location:</label>
        <input
          className="text"
          id="finish"
          type="text"
          value={finish}
          onChange={(e) => setFinish(e.target.value)}
        />
        <br />
        <input
          id="calculate"
          type="button"
          className="btn"
          value="Calculate Route"
          onClick={findStart}
        />
      </div>
      <div id="summary" className="summary">{summary}</div>
      <Link to="/" className="home-button">
        <img src={`${import.meta.env.BASE_URL}images/logo11.jpg`} alt="Home" />
      </Link>
    </div>
  );
};

export default EVRouting;

