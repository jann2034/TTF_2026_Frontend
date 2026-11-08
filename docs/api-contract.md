# Backend API contract

Set `VITE_API_MODE=http` and `VITE_API_BASE_URL` to the API root. Requests and responses are JSON. Success bodies are unwrapped (no `data` envelope). Return non-2xx errors as `{ "message": "Readable explanation" }`. The client has a 12-second timeout and preserves form data on errors.

| Method | Path                                     | Request                                  | Response                                |
| ------ | ---------------------------------------- | ---------------------------------------- | --------------------------------------- |
| GET    | `/locations?q=…`                         | Optional name/address query              | `Location[]`                            |
| GET    | `/locations/:id`                         | —                                        | `Location`                              |
| GET    | `/catalog`                               | —                                        | `{ amenities, obstacles, reportTypes, attribution? }` |
| GET    | `/me`                                    | —                                        | `Profile`                               |
| GET    | `/me/achievements`                       | —                                        | `Achievement[]`                         |
| POST   | `/locations/:id/reviews`                 | `{ rating, amenities, obstacles, text }` | `{ location, profile, pointsAwarded }`  |
| POST   | `/locations/:id/reports`                 | `{ type, description }`                  | Updated `Location`                      |
| POST   | `/locations/:id/reports/:reportId/votes` | `{ stillRelevant: boolean }`             | Updated `Location`                      |

## Types

```ts
type Feature = {
  id: string;
  label: string;
  icon: string; // Registry key from src/components/Icon.jsx
  conflicts?: string[]; // Amenity references conflicting obstacle IDs
};
type ReportType = { id: string; label: string; icon: string };

type Profile = {
  id: string;
  name: string;
  initials: string;
  points: number;
  reviewCount: number;
  reportCount: number;
};

type Review = {
  id: string;
  name: string;
  rating: number; // Integer 1–5
  text: string; // Return empty string if omitted
  amenities: string[];
  obstacles: string[];
  createdAt: string; // ISO 8601
};

type Report = {
  id: string;
  type: string; // ReportType.id
  description: string;
  createdAt: string;
  confirmations: number;
  confirmedBy?: string[]; // Mock detail; not required by the UI
};

type Fact = {
  attribute: string; // Vocabulary id from the dataset
  label: string;
  definition: string;
  value: string | number;
  source: string;
  sourceLabel: string;
  sourceRef: string | null;
  observedAt: string | null;
  fresh: boolean; // False: ask "still true?"
  unverified: boolean; // True for facts crawled from business websites
  conflict: boolean; // Sources disagree on this attribute
  confirmations: number;
};

type Location = {
  id: string;
  name: string;
  category: "Hotels" | "Food & drink" | "Shopping" | "Outdoors" | "Health" | "Transport" | "Culture & services";
  wheelchairAccess?: "yes" | "limited" | "no" | "unknown"; // Real API only
  facts?: Fact[]; // Real API only: one resolved value per attribute
  address: string;
  lat: number;
  lng: number;
  distance: string; // Display label; mocked rather than calculated
  tagline: string;
  color: "blue" | "green" | "peach" | "lavender";
  score: number; // Average rounded to one decimal; 0 if unrated
  reviewCount: number;
  ratingTotal?: number; // Mock aggregation detail
  amenities: string[];
  obstacles: string[];
  reviews: Review[]; // Most recent first
  reports: Report[]; // Active issues only
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number; // Positive
  progress: number; // 0 to target
  unlocked: boolean;
};
```

Normalize searches, validate ratings and catalog IDs, reject contradictory feature combinations, bound review text to 1,000 characters and report descriptions to 500, deduplicate confirmations, and update averages/rewards atomically. Return authoritative location/profile data after reviewing. Notifications display returned `pointsAwarded`, including zero.

The initial screen fetches locations, profile, and catalog together. Detail pages fetch their location separately. Successful reviews update the location, list score, profile, and reviews. Opening achievements always fetches current achievements. Successful reports refresh the profile so contribution-based achievements can unlock.
