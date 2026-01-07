# EV CharFinder - React Version

A modern React application for finding EV charging stations, calculating routes, and detecting traffic.

## Features

- 🚗 **Search Charging Stations** - Find nearby EV charging stations using TomTom Maps API
- 🗺️ **Route Finding** - Calculate optimal EV routes with charging stops
- 🚦 **Traffic Detection** - Real-time traffic information and incident detection
- 🎨 **Modern UI/UX** - Beautiful animations and Vanta.js Clouds2 background
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔐 **Authentication** - Clerk-based login system

## Technologies Used

- **React 19** - Modern React with hooks
- **React Router** - Client-side routing
- **Vanta.js** - Animated background effects (Clouds2)
- **Framer Motion** - Smooth animations
- **TomTom Maps API** - Maps and location services
- **Clerk** - Authentication
- **SweetAlert2** - Beautiful alerts
- **Font Awesome** - Icons

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable components (Navbar, Footer)
├── pages/           # Page components (Home, Login, EVSearch, etc.)
├── App.jsx          # Main app component with routing
├── App.css          # Global app styles
└── index.css        # Base styles and fonts

public/
├── images/          # All project images
├── gallery/         # Vanta.js assets
└── *.js            # TomTom API helper scripts
```

## Key Features Implemented

### 1. Home Page
- Vanta.js Clouds2 animated background
- Hero section with animations
- Services showcase
- Stations and ports information
- About section

### 2. EV Search
- TomTom map integration
- Search for charging stations by location
- Distance-based filtering
- Interactive markers with station details

### 3. EV Routing
- Long-distance EV route calculation
- Battery consumption estimation
- Charging stop recommendations
- Route visualization on map

### 4. Traffic Detection
- Real-time traffic flow visualization
- Traffic incident detection
- Bounding box selection for area analysis
- Interactive traffic layers

## Fonts Used

- **Inter** - Primary font for body text
- **Space Grotesk** - Headings and titles

## Animations

- Framer Motion for smooth page transitions
- CSS animations for hover effects
- Scroll-triggered animations
- Vanta.js background animations

## Notes

- The Vanta.js Clouds2 background requires a noise.png texture file in `/public/gallery/`
- TomTom API key is included in the code (consider using environment variables in production)
- Clerk authentication key is included (consider using environment variables in production)

## Created By

Aman Maurya and Anantkumar Shrivastav
