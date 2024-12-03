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
            <h6 className="title">Welcome 👋</h6>
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
            <h3 className="title">About Us</h3>
            <div className="about-us-content">
              <p>
                <strong>Welcome 👋!</strong> We're the VAS team, dedicated to crafting delightful
                tools that Add values to our customers experience.
              </p>
       

              {/* <br /> */}
              <br />
              {/* <br /> */}
              <h3>Meet the Team</h3>
              <ul className="team-list">
                <li>
                  <strong>Bereket Zelalem</strong>
                  <br />
                  {/* - VAS Systems Engineer and Developer<br /> */}
                  Email:{' '}
                  <a href="mailto:bereket.zelalem@example.com">bereket.zelalem@example.com</a>
                  <br />
                  Phone: <a href="tel:+251799214838">+251 799 214 838</a>
                </li>
                <li>
                  <strong>Yordanos Tesfay</strong>
                  <br />
                  Email:{' '}
                  <a href="mailto:yordanos.tesfay@partner.safaricom.et">
                    yordanos.tesfay@partner.safaricom.et
                  </a>
                  <br />
                  Phone: <a href="tel:+251799410131">+251 799 410 131</a>
                </li>
                <li>
                  <strong>Taddeal Moges</strong>
                  <br />
                  Email:{' '}
                  <a href="mailto:taddeal.moges@partner.safaricom.et">
                    taddeal.moges@partner.safaricom.et
                  </a>
                  <br />
                  Phone: <a href="tel:+251799410131">+251 799 400 512</a>
                </li>
                <li>
                  <strong>Yohannes Ademe</strong>
                  <br />
                  Email:{' '}
                  <a href="mailto:yohannes.ademe@safaricom.et">yohannes.ademe@safaricom.et</a>
                  <br />
                  Phone: <a href="tel:+251777777640">+251 777 777 640</a>
                </li>
              </ul>

              <br />
              <h3>Contact Us</h3>
              <p>
                For urgent issues, don't hesitate to reach out using the details below. Remember,
                we’re just a message away!
              </p>
              <ul className="support-contact">
                <li>
                  Email: <a href="mailto:vas.csb@safaricom.et">vas.csb@safaricom.et</a>
                </li>
                {/* <li>
                  Phone: <a href="tel:+2518005551234">+1 800-555-1234</a>
                </li> */}
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
            <br />
            <p>
              <strong>Engage. Challenge. Discover.</strong>
              {/* <br /> */}
              <br />
              Welcome to the <strong>SMS Trivia Manager Portal</strong>—your go-to hub for creating,
              managing our fun SMS trivia campaigns!
            </p>
            {/* <br /> */}
            <br />
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
            <h2>Already a Member?</h2>
            <br />
            <p>Log in now to access our campaigns, analytics, and audience tools.</p>
            <br />
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
