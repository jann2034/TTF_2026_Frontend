import { useEffect, useRef } from "react";
import Icon from "./Icon";

export function IconButton({ icon, label, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon name={icon} />
    </button>
  );
}
export function Stars({ score, size = 14 }) {
  return (
    <span className="stars" aria-label={`${score} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          className="star-slot"
          key={n}
          style={{ width: size, height: size }}
        >
          <Icon name="Star" size={size} />
          <span
            className="star-fill"
            style={{
              width: `${Math.min(1, Math.max(0, score - n + 1)) * 100}%`,
            }}
          >
            <Icon name="Star" size={size} fill="currentColor" />
          </span>
        </span>
      ))}
    </span>
  );
}
export function scoreLabel(score) {
  if (!score) return "Not yet rated";
  return score >= 4.5
    ? "Great accessibility"
    : score >= 3.5
      ? "Good accessibility"
      : score >= 2.5
        ? "Mixed accessibility"
        : "Limited accessibility";
}
export function Score({ score }) {
  return (
    <span className={`score-badge ${score < 3.5 ? "score-mixed" : ""}`}>
      <Icon name="Accessibility" size={15} />
      <strong>{score.toFixed(1)}</strong>
    </span>
  );
}
export function PlaceArt({ place, large = false }) {
  const icons = {
    Hotels: "Hotel",
    "Food & drink": "Utensils",
    Shopping: "ShoppingBag",
    Outdoors: "Trees",
    Health: "Heart",
    Transport: "Bus",
    "Culture & services": "Landmark",
  };
  return (
    <div
      className={`place-art ${place.color} ${large ? "large" : ""}`}
      aria-label={`${place.category} illustration`}
      role="img"
    >
      <span className="art-sun" />
      <span className="art-building">
        <Icon name={icons[place.category]} size={large ? 48 : 28} />
      </span>
      <span className="art-ground" />
    </div>
  );
}
export function FeatureChips({ ids, catalog, obstacle = false }) {
  return (
    <div className="feature-chips">
      {ids.map((id) => {
        const feature = catalog.find((f) => f.id === id);
        return (
          feature && (
            <span
              key={id}
              className={`feature-chip ${obstacle ? "obstacle" : ""}`}
            >
              <Icon name={feature.icon} size={16} />
              {feature.label}
            </span>
          )
        );
      })}
    </div>
  );
}
export function PageHeader({ title, subtitle, onBack }) {
  return (
    <header className="page-header">
      <IconButton icon="ArrowLeft" label="Back" onClick={onBack} />
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}
export function ErrorMessage({ message, retry }) {
  return (
    <div className="error-message" role="alert">
      <Icon name="TriangleAlert" />
      <span>{message}</span>
      {retry && <button onClick={retry}>Try again</button>}
    </div>
  );
}
export function Modal({ title, children, onClose, className = "" }) {
  const ref = useRef();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const root = ref.current;
    root
      .querySelector('button, input, select, textarea, [tabindex="0"]')
      ?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab") return;
      const elements = [
        ...root.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select, textarea, a[href], [tabindex="0"]',
        ),
      ];
      const first = elements[0],
        last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, []);
  return (
    <div className={`modal-backdrop ${className}`} onClick={onClose}>
      <section
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <IconButton icon="X" label="Close dialog" onClick={onClose} />
        </header>
        {children}
      </section>
    </div>
  );
}
