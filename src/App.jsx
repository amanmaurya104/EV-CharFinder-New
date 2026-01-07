import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import ModernNavbar from './components/modern/ModernNavbar';
import ModernFooter from './components/modern/ModernFooter';
import LoadingSkeleton from './components/modern/LoadingSkeleton';
import './styles/design-system.css';
import './App.css';

// Lazy load pages for code splitting and optimization
const Home = lazy(() => import('./pages/modern/ModernHome'));
const Login = lazy(() => import('./pages/Login'));
const EVSearch = lazy(() => import('./pages/modern/ModernEVSearch'));
const EVRouting = lazy(() => import('./pages/modern/ModernEVRouting'));
const Traffic = lazy(() => import('./pages/Traffic'));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
  };

  return (
    <Router
      basename="/EV-CharFinder-New"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <ModernNavbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <Suspense fallback={<LoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
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
