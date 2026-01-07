import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ModernNavbar from './components/modern/ModernNavbar';
import ModernFooter from './components/modern/ModernFooter';
import LoadingSkeleton from './components/modern/LoadingSkeleton';
import './styles/design-system.css';
import './App.css';

// Lazy load pages for code splitting and optimization
const Home = lazy(() => import('./pages/modern/ModernHome'));
const EVSearch = lazy(() => import('./pages/modern/ModernEVSearch'));
const EVRouting = lazy(() => import('./pages/modern/ModernEVRouting'));
const Traffic = lazy(() => import('./pages/modern/ModernTraffic'));

function App() {
  return (
    <Router
      basename="/EV-CharFinder-New"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <ModernNavbar />
        <Suspense fallback={<LoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<EVSearch />} />
            <Route path="/routing" element={<EVRouting />} />
            <Route path="/traffic" element={<Traffic />} />
          </Routes>
        </Suspense>
        <ModernFooter />
      </div>
    </Router>
  );
}

export default App;
