import React, { useState, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import config from 'src/config';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS
import './styles.css';

export default function LoginView() {
  const router = useRouter();
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${config.PORTAL_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (response.ok && result.code === 1000) {
        localStorage.setItem('authToken', result.data.accessToken);
        localStorage.setItem('userData', JSON.stringify(result.data));
        toast.success('Login successful!'); // Show success message
        router.push('/');
      } else {
        toast.error(`Error ${result.code}: ${result.message}`); // Show error message
      }
    } catch (error) {
      console.error('Login failed', error);
      toast.error('An unexpected error occurred.'); // Show error message
    } finally {
      setLoading(false);
    }
  };

  const [shouldRenderLogo, setShouldRenderLogo] = useState(true);

  useEffect(() => {
    setShouldRenderLogo(false);

    const timer = setTimeout(() => {
      setShouldRenderLogo(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showSignUp]);

  return (
    <div className={`container ${showSignUp ? 'sign-up-mode' : ''}`}>
      {shouldRenderLogo &&
        (showSignUp ? (
          <img src="/assets/logo.png" alt="Logo" className="logo top-left" />
        ) : (
          <img src="/assets/logo.png" alt="Logo" className="logo top-right" />
        ))}

      <div className={`container ${showSignUp ? 'sign-up-mode' : ''}`}>
        <img
          src="/assets/logo.png"
          alt="Logo"
          className={`logo ${showSignUp ? 'move-left' : 'move-right'}`}
        />
      </div>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Sign-In Form */}
          <form onSubmit={handleSignIn} className="sign-in-form">
            <h4 className="title">Welcome Back</h4>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn solid" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* About Us Section */}
          <form className="sign-up-form">
            <h2 className="title">About Us</h2>
            <div className="about-us-content">
              <p>
                Welcome to the **SMS Trivia Manager**—your ultimate tool for creating, managing, and
                analyzing SMS-based trivia campaigns.
              </p>
              <h3>Meet the Team</h3>
              <ul className="team-list">
                <li>
                  <strong>John Doe</strong> - Lead Developer
                  <br />
                  Email: <a href="mailto:john.doe@example.com">john.doe@example.com</a>
                </li>
                <li>
                  <strong>Jane Smith</strong> - UX Designer
                  <br />
                  Email: <a href="mailto:jane.smith@example.com">jane.smith@example.com</a>
                </li>
                <li>
                  <strong>Alex Johnson</strong> - Backend Engineer
                  <br />
                  Email: <a href="mailto:alex.johnson@example.com">alex.johnson@example.com</a>
                </li>
              </ul>
              <h3>Contact Us</h3>
              <p>For questions or support, reach out:</p>
              <ul className="support-contact">
                <li>
                  Email: <a href="mailto:support@example.com">support@example.com</a>
                </li>
                <li>Phone: +1 800-555-1234</li>
              </ul>
            </div>
          </form>
        </div>
      </div>

      {/* Panels Container */}
      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h1>SMS-Based Trivia Portal</h1>
            <p>
              Empowering businesses and communities with real-time engagement and insights through
              SMS-based trivia campaigns.
            </p>
            <button
              className="btn transparent"
              id="sign-up-btn"
              onClick={() => setShowSignUp(true)}
            >
              Learn More
            </button>
          </div>
          <img src="/assets/log.svg" className="image" alt="Login Illustration" />
        </div>

        <div className="panel right-panel">
          <div className="content">
            <h3>Already a Member?</h3>
            <p>Log in now to access your campaigns, analytics, and audience tools.</p>
            <button
              className="btn transparent"
              id="sign-in-btn"
              onClick={() => setShowSignUp(false)}
            >
              Log In
            </button>
          </div>
          <img src="/assets/register.svg" className="image" alt="About Us Illustration" />
        </div>
      </div>

      {/* Add Toast Container here */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeButton
      />
    </div>
  );
}
