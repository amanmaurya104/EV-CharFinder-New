import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const PUBLISHABLE_KEY = "pk_test_Z2VudWluZS1kZWVyLTExLmNsZXJrLmFjY291bnRzLmRldiQ";

    const initClerk = async () => {
      if (window.Clerk) {
        await window.Clerk.load({ publishableKey: PUBLISHABLE_KEY });

        if (window.Clerk.user) {
          document.getElementById("sign-in").innerHTML = `<p>Welcome, ${window.Clerk.user.fullName}!</p>`;
          document.getElementById("logout").style.display = "block";
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', window.Clerk.user.fullName || 'User');
          onLogin();
          navigate('/');
        } else {
          window.Clerk.mountSignIn(document.getElementById("sign-in"));
        }

        document.getElementById("logout").addEventListener("click", async () => {
          await window.Clerk.signOut();
          localStorage.setItem('isLoggedIn', 'false');
          navigate('/login');
        });
      }
    };

    // Load Clerk script if not already loaded
    if (!window.Clerk) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.js';
      script.async = true;
      script.onload = initClerk;
      document.head.appendChild(script);
    } else {
      initClerk();
    }
  }, [navigate, onLogin]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Login</h1>
          <div id="sign-in"></div>
          <button id="logout" style={{ display: 'none' }}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Login;

