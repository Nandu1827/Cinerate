import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api/api';
import './Auth.css';

const SignIn = ({ setIsAdmin, setIsSignedIn, setUserEmail, setUserFullName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSocial = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const endpoint =
        email === 'admin@example.com'
          ? `${API_URL}/users/admin/signin`
          : `${API_URL}/users/signin`;

      const response = await axios.post(endpoint, {
        email,
        password,
      });

      const { token, user, admin } = response.data;
      const userData = user || admin;

      if (!userData) {
        throw new Error('No user data received');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setIsSignedIn(true);
      setUserEmail(userData.email);
      setUserFullName(userData.fullName || userData.name || '');

      const isUserAdmin = userData.role === 'admin';
      setIsAdmin(isUserAdmin);

      setSuccess('Login successful!');

      setTimeout(() => {
        if (isUserAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 800);
    } catch (err) {
      console.error('Sign-in error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Sign in failed. Please try again.');
    }
  };

  return (
    <div className="cine-auth-page">
      <div className="cine-auth-card">
        <h1 className="cine-auth-card-title">Welcome Back</h1>
        <p className="cine-auth-card-sub">
          Sign in to rate movies and access your watchlist
        </p>

        <div className="cine-auth-social-stack">
          <button type="button" className="cine-auth-social-btn" onClick={handleSocial}>
            <i className="fab fa-facebook-f" aria-hidden="true" />
            Continue with Facebook
          </button>
          <button type="button" className="cine-auth-social-btn" onClick={handleSocial}>
            <i className="fab fa-x-twitter" aria-hidden="true" />
            Continue with Twitter
          </button>
          <button type="button" className="cine-auth-social-btn" onClick={handleSocial}>
            <i className="fab fa-github" aria-hidden="true" />
            Continue with Github
          </button>
        </div>

        <div className="cine-auth-divider">OR CONTINUE WITH EMAIL</div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cine-auth-field">
            <label htmlFor="signin-email">Email address</label>
            <div className="cine-auth-input-wrap">
              <i className="fas fa-envelope" aria-hidden="true" />
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>
          <div className="cine-auth-field">
            <div className="cine-auth-label-row">
              <label htmlFor="signin-password">Password</label>
              <a className="cine-auth-forgot" href="#forgot" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
            <div className="cine-auth-input-wrap">
              <i className="fas fa-lock" aria-hidden="true" />
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="cine-auth-toggle-pw"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
              </button>
            </div>
          </div>
          <button type="submit" className="cine-auth-submit">
            <i className="fas fa-sign-in-alt" aria-hidden="true" />
            Sign In
          </button>
        </form>

        <p className="cine-auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
