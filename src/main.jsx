import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Handle GitHub Pages 404 redirect
// When GitHub Pages serves a 404, it redirects to /?/path
// We need to convert this back to a normal path for React Router
if (window.location.search.includes('?/')) {
  const path = window.location.search.replace('?/', '').replace(/~and~/g, '&');
  window.history.replaceState({}, '', window.location.pathname + path);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
