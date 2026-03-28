import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL, posterUrl } from "../api/api";
import "./Browse.css";

function averageRating(reviews) {
  if (!reviews?.length) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

const Browse = ({ movies }) => {
  const [searchParams] = useSearchParams();
  const [filteredMovies, setFilteredMovies] = useState(movies);
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const isTopRated = searchParams.get("sortBy") === "rating";

  useEffect(() => {
    if (searchParams.get("sortBy") === "rating" && movies.length) {
      (async () => {
        try {
          const response = await axios.get(`${API_URL}/movies`, {
            params: { sortBy: "rating" },
          });
          setFilteredMovies(response.data);
        } catch (error) {
          console.error("Error loading sorted movies:", error);
        }
      })();
    } else {
      setFilteredMovies(movies);
    }
  }, [searchParams, movies]);

  useEffect(() => {
    if (isTopRated) {
      setSearchInput("");
      setAppliedQuery("");
    }
  }, [isTopRated]);

  const genreChips = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => {
      if (!m.genre) return;
      m.genre.split(/[,/]/).forEach((g) => {
        const t = g.trim();
        if (t) set.add(t);
      });
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [movies]);

  const yearOptions = useMemo(() => {
    const years = new Set();
    filteredMovies.forEach((m) => {
      if (m.releaseYear != null && m.releaseYear !== "") years.add(Number(m.releaseYear));
    });
    return [...years].sort((a, b) => b - a);
  }, [filteredMovies]);

  const posterSrc = (movie) => {
    if (!movie.poster) return null;
    if (movie.poster.startsWith("http")) return movie.poster;
    return posterUrl(movie.poster);
  };

  const displayedMovies = useMemo(() => {
    const q = isTopRated ? "" : appliedQuery.toLowerCase().trim();
    let list = filteredMovies.filter((m) => {
      const nameOk = !q || m.name.toLowerCase().includes(q);
      const genreOk =
        !selectedGenre ||
        (m.genre && m.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
      const yearOk =
        !yearFilter || String(m.releaseYear) === String(yearFilter);
      const avg = averageRating(m.reviews);
      let ratingOk = true;
      if (minRating) {
        const min = parseFloat(minRating);
        if (avg == null) ratingOk = false;
        else ratingOk = avg >= min;
      }
      return nameOk && genreOk && yearOk && ratingOk;
    });

    if (!isTopRated && sortBy !== "default") {
      const copy = [...list];
      copy.sort((a, b) => {
        const ra = averageRating(a.reviews);
        const rb = averageRating(b.reviews);
        switch (sortBy) {
          case "title":
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
          case "yearDesc":
            return (b.releaseYear || 0) - (a.releaseYear || 0);
          case "yearAsc":
            return (a.releaseYear || 0) - (b.releaseYear || 0);
          case "ratingDesc": {
            const na = ra ?? -1;
            const nb = rb ?? -1;
            return nb - na;
          }
          default:
            return 0;
        }
      });
      list = copy;
    }

    return list;
  }, [
    filteredMovies,
    appliedQuery,
    selectedGenre,
    yearFilter,
    minRating,
    sortBy,
    isTopRated,
  ]);

  const handleSearch = useCallback(() => {
    setAppliedQuery(searchInput.trim());
  }, [searchInput]);

  const toggleGenre = (g) => {
    setSelectedGenre((prev) => (prev === g ? "" : g));
  };

  const clearFilters = () => {
    setSelectedGenre("");
    setYearFilter("");
    setMinRating("");
    setSortBy("default");
    setSearchInput("");
    setAppliedQuery("");
  };

  const pageTitle = isTopRated ? "Top Rated Movies" : "Movies";
  const pageSubtitle = isTopRated
    ? "The highest rated films of all time"
    : "Browse and discover amazing films";

  const hasActiveFilters =
    !!selectedGenre ||
    !!yearFilter ||
    !!minRating ||
    (!isTopRated && (!!appliedQuery || sortBy !== "default"));

  return (
    <div className="cine-browse">
      <header className="cine-page-header">
        <h1 className="cine-page-title">{pageTitle}</h1>
        <p className="cine-page-subtitle">{pageSubtitle}</p>
      </header>

      {!isTopRated && (
        <>
          <div className="cine-browse-search-wrap">
            <i className="fas fa-search cine-browse-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="cine-browse-search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search movies..."
              aria-label="Search movies"
            />
          </div>
          <button type="button" className="cine-browse-search-btn" onClick={handleSearch}>
            Search
          </button>
        </>
      )}

      {!isTopRated && (
        <section className="cine-browse-extra-filters" aria-label="Refine results">
          <div className="cine-browse-filters-row">
            <div className="cine-browse-filter-field">
              <label htmlFor="browse-year">Year</label>
              <select
                id="browse-year"
                className="cine-browse-select"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="cine-browse-filter-field">
              <label htmlFor="browse-min-rating">Min. rating</label>
              <select
                id="browse-min-rating"
                className="cine-browse-select"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Any</option>
                <option value="2">2+ stars</option>
                <option value="3">3+ stars</option>
                <option value="4">4+ stars</option>
                <option value="4.5">4.5+ stars</option>
              </select>
            </div>
            <div className="cine-browse-filter-field cine-browse-filter-field--grow">
              <label htmlFor="browse-sort">Sort by</label>
              <select
                id="browse-sort"
                className="cine-browse-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="title">Title (A–Z)</option>
                <option value="yearDesc">Year (newest)</option>
                <option value="yearAsc">Year (oldest)</option>
                <option value="ratingDesc">Rating (high to low)</option>
              </select>
            </div>
            {hasActiveFilters && (
              <div className="cine-browse-filter-field cine-browse-filter-field--action">
                <span className="cine-browse-filter-spacer" aria-hidden="true" />
                <button type="button" className="cine-browse-clear-btn" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {isTopRated && (
        <section className="cine-browse-extra-filters cine-browse-extra-filters--compact" aria-label="Narrow top rated">
          <div className="cine-browse-filters-row">
            <div className="cine-browse-filter-field">
              <label htmlFor="top-year">Year</label>
              <select
                id="top-year"
                className="cine-browse-select"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="cine-browse-filter-field">
              <label htmlFor="top-min-rating">Min. rating</label>
              <select
                id="top-min-rating"
                className="cine-browse-select"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Any</option>
                <option value="3">3+ stars</option>
                <option value="4">4+ stars</option>
                <option value="4.5">4.5+ stars</option>
              </select>
            </div>
            {(selectedGenre || yearFilter || minRating) && (
              <div className="cine-browse-filter-field cine-browse-filter-field--action">
                <span className="cine-browse-filter-spacer" aria-hidden="true" />
                <button
                  type="button"
                  className="cine-browse-clear-btn"
                  onClick={() => {
                    setSelectedGenre("");
                    setYearFilter("");
                    setMinRating("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {genreChips.length > 0 && (
        <>
          <span className="cine-browse-genre-label">Filter by Genre</span>
          <div className="cine-browse-chips" role="group" aria-label="Filter by genre">
            {genreChips.map((g) => (
              <button
                key={g}
                type="button"
                className={`cine-browse-chip${selectedGenre === g ? " cine-browse-chip--active" : ""}`}
                onClick={() => toggleGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </>
      )}

      {displayedMovies.length > 0 ? (
        <div className="cine-poster-grid">
          {displayedMovies.map((movie) => (
            <PosterCard key={movie._id} movie={movie} posterUrl={posterSrc(movie)} />
          ))}
        </div>
      ) : (
        <p className="cine-browse-empty">No movies match your search or filters.</p>
      )}
    </div>
  );
};

function PosterCard({ movie, posterUrl }) {
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

export default Browse;
