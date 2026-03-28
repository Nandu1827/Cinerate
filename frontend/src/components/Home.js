import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ movies, userEmail, isSignedIn }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const getPosterUrl = (poster) => {
    if (!poster) return '/default-poster.jpg';
    if (poster.startsWith('http')) return poster;
    return `http://localhost:15400${poster}`;
  };

  const avgRating = (movie) => {
    if (!movie.reviews || movie.reviews.length === 0) return null;
    const avg = movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length;
    return avg;
  };

  /** Display as x/10 style for parity with typical movie sites */
  const displayScore = (movie) => {
    const a = avgRating(movie);
    if (a == null) return '—';
    return (a * 2).toFixed(1);
  };

  const hasReviewed = (movie) =>
    movie.reviews.some((review) => review.userEmail === userEmail);

  const genreList = (movie) => {
    if (!movie.genre) return [];
    return movie.genre.split(/[,/]/).map((g) => g.trim()).filter(Boolean);
  };

  const sortedByRating = useMemo(() => {
    const list = [...movies];
    list.sort((a, b) => {
      const ra = avgRating(a);
      const rb = avgRating(b);
      if (ra == null && rb == null) return 0;
      if (ra == null) return 1;
      if (rb == null) return -1;
      return rb - ra;
    });
    return list;
  }, [movies]);

  const trendingFeatured = sortedByRating[0] || movies[0];
  const trendingSide = useMemo(() => {
    const pool = sortedByRating.length ? sortedByRating : movies;
    const skip = trendingFeatured ? [trendingFeatured._id] : [];
    return pool.filter((m) => !skip.includes(m._id)).slice(0, 4);
  }, [sortedByRating, movies, trendingFeatured]);

  const carouselMovies = useMemo(() => movies.slice(0, 12), [movies]);
  const maxCarousel = Math.max(0, carouselMovies.length - 3);

  const slideCarousel = useCallback(
    (dir) => {
      setCarouselIndex((i) => {
        const next = i + dir;
        if (next < 0) return maxCarousel;
        if (next > maxCarousel) return 0;
        return next;
      });
    },
    [maxCarousel]
  );

  return (
    <div className="cine-home">
      <section className="cine-hero">
        <div className="cine-hero-inner">
          <span className="cine-badge">Discover · Rate · Review</span>
          <h1 className="cine-hero-title">Your Ultimate Movie Rating Experience</h1>
          <p className="cine-hero-sub">
            Discover new films, share your thoughts, and connect with a community of movie enthusiasts.
          </p>
          <div className="cine-hero-actions">
            <Link to="/browse" className="cine-btn cine-btn-primary">
              Browse Movies <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            {!isSignedIn && (
              <Link to="/signup" className="cine-btn cine-btn-outline">
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="cine-section cine-trending">
        <div className="cine-container">
          <header className="cine-section-head">
            <h2>Trending Now</h2>
            <p>The hottest movies everyone&apos;s watching.</p>
          </header>
          {movies.length > 0 && trendingFeatured ? (
            <div className="cine-trending-grid">
              <article className="cine-featured-card">
                <Link to={`/review/${trendingFeatured._id}`} className="cine-featured-link">
                  <div className="cine-featured-media">
                    <img
                      src={getPosterUrl(trendingFeatured.poster)}
                      alt=""
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-poster.jpg';
                      }}
                    />
                    <div className="cine-featured-overlay">
                      <div className="cine-featured-top">
                        {isSignedIn && hasReviewed(trendingFeatured) && (
                          <span className="cine-mini-pill">Reviewed</span>
                        )}
                      </div>
                      <div className="cine-featured-bottom">
                        <div className="cine-featured-rating">
                          <i className="fas fa-star" aria-hidden="true" />
                          <span>{displayScore(trendingFeatured)}</span>
                        </div>
                        <h3>{trendingFeatured.name}</h3>
                        <p className="cine-featured-desc">
                          {trendingFeatured.description
                            ? trendingFeatured.description.slice(0, 160) +
                              (trendingFeatured.description.length > 160 ? '…' : '')
                            : 'See details and community reviews for this title.'}
                        </p>
                        <div className="cine-featured-meta">
                          <div className="cine-genre-tags">
                            {genreList(trendingFeatured).slice(0, 4).map((g) => (
                              <span key={g}>{g}</span>
                            ))}
                          </div>
                          <span className="cine-year">{trendingFeatured.releaseYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
              <div className="cine-trending-side">
                {trendingSide.map((movie) => (
                  <Link
                    key={movie._id}
                    to={`/review/${movie._id}`}
                    className="cine-trending-thumb"
                  >
                    <img
                      src={getPosterUrl(movie.poster)}
                      alt=""
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-poster.jpg';
                      }}
                    />
                  </Link>
                ))}
                {trendingSide.length < 4 &&
                  Array.from({ length: 4 - trendingSide.length }).map((_, i) => (
                    <div key={`ph-${i}`} className="cine-trending-thumb cine-thumb-placeholder">
                      <span>Image not available</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="cine-empty">No movies yet. Check back soon.</p>
          )}
        </div>
      </section>

      <section className="cine-section cine-featured-carousel">
        <div className="cine-container">
          <header className="cine-section-head cine-section-head-row">
            <div>
              <h2>Featured Movies</h2>
              <p>Discover the latest must-watch films.</p>
            </div>
            <div className="cine-carousel-nav">
              <button
                type="button"
                className="cine-carousel-btn"
                aria-label="Previous"
                onClick={() => slideCarousel(-1)}
              >
                <i className="fas fa-chevron-left" />
              </button>
              <button
                type="button"
                className="cine-carousel-btn"
                aria-label="Next"
                onClick={() => slideCarousel(1)}
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </header>
          {carouselMovies.length > 0 ? (
            <div className="cine-carousel-viewport">
              <div
                className="cine-carousel-track"
                style={{
                  transform: `translateX(-${(carouselIndex * 100) / carouselMovies.length}%)`,
                }}
              >
                {carouselMovies.map((movie) => (
                  <div
                    key={movie._id}
                    className="cine-carousel-cell"
                    style={{ flex: `0 0 ${100 / carouselMovies.length}%` }}
                  >
                    <Link to={`/review/${movie._id}`} className="cine-carousel-card">
                      <div className="cine-carousel-poster-wrap">
                        <img
                          src={getPosterUrl(movie.poster)}
                          alt=""
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-poster.jpg';
                          }}
                        />
                      </div>
                      <div className="cine-carousel-caption">
                        <strong>{movie.name}</strong>
                        <span>{movie.releaseYear}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="cine-empty">No featured movies yet.</p>
          )}
        </div>
      </section>

      <section className="cine-section cine-why">
        <div className="cine-container">
          <header className="cine-section-head cine-section-head-center">
            <h2>Why CineRate?</h2>
            <p>Everything you need to explore cinema and share your voice.</p>
          </header>
          <div className="cine-why-grid">
            <article className="cine-why-card">
              <div className="cine-why-icon">
                <i className="fas fa-play" aria-hidden="true" />
              </div>
              <h3>Discover Movies</h3>
              <p>
                Browse curated lists, trending picks, and hidden gems tailored to your taste.
              </p>
            </article>
            <article className="cine-why-card">
              <div className="cine-why-icon">
                <i className="fas fa-star" aria-hidden="true" />
              </div>
              <h3>Rate &amp; Review</h3>
              <p>
                Share honest ratings and thoughts to help others find their next favorite film.
              </p>
            </article>
            <article className="cine-why-card">
              <div className="cine-why-icon">
                <i className="fas fa-users" aria-hidden="true" />
              </div>
              <h3>Join the Community</h3>
              <p>
                Connect with fellow movie lovers, build your watchlist, and join the conversation.
              </p>
            </article>
          </div>
        </div>
      </section>

      <div className="cine-browse-all-wrap">
        <Link to="/browse" className="cine-btn cine-btn-primary cine-btn-wide">
          Browse All Movies
        </Link>
      </div>
    </div>
  );
};

export default Home;
