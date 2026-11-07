import test from "node:test";
import assert from "node:assert/strict";
import { createHttpApi } from "../src/api/client.js";

test("HTTP adapter encodes searches and posts review payloads to documented routes", async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  const api = createHttpApi("http://localhost:3000/api/", fetcher);
  await api.getLocations("café & park");
  assert.equal(
    calls[0].url,
    "http://localhost:3000/api/locations?q=caf%C3%A9%20%26%20park",
  );
  const body = {
    rating: 4,
    amenities: ["ramp"],
    obstacles: [],
    text: "Easy access.",
  };
  await api.addReview("place/1", body);
  assert.equal(
    calls[1].url,
    "http://localhost:3000/api/locations/place%2F1/reviews",
  );
  assert.equal(calls[1].options.method, "POST");
  assert.deepEqual(JSON.parse(calls[1].options.body), body);
  await api.voteReport("place-1", "report-1", false);
  assert.deepEqual(JSON.parse(calls[2].options.body), { stillRelevant: false });
});
test("HTTP failures expose server messages and reject malformed responses", async () => {
  await assert.rejects(
    createHttpApi(
      "/api",
      async () =>
        new Response(JSON.stringify({ message: "Please try later." }), {
          status: 503,
        }),
    ).getProfile(),
    /Please try later/,
  );
  await assert.rejects(
    createHttpApi(
      "/api",
      async () => new Response("not json", { status: 200 }),
    ).getProfile(),
    /empty response/,
  );
});
