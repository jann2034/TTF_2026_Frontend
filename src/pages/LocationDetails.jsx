import { useState } from "react";
import Icon from "../components/Icon";
import {
  FeatureChips,
  IconButton,
  PlaceArt,
  Stars,
  scoreLabel,
} from "../components/UI";
export default function LocationDetails({
  place,
  catalog,
  onClose,
  onReview,
  onReport,
  onIssue,
  notify,
  initialTab = "overview",
}) {
  const [tab, setTab] = useState(initialTab);
  return (
    <section className="detail-panel" aria-label={`${place.name} details`}>
      <div className="sheet-handle" />
      <div className="detail-top">
        <span className="place-category">
          <Icon name="MapPin" size={14} />
          {place.category} · {place.distance} away
        </span>
        <IconButton icon="X" label="Close place details" onClick={onClose} />
      </div>
      <div className="detail-title">
        <h1>{place.name}</h1>
        <span className="detail-actions">
          <IconButton
            icon="Bookmark"
            label="Save place (preview)"
            onClick={() => notify("Saved places are coming soon.")}
          />
          <IconButton
            icon="Share2"
            label="Share place (preview)"
            onClick={() => notify("Sharing is coming soon.")}
          />
        </span>
      </div>
      <p className="address">
        <Icon name="MapPin" size={14} />
        {place.address}
      </p>
      <div className="location-summary">
        <PlaceArt place={place} large />
        <div className="rating-summary">
          <span className="score-description">{scoreLabel(place.score)}</span>
          <div className="large-score">
            {place.score.toFixed(1)}
            <span>/ 5</span>
          </div>
          <Stars score={place.score} size={16} />
          <span className="review-count">
            From {place.reviewCount} community reviews
          </span>
        </div>
      </div>
      <div
        className="detail-tabs"
        role="tablist"
        aria-label="Location information"
      >
        {["overview", "reviews"].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            aria-controls={`panel-${t}`}
            id={`tab-${t}`}
            onClick={() => setTab(t)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? "overview"
                  : event.key === "End"
                    ? "reviews"
                    : tab === "overview"
                      ? "reviews"
                      : "overview";
              setTab(next);
              document.getElementById(`tab-${next}`)?.focus();
            }}
          >
            {t === "overview" ? "Overview" : `Reviews (${place.reviewCount})`}
          </button>
        ))}
      </div>
      <div
        className="detail-content"
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "overview" ? (
          <>
            <section className="live-section">
              <div className="section-heading">
                <h2>
                  <span className="live-dot" />
                  Live updates{" "}
                  <span className="count-pill">{place.reports.length}</span>
                </h2>
                <span>From the community</span>
              </div>
              <p className="section-copy">
                Things that might affect your visit right now.
              </p>
              <div className="live-issues">
                {place.reports.map((report) => {
                  const type = catalog.reportTypes.find(
                    (t) => t.id === report.type,
                  );
                  return (
                    <button
                      key={report.id}
                      className="issue-card"
                      onClick={() => onIssue(report)}
                    >
                      <span className="issue-icon">
                        <Icon name={type?.icon || "TriangleAlert"} />
                      </span>
                      <span>
                        <strong>{type?.label || "Accessibility issue"}</strong>
                        <small>
                          {report.confirmations}{" "}
                          {report.confirmations === 1
                            ? "person confirms"
                            : "people confirm"}{" "}
                          · Tap to update
                        </small>
                      </span>
                      <Icon name="ChevronRight" size={17} />
                    </button>
                  );
                })}
                {!place.reports.length && (
                  <div className="all-clear">
                    <Icon name="ShieldCheck" />
                    <span>No active issues reported</span>
                  </div>
                )}
                <button className="report-button" onClick={onReport}>
                  <Icon name="Plus" size={17} />
                  Report a live issue
                </button>
              </div>
            </section>
            <section className="feature-section">
              <div className="section-heading">
                <h2>Helpful facilities</h2>
                <span>{place.amenities.length} amenities</span>
              </div>
              <FeatureChips ids={place.amenities} catalog={catalog.amenities} />
              {!place.amenities.length && <p>No amenities logged yet.</p>}
            </section>
            <section className="feature-section">
              <div className="section-heading">
                <h2>Accessibility issues</h2>
                <Icon name="TriangleAlert" size={17} />
              </div>
              <p className="section-copy">
                Potential obstacles to plan around.
              </p>
              <FeatureChips
                ids={place.obstacles}
                catalog={catalog.obstacles}
                obstacle
              />
              {!place.obstacles.length && (
                <p>No obstacles logged yet.</p>
              )}
            </section>
            {place.facts?.length > 0 && (
              <section className="feature-section">
                <div className="section-heading">
                  <h2>Where this comes from</h2>
                  <span>{place.facts.length} facts</span>
                </div>
                <ul className="fact-list">
                  {place.facts.map((fact) => (
                    <li key={fact.attribute} title={fact.definition}>
                      <strong>
                        {fact.label}: {fact.value}
                        {fact.attribute === "bus_wheelchair_trips" && "%"}
                      </strong>
                      <small>
                        {" "}
                        {fact.sourceLabel}
                        {fact.observedAt &&
                          ` · ${new Date(fact.observedAt).toLocaleDateString("en-GB")}`}
                        {fact.unverified && " · Unverified"}
                        {fact.conflict && " · Sources disagree"}
                        {!fact.fresh && " · Still true?"}
                      </small>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <div className="contribution-prompt">
              <Icon name="HeartHandshake" size={25} />
              <div>
                <strong>Been here? Your experience matters.</strong>
                <p>Help someone plan their next visit.</p>
              </div>
            </div>
            <button className="primary-button full" onClick={onReview}>
              <Icon name="Plus" size={18} />
              Leave a review
            </button>
            <p className="data-note">
              Community observations can change. Check the features that matter
              to you.
            </p>
            {catalog.attribution?.length > 0 && (
              <p className="data-note">Data: {catalog.attribution.join(" · ")}</p>
            )}
          </>
        ) : (
          <>
            <button className="primary-button full" onClick={onReview}>
              <Icon name="Plus" size={18} />
              Leave a review
            </button>
            <div className="reviews-heading">
              <h2>Community experiences</h2>
              <span>Most recent</span>
            </div>
            {place.reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-author">
                  <span className="avatar small">
                    {review.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div>
                    <strong>{review.name}</strong>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <Stars score={review.rating} />
                </div>
                {review.text && <p>{review.text}</p>}
                <FeatureChips
                  ids={review.amenities}
                  catalog={catalog.amenities}
                />
                <FeatureChips
                  ids={review.obstacles}
                  catalog={catalog.obstacles}
                  obstacle
                />
              </article>
            ))}
            {!place.reviews.length && (
              <p className="empty-state">
                Be the first to share your experience.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
