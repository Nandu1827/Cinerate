import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="cine-footer">
      <div className="cine-footer-inner">
        <div className="cine-footer-col cine-footer-brand">
          <Link to="/" className="cine-footer-logo">
            CineRate
          </Link>
          <p className="cine-footer-about">
            Discover films, share ratings, and connect with a community of movie lovers.
          </p>
          <div className="cine-footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fab fa-x-twitter" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <i className="fab fa-github" />
            </a>
          </div>
        </div>
        <div className="cine-footer-col">
          <h4 className="cine-footer-heading">Navigation</h4>
          <ul className="cine-footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/browse">Movies</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/signin">Sign In</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div className="cine-footer-col">
          <h4 className="cine-footer-heading">Legal</h4>
          <ul className="cine-footer-links">
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/privacy">Terms of Service</Link>
            </li>
            <li>
              <Link to="/privacy">Cookie Policy</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="cine-footer-bottom">
        <p>© {new Date().getFullYear()} CineRate. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
