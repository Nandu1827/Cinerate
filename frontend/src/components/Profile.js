import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, posterUrl } from '../api/api';
import './Profile.css';
import './Browse.css';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function persistUser(partial) {
  const cur = readStoredUser();
  const next = { ...cur, ...partial };
  localStorage.setItem('user', JSON.stringify(next));
  return next;
}

function initials(fullName) {
  if (!fullName?.trim()) return '?';
  const p = fullName.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return fullName.slice(0, 2).toUpperCase();
}

function memberSinceLabel(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function ProfilePosterCard({ movieId, poster }) {
  const url = poster ? posterUrl(poster) : null;
  const [imgOk, setImgOk] = useState(!!url);

  return (
    <Link to={`/review/${movieId}`} className="cine-poster-card">
      {imgOk && url ? (
        <img src={url} alt="" onError={() => setImgOk(false)} />
      ) : (
        <div className="cine-poster-placeholder">Image not available</div>
      )}
    </Link>
  );
}

const DEFAULT_BIO = 'Film enthusiast with a passion for movies.';

const Profile = ({ movies, userEmail, userFullName, onUserUpdate }) => {
  const [tab, setTab] = useState('watched');
  const [watchlist, setWatchlist] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [stored, setStored] = useState(readStoredUser);

  useEffect(() => {
    setStored(readStoredUser());
  }, [userEmail, userFullName]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/watchlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist(res.data.movies || []);
      } catch {
        setWatchlist([]);
      }
    };
    if (userEmail) load();
  }, [userEmail]);

  const userReviews = useMemo(
    () =>
      movies
        .map((movie) => ({
          movie,
          review: movie.reviews?.find((r) => r.userEmail === userEmail),
        }))
        .filter((x) => x.review),
    [movies, userEmail]
  );

  const displayName = (stored.fullName || userFullName || userEmail?.split('@')[0] || 'User').trim();
  const handleRaw = stored.username ?? userEmail?.split('@')[0] ?? 'user';
  const bio =
    stored.bio !== undefined && stored.bio !== null ? stored.bio : DEFAULT_BIO;

  const watchedCount = userReviews.length;
  const reviewsCount = userReviews.length;
  const watchlistCount = watchlist.length;
  const memberLabel = memberSinceLabel(stored.createdAt);

  const openEdit = () => {
    setEditName(displayName);
    setEditHandle(handleRaw);
    if (stored.bio !== undefined && stored.bio !== null) {
      setEditBio(stored.bio);
    } else {
      setEditBio(DEFAULT_BIO);
    }
    setEditing(true);
  };

  const saveEdit = () => {
    const next = persistUser({
      fullName: editName.trim(),
      username: editHandle.replace(/^@/, '').trim(),
      bio: editBio.trim(),
    });
    setStored(next);
    if (onUserUpdate) onUserUpdate();
    setEditing(false);
  };

  if (!userEmail) {
    return (
      <div className="cine-profile">
        <header className="cine-page-header">
          <h1 className="cine-page-title">Profile</h1>
          <p className="cine-page-subtitle">Your account and activity in one place.</p>
        </header>
        <div className="profile-container">
          <p>Please sign in to view your profile.</p>
          <Link to="/signin" className="cine-btn-primary-solid">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cine-profile">
      <div className="cine-profile-header">
        <div className="cine-profile-avatar-col">
          <div className="cine-profile-avatar" aria-hidden="true">
            {initials(displayName)}
          </div>
          <button type="button" className="cine-profile-edit" onClick={openEdit}>
            <i className="fas fa-pencil-alt" aria-hidden="true" />
            Edit Profile
          </button>
        </div>
        <div className="cine-profile-main">
          <div className="cine-profile-name-row">
            <h1 className="cine-profile-name">{displayName}</h1>
            <span className="cine-profile-handle">@{handleRaw}</span>
          </div>
          <p className="cine-profile-bio">{bio}</p>
          <div className="cine-profile-stats">
            <span className="cine-profile-stat">
              <i className="fas fa-film" aria-hidden="true" />
              {watchedCount} Watched
            </span>
            <span className="cine-profile-stat">
              <i className="fas fa-star" aria-hidden="true" />
              {reviewsCount} Reviews
            </span>
            <span className="cine-profile-stat">
              <i className="fas fa-bookmark" aria-hidden="true" />
              {watchlistCount} Watchlist
            </span>
            <span className="cine-profile-stat">
              <i className="fas fa-clock" aria-hidden="true" />
              Member since {memberLabel}
            </span>
          </div>
        </div>
      </div>

      {editing && (
        <div className="cine-profile-edit-form">
          <label htmlFor="edit-name">Display name</label>
          <input
            id="edit-name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <label htmlFor="edit-handle">Username (without @)</label>
          <input
            id="edit-handle"
            value={editHandle}
            onChange={(e) => setEditHandle(e.target.value)}
          />
          <label htmlFor="edit-bio">Bio</label>
          <textarea
            id="edit-bio"
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            placeholder={DEFAULT_BIO}
          />
          <div className="cine-profile-edit-actions">
            <button type="button" className="cine-profile-save" onClick={saveEdit}>
              Save
            </button>
            <button
              type="button"
              className="cine-profile-cancel"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="cine-profile-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'watched'}
          className={`cine-profile-tab${tab === 'watched' ? ' cine-profile-tab--active' : ''}`}
          onClick={() => setTab('watched')}
        >
          <i className="fas fa-film" aria-hidden="true" />
          Watched Movies
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'watchlist'}
          className={`cine-profile-tab${tab === 'watchlist' ? ' cine-profile-tab--active' : ''}`}
          onClick={() => setTab('watchlist')}
        >
          <i className="fas fa-bookmark" aria-hidden="true" />
          Watchlist
        </button>
      </div>

      {tab === 'watched' &&
        (userReviews.length > 0 ? (
          <div className="cine-profile-grid">
            {userReviews.map(({ movie }) => (
              <ProfilePosterCard key={movie._id} movieId={movie._id} poster={movie.poster} />
            ))}
          </div>
        ) : (
          <div className="cine-profile-panel-empty">
            <div className="cine-profile-panel-empty-icon">
              <i className="fas fa-film" aria-hidden="true" />
            </div>
            <h3>No watched movies yet</h3>
            <p>Start watching and rating movies to build your collection.</p>
            <Link to="/browse" className="cine-btn-primary-solid">
              Browse Movies
            </Link>
          </div>
        ))}

      {tab === 'watchlist' &&
        (watchlist.length > 0 ? (
          <div className="cine-profile-grid">
            {watchlist.map((movie) => (
              <ProfilePosterCard key={movie._id} movieId={movie._id} poster={movie.poster} />
            ))}
          </div>
        ) : (
          <div className="cine-profile-panel-empty">
            <div className="cine-profile-panel-empty-icon">
              <i className="fas fa-bookmark" aria-hidden="true" />
            </div>
            <h3>Your watchlist is empty</h3>
            <p>Save movies to your watchlist to keep track of what you want to watch next.</p>
            <Link to="/browse" className="cine-btn-primary-solid">
              Browse Movies
            </Link>
          </div>
        ))}
    </div>
  );
};

export default Profile;
