import { useRef, useState } from "react";
import { api } from "../api/client";
import Icon from "../components/Icon";
import { PageHeader, ErrorMessage } from "../components/UI";
export default function Review({ place, catalog, onBack, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const toggle = (id, obstacle) => {
    if (obstacle) {
      setObstacles((values) =>
        values.includes(id) ? values.filter((v) => v !== id) : [...values, id],
      );
      setAmenities((values) =>
        values.filter(
          (value) =>
            !catalog.amenities
              .find((a) => a.id === value)
              ?.conflicts?.includes(id),
        ),
      );
    } else {
      setAmenities((values) =>
        values.includes(id) ? values.filter((v) => v !== id) : [...values, id],
      );
      setObstacles((values) =>
        values.filter(
          (value) =>
            !catalog.amenities
              .find((a) => a.id === id)
              ?.conflicts?.includes(value),
        ),
      );
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    if (!rating) {
      setError("Please choose a star rating before submitting.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api.addReview(place.id, {
        rating,
        amenities,
        obstacles,
        text,
      });
      onSubmit(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  };
  return (
    <section className="standalone-page review-page">
      <PageHeader
        title="Share your experience"
        subtitle={place.name}
        onBack={onBack}
      />
      <form className="page-body" onSubmit={submit}>
        <fieldset className="rating-fieldset">
          <legend>How accessible was this place?</legend>
          <div
            className="rating-input"
            role="radiogroup"
            aria-label="Overall accessibility rating"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className={n <= rating ? "chosen" : ""}>
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                />
                <Icon
                  name="Star"
                  size={36}
                  fill={n <= rating ? "currentColor" : "none"}
                />
              </label>
            ))}
          </div>
          <p>
            {
              [
                "Select your rating",
                "Very difficult to access",
                "Some significant barriers",
                "Accessible with some challenges",
                "Good accessibility",
                "Great accessibility",
              ][rating]
            }
          </p>
        </fieldset>
        <fieldset className="feature-fieldset">
          <legend>What made your visit easier?</legend>
          <p>Select the amenities you personally found.</p>
          <div className="feature-options">
            {catalog.amenities.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={amenities.includes(item.id)}
                className={`feature-option ${amenities.includes(item.id) ? "checked" : ""}`}
                onClick={() => toggle(item.id, false)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                <span className="checkbox">
                  {amenities.includes(item.id) && (
                    <Icon name="Check" size={12} />
                  )}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="feature-fieldset">
          <legend>Anything to plan around?</legend>
          <p>Select any obstacles you noticed.</p>
          <div className="feature-options">
            {catalog.obstacles.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={obstacles.includes(item.id)}
                className={`feature-option obstacle ${obstacles.includes(item.id) ? "checked" : ""}`}
                onClick={() => toggle(item.id, true)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                <span className="checkbox">
                  {obstacles.includes(item.id) && (
                    <Icon name="Check" size={12} />
                  )}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <label className="text-label" htmlFor="review-text">
          Tell us a little more <span>Optional</span>
        </label>
        <textarea
          id="review-text"
          placeholder="What would help someone plan their visit?"
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
        <div className="character-count">{text.length} / 1,000</div>
        {error && <ErrorMessage message={error} />}
        <button type="submit" className="primary-button full" disabled={busy}>
          {busy ? "Sharing your review…" : "Submit review"}
          <Icon name="ArrowRight" size={18} />
        </button>
        <p className="data-note">
          Your review will be shared with your public name.
        </p>
      </form>
    </section>
  );
}
