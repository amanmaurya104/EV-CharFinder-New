import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Traffic.css';

const Traffic = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    // Load ionicons
    const ioniconsModule = document.createElement('script');
    ioniconsModule.type = 'module';
    ioniconsModule.src = 'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js';
    document.head.appendChild(ioniconsModule);

    const ioniconsNoModule = document.createElement('script');
    ioniconsNoModule.nomodule = true;
    ioniconsNoModule.src = 'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js';
    document.head.appendChild(ioniconsNoModule);

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
              const trafficScript = document.createElement('script');
              trafficScript.src = '/traffic.js';
              trafficScript.onload = initializeMap;
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
        if (window.initApplication) {
          window.initApplication();
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
    // Handle map click to hide sidebar
    if (mapInstance.current) {
      const handleMapClick = () => {
        setSidebarVisible(false);
      };
      mapInstance.current.on('click', handleMapClick);
      return () => {
        if (mapInstance.current) {
          mapInstance.current.off('click', handleMapClick);
        }
      };
    }
  }, [mapInstance.current]);

  return (
    <div className="traffic-page">
      <div id="map" ref={mapRef} className="map"></div>
      <div className={`sidebar ${sidebarVisible ? '' : 'hidden'}`}>
        <div id="secondary-row" className="row">
          <div className="col pt-3 label">
            <span>Choose your location</span>
            <div id="search-panel-container" className="row">
              <div id="search-panel" className="container-fluid pb-4"></div>
            </div>
          </div>
        </div>
        <div className="row row-border">
          <div className="col py-3 label">
            <span className="show-traffic-layers">Show traffic layers</span>
            <div className="row align-items-center pt-2">
              <div className="col-sm-2">
                <ion-icon name="car-sport"></ion-icon>
              </div>
              <div className="col pt-2">
                <label htmlFor="incidents-toggle" className="traffic-text">Traffic incidents</label>
              </div>
              <div className="col-sm-3 pt-2 text-right">
                <label className="switch">
                  <input id="incidents-toggle" type="checkbox" />
                  <span className="toggle round"></span>
                </label>
              </div>
            </div>
            <div className="row align-items-center pt-2">
              <div className="col-sm-2">
                <ion-icon name="git-merge-outline"></ion-icon>
              </div>
              <div className="col pt-2">
                <label htmlFor="flow-toggle" className="traffic-text">Traffic flow</label>
              </div>
              <div className="col-sm-3 pt-2 text-right">
                <label className="switch">
                  <input id="flow-toggle" type="checkbox" />
                  <span className="toggle round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="py-3 row row-border">
          <div className="col">
            <span className="show-traffic-layers">Bounding box for traffic incidents</span>
            <button id="bounding-box-button" type="button" className="btn btn-block my-2">
              DRAW BOUNDING BOX
            </button>
          </div>
        </div>
        <div id="incident-list-wrapper" className="row pt-0">
          <div className="col">
            <div id="incident-list-container" className="p-0">
              <div className="list-group" id="incident-list"></div>
            </div>
          </div>
        </div>
        <div id="last-row" className="row mt-2 pt-4 row-border">
          <div className="col">
            <div className="row py-2">
              <div className="pl-3 col-sm-10">
                <span className="legend-font">Congested</span>
              </div>
              <div className="col">
                <span className="legend-font">Free</span>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <div className="row mx-0">
                  <div className="col">
                    <div className="row border py-2" style={{ backgroundColor: '#6e6e6e' }}></div>
                  </div>
                  <div className="col ml-1">
                    <div className="row border py-2" style={{ backgroundColor: 'rgba(245, 8, 2, 0.5)' }}></div>
                  </div>
                  <div className="col ml-1">
                    <div className="row border py-2" style={{ backgroundColor: '#ff2323' }}></div>
                  </div>
                  <div className="col ml-1">
                    <div className="row border py-2" style={{ backgroundColor: '#fad900' }}></div>
                  </div>
                  <div className="col ml-1">
                    <div className="row border py-2" style={{ backgroundColor: '#ffff37' }}></div>
                  </div>
                  <div className="col ml-1">
                    <div className="row border py-2" style={{ backgroundColor: '#2bc82b' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="show-sidebar-btn"
        className={`show-sidebar-btn ${sidebarVisible ? 'hidden' : ''}`}
        onClick={() => setSidebarVisible(true)}
      >
        Show Sidebar
      </div>
      <div id="popup-wrapper"></div>
      <Link to="/" className="home-button">
        <img src="/images/logo11.jpg" alt="Home" />
      </Link>
    </div>
  );
};

export default Traffic;

