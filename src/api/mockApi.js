import {
  createSeed,
  amenities,
  obstacles,
  reportTypes,
  achievementList,
} from "./seed.js";
export const STORAGE_KEY = "access-demo-v1";
const clone = (value) => structuredClone(value);
const normalize = (value) =>
  value
    .toLocaleLowerCase()
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function createMockApi({
  storage,
  delay = 180,
  reviewPoints = 25,
} = {}) {
  let state = createSeed();
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || "null");
    if (saved?.version === 1 && Array.isArray(saved.locations) && saved.profile)
      state = saved;
  } catch {
    /* A blocked or empty store uses seed data. */
  }
  const save = () => {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* In-memory demo remains usable. */
    }
  };
  const run = async (action) => {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    return clone(action());
  };
  const location = (id) => {
    const value = state.locations.find((l) => l.id === id);
    if (!value) throw new Error("This place could not be found.");
    return value;
  };
  const validateFeatures = (ids, catalog) =>
    Array.isArray(ids) && ids.every((id) => catalog.some((f) => f.id === id));
  return {
    getLocations: (query = "") =>
      run(() =>
        state.locations.filter((l) =>
          normalize(`${l.name} ${l.address}`).includes(normalize(query.trim())),
        ),
      ),
    getLocation: (id) => run(() => location(id)),
    getProfile: () => run(() => state.profile),
    getCatalog: () => run(() => ({ amenities, obstacles, reportTypes })),
    getAchievements: () => run(() => achievementList(state.profile)),
    addReview: (id, payload) =>
      run(() => {
        const place = location(id);
        const {
          rating,
          text = "",
          amenities: selectedAmenities = [],
          obstacles: selectedObstacles = [],
        } = payload;
        if (!Number.isInteger(rating) || rating < 1 || rating > 5)
          throw new Error("Choose a rating from 1 to 5 stars.");
        if (typeof text !== "string" || text.length > 1000)
          throw new Error("Keep your review under 1,000 characters.");
        if (
          !validateFeatures(selectedAmenities, amenities) ||
          !validateFeatures(selectedObstacles, obstacles)
        )
          throw new Error("Choose features from the available list.");
        if (
          amenities.some(
            (a) =>
              selectedAmenities.includes(a.id) &&
              a.conflicts.some((id) => selectedObstacles.includes(id)),
          )
        )
          throw new Error(
            "Please check the conflicting amenities and obstacles.",
          );
        place.reviews.unshift({
          id: crypto.randomUUID(),
          name: state.profile.name,
          rating,
          text: text.trim(),
          amenities: [...new Set(selectedAmenities)],
          obstacles: [...new Set(selectedObstacles)],
          createdAt: new Date().toISOString(),
        });
        place.ratingTotal += rating;
        place.reviewCount += 1;
        place.score =
          Math.round((place.ratingTotal / place.reviewCount) * 10) / 10;
        // Latest observations update the overview, while older evidence remains in reviews.
        place.amenities = [
          ...new Set([...place.amenities, ...selectedAmenities]),
        ].filter(
          (id) =>
            !amenities
              .find((a) => a.id === id)
              ?.conflicts.some((id) => selectedObstacles.includes(id)),
        );
        place.obstacles = [
          ...new Set([...place.obstacles, ...selectedObstacles]),
        ].filter(
          (id) =>
            !amenities.some(
              (a) =>
                selectedAmenities.includes(a.id) && a.conflicts.includes(id),
            ),
        );
        const pointsAwarded =
          Number.isFinite(reviewPoints) && reviewPoints >= 0
            ? reviewPoints
            : 25;
        state.profile.points += pointsAwarded;
        state.profile.reviewCount += 1;
        save();
        return { location: place, profile: state.profile, pointsAwarded };
      }),
    addReport: (id, { type, description = "" }) =>
      run(() => {
        const place = location(id);
        if (!reportTypes.some((t) => t.id === type))
          throw new Error("Choose an issue type.");
        if (typeof description !== "string" || description.length > 500)
          throw new Error("Keep details under 500 characters.");
        if (place.reports.some((r) => r.type === type))
          throw new Error(
            "This issue is already reported. You can confirm it instead.",
          );
        place.reports.push({
          id: crypto.randomUUID(),
          type,
          description: description.trim(),
          createdAt: new Date().toISOString(),
          confirmations: 1,
          confirmedBy: [state.profile.id],
        });
        state.profile.reportCount += 1;
        save();
        return place;
      }),
    voteReport: (id, reportId, stillRelevant) =>
      run(() => {
        const place = location(id);
        const report = place.reports.find((r) => r.id === reportId);
        if (!report) throw new Error("This issue has already been resolved.");
        if (typeof stillRelevant !== "boolean")
          throw new Error("Choose whether the issue is still present.");
        if (!stillRelevant)
          place.reports = place.reports.filter((r) => r.id !== reportId);
        else if (!report.confirmedBy.includes(state.profile.id)) {
          report.confirmations += 1;
          report.confirmedBy.push(state.profile.id);
        }
        save();
        return place;
      }),
  };
}
