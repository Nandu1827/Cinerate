import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api/api';
import './Navbar.css';

const Navbar = ({ isSignedIn, handleSignOut, isAdmin, theme, toggleTheme }) => {
  const location = useLocation();
  const profileWrapRef = useRef(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  useEffect(() => {
    const closeProfile = (e) => {
      if (profileWrapRef.current && !profileWrapRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closeProfile);
    return () => document.removeEventListener('mousedown', closeProfile);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await axios.get(`${API_URL}/notifications/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setUnreadCount(response.data.filter((n) => !n.isRead).length);
      } else {
        setUnreadCount(0);
      }
    } catch {
      setUnreadCount(0);
    }
  };

  const topRatedActive = location.pathname === '/browse' && location.search.includes('sortBy=rating');

  const navClassBrowse = ({ isActive }) => {
    const onBrowse = isActive && location.pathname === '/browse';
    const moviesActive = onBrowse && !location.search.includes('sortBy=rating');
    return `cine-nav-link${moviesActive ? ' cine-nav-link--active' : ''}`;
  };

  const navClassTopRated = () =>
    `cine-nav-link${topRatedActive ? ' cine-nav-link--active' : ''}`;

  const navClassDefault = ({ isActive }) =>
    `cine-nav-link${isActive ? ' cine-nav-link--active' : ''}`;

  const themeButton = (
    <li className="nav-item">
      <button
        type="button"
        className="cine-theme-toggle"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
      </button>
    </li>
  );

  return (
    <nav className="cine-navbar navbar navbar-expand-lg">
      <div className="container-fluid cine-nav-shell">
        <Link className="cine-navbar-brand cine-navbar-brand-split" to="/">
          <span className="cine-brand-dark">Cine</span>
          <span className="cine-brand-blue">Rate</span>
        </Link>

        <button
          className="navbar-toggler cine-nav-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse cine-nav-collapse" id="navbarNav">
          <ul className="navbar-nav cine-nav-center">
            <li className="nav-item">
              <NavLink className={navClassDefault} to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navClassBrowse} to="/browse">
                Movies
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navClassTopRated} to="/browse?sortBy=rating">
                Top Rated
              </NavLink>
            </li>
            {isSignedIn && (
              <li className="nav-item">
                <NavLink className={navClassDefault} to="/watchlist">
                  Watchlist
                </NavLink>
              </li>
            )}
            {!isAdmin && (
              <li className="nav-item">
                <NavLink className={navClassDefault} to="/contact">
                  Contact
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink className={navClassDefault} to="/admin">
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav cine-nav-actions ms-lg-auto">
            {!isAdmin && (
              <li className="nav-item d-none d-lg-block">
                <Link className="cine-nav-icon" to="/browse" title="Browse & filter">
                  <i className="fas fa-filter" aria-hidden="true" />
                </Link>
              </li>
            )}
            {isSignedIn ? (
              <>
                {themeButton}
                <li className="nav-item position-relative" ref={profileWrapRef}>
                  <button
                    type="button"
                    className={`cine-nav-profile-icon cine-nav-profile-trigger${isAdmin && unreadCount > 0 ? ' cine-nav-profile-trigger--badge' : ''}`}
                    onClick={() => setProfileMenuOpen((o) => !o)}
                    title="Account menu"
                    aria-label="Account menu"
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="true"
                  >
                    <i className="fas fa-user" aria-hidden="true" />
                    {isAdmin && unreadCount > 0 && (
                      <span className="cine-nav-profile-dot" aria-hidden="true" />
                    )}
                  </button>
                  {profileMenuOpen && (
                    <div className="cine-profile-dropdown" role="menu">
                      <Link
                        className="cine-profile-dropdown-item"
                        to="/profile"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <i className="fas fa-user-circle" aria-hidden="true" />
                        Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          className="cine-profile-dropdown-item cine-profile-dropdown-item--with-meta"
                          to="/notifications"
                          role="menuitem"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <span className="cine-profile-dropdown-item-main">
                            <i className="fas fa-bell" aria-hidden="true" />
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="cine-profile-dropdown-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
                          )}
                        </Link>
                      )}
                      <button
                        type="button"
                        className="cine-profile-dropdown-item cine-profile-dropdown-item--danger"
                        role="menuitem"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleSignOut();
                        }}
                      >
                        <i className="fas fa-sign-out-alt" aria-hidden="true" />
                        Log out
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="cine-nav-signin-outline" to="/signin">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="cine-btn-profile cine-btn-profile--ghost" to="/signup">
                    Sign Up
                  </Link>
                </li>
                {themeButton}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
