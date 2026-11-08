import Icon from "../components/Icon";
import { PlaceArt, Score, Stars } from "../components/UI";
export const categories = [
  { name: "All places", icon: "Compass" },
  { name: "Food & drink", icon: "Utensils" },
  { name: "Shopping", icon: "ShoppingBag" },
  { name: "Hotels", icon: "Hotel" },
  { name: "Outdoors", icon: "Trees" },
  { name: "Health", icon: "Heart" },
];
export function PlaceCard({ place, onClick }) {
  return (
    <button className="place-card" onClick={() => onClick(place.id)}>
      <PlaceArt place={place} />
      <span className="place-card-info">
        <span className="place-category">
          {place.category} <span>· {place.distance}</span>
        </span>
        <strong>{place.name}</strong>
        <span className="place-rating">
          <Score score={place.score} />
          <span>{place.reviewCount} reviews</span>
        </span>
        <span className={`place-note ${place.reports.length ? "warning" : ""}`}>
          <Icon
            name={
              place.reports.length
                ? "TriangleAlert"
                : place.amenities.includes("ramp")
                  ? "Check"
                  : "Accessibility"
            }
            size={13}
          />
          {place.reports.length
            ? `${place.reports.length} live ${place.reports.length === 1 ? "update" : "updates"}`
            : place.amenities.includes("ramp")
              ? "Step-free entrance"
              : "See accessibility details"}
        </span>
      </span>
      <Icon name="ChevronRight" size={18} />
    </button>
  );
}
export default function Explore({ locations, category, onCategory, onSelect }) {
  return (
    <section className="explore-panel">
      <div className="explore-intro">
        <h1>
          More places.
          <br />
          <span>More possibilities.</span>
        </h1>
        <p>
          Find places that work for you.
          <br />A little more accessible, together.
        </p>
      </div>
      <div className="category-list" aria-label="Filter places by category">
        {categories.map((c) => (
          <button
            key={c.name}
            aria-pressed={category === c.name}
            className={`category ${category === c.name ? "active" : ""}`}
            onClick={() => onCategory(c.name)}
          >
            <Icon name={c.icon} size={16} />
            {c.name}
          </button>
        ))}
      </div>
      <div className="nearby-heading">
        <div>
          <h2>
            Explore nearby <span>{locations.length}</span>
          </h2>
          <p>Small discoveries. More confident journeys.</p>
        </div>
      </div>
      <div className="places-list">
        {locations.map((place) => (
          <PlaceCard key={place.id} place={place} onClick={onSelect} />
        ))}
        {!locations.length && (
          <p className="empty-state">
            No places in this category yet. Try another category.
          </p>
        )}
      </div>
      <div className="community-note">
        <span className="community-icon">
          <Icon name="HeartHandshake" size={24} />
        </span>
        <div>
          <strong>Your experience opens doors.</strong>
          <p>Share what you find. Help someone feel welcome.</p>
        </div>
      </div>
      <p className="demo-caption">
        A neighborhood preview · Illustrative places & community data
      </p>
    </section>
  );
}
