import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "More places. More possibilities." }),
  ).toBeVisible();
  const search = page.getByRole("button", {
    name: "Search a place or address",
  });
  const box = await search.boundingBox();
  expect(
    await search.evaluate(
      (element, box) =>
        element.contains(
          document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2,
          ),
        ),
      box,
    ),
  ).toBe(true);
});
test("search, review, points, achievements and persistence", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await expect(page.locator(".map-status")).not.toContainText("Loading", {
    timeout: 10000,
  });
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-home.png`,
  });
  await page.getByRole("button", { name: "Search a place or address" }).click();
  await page
    .getByRole("textbox", { name: "Search places by name or address" })
    .fill("AXESS");
  await page.getByRole("button", { name: /Hotels.*Axess Hotel/ }).click();
  await expect(
    page.getByRole("heading", { name: "Axess Hotel", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-details.png`,
  });
  await page.getByRole("button", { name: "Leave a review" }).click();
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByRole("alert")).toContainText("choose a star rating");
  await page.getByRole("radio", { name: "5 stars", exact: true }).check();
  await page
    .getByRole("button", { name: "Step-free entrance", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Steps at entrance", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Step-free entrance", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page
    .getByRole("button", { name: "Steps at entrance", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Step-free entrance", exact: true })
    .click();
  await page
    .getByLabel("Tell us a little more")
    .fill("A very welcoming place with a wide entrance.");
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByRole("status")).toContainText("25 community points");
  await expect(
    page.getByText("A very welcoming place with a wide entrance."),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: /Reviews/ }).click();
  await expect(
    page.getByText("A very welcoming place with a wide entrance."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Achievements", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "145 community points" }),
  ).toBeVisible();
  await expect(
    page.locator(".achievement-card").filter({ hasText: "First steps" }),
  ).toContainText("Unlocked");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-achievements.png`,
  });
  expect(errors).toEqual([]);
});

test("reports can be confirmed, resolved and added", async ({ page }) => {
  await page.getByRole("button", { name: /Hotels.*Axess Hotel/ }).click();
  await page.getByRole("button", { name: /Elevator out of service/ }).click();
  await page.getByRole("button", { name: "Yes, still an issue" }).click();
  await expect(
    page.getByRole("button", { name: /Elevator out of service/ }),
  ).toContainText("4 people confirm");
  await page.getByRole("button", { name: /Elevator out of service/ }).click();
  await page.getByRole("button", { name: "No, it’s resolved" }).click();
  await expect(page.getByText("No active issues reported")).toBeVisible();
  await page.getByRole("button", { name: "Report a live issue" }).click();
  await page.getByLabel("What’s happening?").selectOption("payment");
  await page
    .getByLabel("A little more detail")
    .fill("Card terminal is offline at reception.");
  await page.getByRole("button", { name: "Share live update" }).click();
  await expect(
    page.getByRole("button", { name: /Payment terminal offline/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Payment terminal offline/ }),
  ).toBeVisible();
});

test("map markers, categories, empty search and menu keyboard controls work", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Hotels", exact: true }).click();
  await expect(page.locator(".place-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Open Axess Hotel, accessibility 4.5 out of 5",
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Axess Hotel", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close place details" }).click();
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Search a place or address" }).click();
  await page
    .getByRole("textbox", { name: "Search places by name or address" })
    .fill("nothing matches this");
  await expect(
    page.getByRole("heading", { name: "No places found" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("tile failure falls back and a selected marker stays above the mobile sheet", async ({
  page,
}, testInfo) => {
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.abort(),
  );
  await page.reload();
  await expect(page.locator(".map-status")).toHaveText("Illustrated demo map");
  await page.getByRole("button", { name: /Hotels.*Axess Hotel/ }).click();
  await expect(
    page.getByRole("heading", { name: "Axess Hotel", exact: true }),
  ).toBeVisible();
  if (testInfo.project.name === "mobile") {
    const pin = await page.locator(".map-pin.selected").boundingBox();
    const sheet = await page.locator(".detail-panel").boundingBox();
    expect(pin.y).toBeGreaterThan(82);
    expect(pin.y + pin.height).toBeLessThan(sheet.y);
  }
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Reviews/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("place cards never claim step-free access after steps are recorded", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Food & drink.*The Green Table/ }).click();
  await page.getByRole("button", { name: "Leave a review" }).click();
  await page.getByRole("radio", { name: "2 stars", exact: true }).check();
  await page
    .getByRole("button", { name: "Steps at entrance", exact: true })
    .click();
  await page.getByRole("button", { name: "Submit review" }).click();
  await page.getByRole("button", { name: "Close place details" }).click();
  const card = page.getByRole("button", {
    name: /Food & drink.*The Green Table/,
  });
  await expect(card).toContainText("See accessibility details");
  await expect(card).not.toContainText("Step-free entrance");
});
