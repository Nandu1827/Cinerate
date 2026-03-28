import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Review = ({ movies, setMovies, isSignedIn, userEmail, userFullName }) => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [emotionTag, setEmotionTag] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`http://localhost:15400/api/movies/${movieId}`);
        setMovie(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching movie:', error);
        setError('Failed to load movie details');
      }
    };

    const checkWatchlistStatus = async () => {
      if (isSignedIn) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:15400/api/watchlist', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsInWatchlist(response.data.movies.some(m => m._id === movieId));
        } catch (error) {
          console.error('Error checking watchlist status:', error);
        }
      }
    };

    fetchMovie();
    checkWatchlistStatus();
  }, [movieId, isSignedIn]);

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 'No reviews';
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return avg.toFixed(1);
  };

  const getPosterUrl = (poster) => {
    if (!poster) return '/default-poster.jpg';
    if (poster.startsWith('http')) return poster;
    return `http://localhost:15400${poster}`;
  };

  const hasReviewed = movie?.reviews?.some(review => review.userEmail === userEmail) || false;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment) {
      setError('Please provide a rating and comment.');
      setSuccessMessage('');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:15400/api/movies/${movieId}/review`,
        { 
          rating, 
          comment, 
          fullName: userFullName, 
          emotionTag: emotionTag || null 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedMovie = response.data.movie;
      setMovie(updatedMovie);
      setMovies(movies.map(m => (m._id === movieId ? updatedMovie : m)));

      setRating(0);
      setComment('');
      setEmotionTag('');
      setSuccessMessage('Review submitted successfully!');
      setError('');
      setTimeout(() => {
        navigate('/browse');
      }, 1000);
    } catch (error) {
      console.error('Error submitting review:', error.response || error.message);
      setError(error.response?.data?.message || 'Error submitting review. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleWatchlistToggle = async () => {
    if (!isSignedIn) {
      navigate('/signin');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (isInWatchlist) {
        await axios.delete(`http://localhost:15400/api/watchlist/${movieId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Movie removed from watchlist');
      } else {
        await axios.post(`http://localhost:15400/api/watchlist/${movieId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Movie added to watchlist');
      }
      setIsInWatchlist(!isInWatchlist);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating watchlist');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!movie) {
    return (
      <div className="review-page">
        <p className="review-loading">Loading…</p>
      </div>
    );
  }

  // Sort reviews from latest to oldest
  const sortedReviews = movie.reviews
    ? [...movie.reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  return (
    <div className="review-page">
      <header className="cine-page-header">
        <h1 className="cine-page-title">{movie.name}</h1>
        <p className="cine-page-subtitle">
          {movie.releaseYear}
          {movie.genre ? ` · ${movie.genre}` : ''}
        </p>
      </header>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <div className="review-container mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="d-flex flex-wrap gap-4 mb-5">
          <img
            src={getPosterUrl(movie.poster)}
            alt={`${movie.name} poster`}
            className="review-poster rounded shadow"
            style={{ maxWidth: '300px' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-poster.jpg';
            }}
          />
          <div className="review-details flex-grow-1">
            <div className="d-flex justify-content-end mb-3">
              <button
                type="button"
                onClick={handleWatchlistToggle}
                className={`cine-review-watchlist-btn${isInWatchlist ? ' cine-review-watchlist-btn--remove' : ''}`}
                aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <i className="fas fa-bookmark" aria-hidden="true" />
              </button>
            </div>
            <p className="mb-2 review-meta-line">
              ⭐ {getAverageRating(movie.reviews)} ({movie.reviews?.length ?? 0} reviews)
            </p>
            <p className="mb-4 review-desc">{movie.description}</p>

            {/* Review Submission Form */}
            {isSignedIn ? (
              hasReviewed ? (
                <p className="review-message mb-4">You've already reviewed this movie.</p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="review-form p-4 mb-5" style={{ width: '100%' }}>
                  <h5 className="mb-4">Rate & Review</h5>
                  {error && <div className="error-message mb-3">{error}</div>}
                  {successMessage && <div className="success-message mb-3">{successMessage}</div>}
                  <div className="input-group mb-3 d-flex align-items-center">
                    <label className="me-3" style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>
                      Your Rating:
                    </label>
                    <div className="star-rating d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{ fontSize: '2rem' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="input-group mb-3">
                    <label htmlFor="emotionTag" className="d-block mb-2" style={{ fontSize: '1rem' }}>
                      How did you feel?
                    </label>
                    <select
                      id="emotionTag"
                      className="form-select filter-select"
                      value={emotionTag}
                      onChange={(e) => setEmotionTag(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        height: '50px',
                        borderRadius: '10px',
                        border: '1px solid #ced4da',
                        padding: '0 40px 0 15px',
                        fontSize: '1.1rem',
                        backgroundColor: '#fff',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                        appearance: 'none',
                        cursor: 'pointer',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 15px center',
                        backgroundSize: '20px',
                      }}
                    >
                      <option value="">Select an emotion</option>
                      <option value="Happy">Happy</option>
                      <option value="Sad">Sad</option>
                      <option value="Scary">Scary</option>
                      <option value="Thrilled">Thrilled</option>
                      <option value="Funny">Funny</option>
                      <option value="Romantic">Romantic</option>
                    </select>
                  </div>
                  <div className="input-group mb-3">
                    <textarea
                      id="comment"
                      className="form-control search-input"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your review here..."
                      rows="4"
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <button type="submit" className="auth-button w-100">Submit Review</button>
                </form>
              )
            ) : (
              <p className="signin-prompt mb-4">
                Please <Link to="/signin" className="text-decoration-none">sign in</Link> to leave a review.
              </p>
            )}

            {/* Reviews Section */}
            <h5 className="mb-4">Reviews</h5>
            {sortedReviews.length > 0 ? (
              <div>
                {sortedReviews.map((review, index) => (
                  <div key={index} className="review-item p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>{review.fullName}</strong>
                        <span className="ms-2">⭐ {review.rating}</span>
                        {review.emotionTag && (
                          <span className="ms-2 emotion-tag">{review.emotionTag}</span>
                        )}
                      </div>
                      <small className="text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="mb-0">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No reviews yet. Be the first to review this movie!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;