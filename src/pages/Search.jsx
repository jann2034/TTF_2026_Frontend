import { useEffect, useState } from "react";
import { api, isMock } from "../api/client";
import Icon from "../components/Icon";
import { IconButton, ErrorMessage } from "../components/UI";
import { PlaceCard } from "./Explore";
export default function SearchPage({ onBack, onSelect, initialLocations }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(initialLocations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .getLocations(query)
        .then((data) => {
          if (active) {
            setResults(data);
            setError("");
          }
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);
  return (
    <section className="standalone-page search-page">
      <div className="search-page-header">
        <IconButton icon="ArrowLeft" label="Back to map" onClick={onBack} />
        <label className="search-field">
          <Icon name="Search" />
          <input
            autoFocus
            aria-label="Search places by name or address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or address"
          />
          {query && (
            <IconButton
              icon="X"
              label="Clear search"
              onClick={() => setQuery("")}
            />
          )}
        </label>
      </div>
      <div className="page-body">
        {!query && (
          <>
            <div className="section-heading">
              <h2>Recent searches</h2>
              <span>Demo suggestions</span>
            </div>
            {(isMock
              ? ["Axess Hotel", "Kirchenstraße", "The Green Table"]
              : ["Almsee Rundweg", "Gmunden", "Scharnstein"]
            ).map((name) => (
              <button
                className="recent-search"
                key={name}
                onClick={() => setQuery(name)}
              >
                <Icon name="Clock3" />
                <span>{name}</span>
                <Icon name="ArrowRight" size={17} />
              </button>
            ))}
          </>
        )}
        <div className="section-heading">
          <h2>{query ? "Search results" : "Places to explore"}</h2>
          <span aria-live="polite">
            {loading ? "Searching…" : `${results.length} places`}
          </span>
        </div>
        {error ? (
          <ErrorMessage message={error} />
        ) : !loading && !results.length ? (
          <div className="empty-state">
            <Icon name="Search" size={36} />
            <h3>No places found</h3>
            <p>Try a different name or address.</p>
          </div>
        ) : (
          <div className={`places-list ${loading ? "loading-results" : ""}`}>
            {results.map((place) => (
              <PlaceCard key={place.id} place={place} onClick={onSelect} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
