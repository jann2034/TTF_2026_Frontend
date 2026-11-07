import test from "node:test";
import assert from "node:assert/strict";
import { createMockApi } from "../src/api/mockApi.js";

function storage() {
  const data = new Map();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
  };
}
const setup = (options = {}) =>
  createMockApi({ storage: storage(), delay: 0, reviewPoints: 40, ...options });

test("search matches names and addresses, ignoring accents and case", async () => {
  const api = setup();
  assert.equal((await api.getLocations("AXESS"))[0].id, "axess-hotel");
  assert.ok((await api.getLocations("kirchenstrasse")).length > 0);
  assert.equal((await api.getLocations("no such place")).length, 0);
});
test("review persists, changes the average, grants configured points and unlocks achievement", async () => {
  const store = storage();
  const api = setup({ storage: store });
  const before = await api.getLocation("axess-hotel");
  const user = await api.getProfile();
  const result = await api.addReview("axess-hotel", {
    rating: 5,
    amenities: ["ramp"],
    obstacles: [],
    text: "Easy entrance.",
  });
  assert.equal(result.pointsAwarded, 40);
  assert.equal(result.profile.points, user.points + 40);
  assert.equal(result.location.reviewCount, before.reviewCount + 1);
  assert.equal(
    result.location.score,
    Math.round(((before.ratingTotal + 5) / (before.reviewCount + 1)) * 10) / 10,
  );
  assert.equal(result.location.reviews[0].text, "Easy entrance.");
  const reloaded = setup({ storage: store });
  assert.equal((await reloaded.getProfile()).points, user.points + 40);
  assert.equal(
    (await reloaded.getAchievements()).find((a) => a.id === "first-review")
      .unlocked,
    true,
  );
});
test("invalid reviews do not award points or save data", async () => {
  const api = setup();
  const before = await api.getProfile();
  for (const rating of [0, 6, 2.5, NaN, "5"])
    await assert.rejects(
      api.addReview("axess-hotel", { rating, amenities: [], obstacles: [] }),
    );
  await assert.rejects(
    api.addReview("axess-hotel", {
      rating: 5,
      amenities: ["ramp"],
      obstacles: ["steps"],
    }),
  );
  assert.equal((await api.getProfile()).points, before.points);
});
test("live reports can be confirmed once and resolved, with persisted results", async () => {
  const api = setup();
  const location = await api.addReport("axess-hotel", {
    type: "payment",
    description: "Terminal is offline.",
  });
  const report = location.reports.find((r) => r.type === "payment");
  const once = await api.voteReport(location.id, report.id, true);
  const twice = await api.voteReport(location.id, report.id, true);
  assert.equal(
    twice.reports.find((r) => r.id === report.id).confirmations,
    once.reports.find((r) => r.id === report.id).confirmations,
  );
  const resolved = await api.voteReport(location.id, report.id, false);
  assert.equal(
    resolved.reports.some((r) => r.id === report.id),
    false,
  );
});
test("unknown locations and malformed reports reject without mutation", async () => {
  const api = setup();
  await assert.rejects(api.getLocation("missing"));
  await assert.rejects(api.addReport("axess-hotel", { type: "invented" }));
});
test("unavailable storage still supports the demo in memory", async () => {
  const api = setup({
    storage: {
      getItem() {
        throw Error("blocked");
      },
      setItem() {
        throw Error("blocked");
      },
    },
  });
  await api.addReview("axess-hotel", {
    rating: 4,
    amenities: [],
    obstacles: [],
    text: "",
  });
  assert.equal((await api.getProfile()).points, 160);
});
