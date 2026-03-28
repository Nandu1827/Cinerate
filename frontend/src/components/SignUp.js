import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api/api';
import './Auth.css';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState('user');
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

    if (accountType === 'admin') {
      setError('Administrator accounts are issued separately. Please use admin credentials to sign in.');
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) {
      setError('Please enter your first and last name.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/signup`, {
        fullName,
        email,
        password,
      });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed. Please try again.');
    }
  };

  return (
    <div className="cine-auth-page">
      <div className="cine-auth-card">
        <h1 className="cine-auth-card-title">Join CineRate</h1>
        <p className="cine-auth-card-sub">
          Create an account to rate movies and join the community
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

        {accountType === 'admin' && (
          <p className="cine-auth-admin-hint">
            New administrator accounts are not created here. Use your existing admin email and password on the sign-in page.
          </p>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cine-auth-row-2">
            <div className="cine-auth-field">
              <label htmlFor="signup-first">First name</label>
              <div className="cine-auth-input-wrap">
                <input
                  id="signup-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                  required={accountType === 'user'}
                  disabled={accountType === 'admin'}
                />
              </div>
            </div>
            <div className="cine-auth-field">
              <label htmlFor="signup-last">Last name</label>
              <div className="cine-auth-input-wrap">
                <input
                  id="signup-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                  required={accountType === 'user'}
                  disabled={accountType === 'admin'}
                />
              </div>
            </div>
          </div>

          <div className="cine-auth-field">
            <label htmlFor="signup-email">Email address</label>
            <div className="cine-auth-input-wrap">
              <i className="fas fa-envelope" aria-hidden="true" />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required={accountType === 'user'}
                disabled={accountType === 'admin'}
              />
            </div>
          </div>

          <div className="cine-auth-field">
            <label htmlFor="signup-password">Password</label>
            <div className="cine-auth-input-wrap">
              <i className="fas fa-lock" aria-hidden="true" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                required={accountType === 'user'}
                disabled={accountType === 'admin'}
              />
              <button
                type="button"
                className="cine-auth-toggle-pw"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={accountType === 'admin'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="cine-auth-field">
            <label htmlFor="signup-account-type">Account Type</label>
            <div className="cine-auth-select-wrap">
              <select
                id="signup-account-type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="user">Regular User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <button type="submit" className="cine-auth-submit" disabled={accountType === 'admin'}>
            Create Account
          </button>
        </form>

        <p className="cine-auth-terms">
          By signing up, you agree to our{' '}
          <Link to="/privacy">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </p>

        <p className="cine-auth-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
