import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, posterUrl } from '../api/api';
import './Browse.css';
import './Watchlist.css';

const Watchlist = ({ isSignedIn }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isSignedIn) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/watchlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWatchlist(response.data.movies);
        setError('');
      } catch (err) {
        console.error('Error fetching watchlist:', err);
        setError('Failed to load watchlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [isSignedIn]);

  const getPosterUrl = (poster) => {
    if (!poster) return null;
    return posterUrl(poster);
  };

  if (!isSignedIn) {
    return (
      <div className="cine-watchlist">
        <header className="cine-page-header">
          <h1 className="cine-page-title">My Watchlist</h1>
          <p className="cine-page-subtitle">Movies you&apos;ve saved to watch later.</p>
        </header>
        <div className="cine-watchlist-empty-box">
          <p style={{ marginBottom: '1.25rem', color: '#6b7280', fontSize: '0.95rem' }}>
            Please sign in to view your watchlist.
          </p>
          <Link to="/signin" className="cine-btn-primary-solid">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cine-watchlist">
        <header className="cine-page-header">
          <h1 className="cine-page-title">My Watchlist</h1>
          <p className="cine-page-subtitle">Movies you&apos;ve saved to watch later.</p>
        </header>
        <p className="cine-watchlist-loading">Loading…</p>
      </div>
    );
  }

  return (
    <div className="cine-watchlist">
      <header className="cine-page-header">
        <h1 className="cine-page-title">My Watchlist</h1>
        <p className="cine-page-subtitle">Movies you&apos;ve saved to watch later.</p>
      </header>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      {watchlist.length > 0 ? (
        <div className="cine-poster-grid">
          {watchlist.map((movie) => (
            <WatchlistPosterCard key={movie._id} movie={movie} posterUrl={getPosterUrl(movie.poster)} />
          ))}
        </div>
      ) : (
        <div className="cine-watchlist-empty-box">
          <div className="cine-watchlist-empty-icon" aria-hidden="true">
            <i className="fas fa-bookmark" />
          </div>
          <h2>Your watchlist is empty</h2>
          <p>
            Save movies to your watchlist to keep track of what you want to watch next.
          </p>
          <Link to="/browse" className="cine-btn-primary-solid">Browse Movies</Link>
        </div>
      )}
    </div>
  );
};

function WatchlistPosterCard({ movie, posterUrl }) {
  const [imgOk, setImgOk] = useState(!!posterUrl);

  return (
    <Link to={`/review/${movie._id}`} className="cine-poster-card">
      {imgOk && posterUrl ? (
        <img
          src={posterUrl}
          alt=""
          onError={() => setImgOk(false)}
        />
      ) : (
        <div className="cine-poster-placeholder">Image not available</div>
      )}
    </Link>
  );
}

export default Watchlist;
