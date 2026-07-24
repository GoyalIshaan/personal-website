import AxeBuilder from "@axe-core/playwright";
import { launch as launchChrome } from "chrome-launcher";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import lighthouse from "lighthouse";
import { chromium } from "playwright-core";
import sharp from "sharp";

const baseUrl = process.env.SITE_URL ?? "http://localhost:3210";
const chromePath =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

let failures = 0;

const assert = (condition, message) => {
  if (condition) return;
  failures += 1;
  console.error(`FAIL: ${message}`);
};

const context = await browser.newContext();
const page = await context.newPage();
const runtimeErrors = [];

page.on("pageerror", (error) => runtimeErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(message.text());
});

try {
  const buildId = (
    await readFile(new URL("../.next/BUILD_ID", import.meta.url), "utf8")
  ).trim();
  const buildManifest = await context.request.get(
    `${baseUrl}/_next/static/${buildId}/_buildManifest.js`,
  );
  assert(
    buildManifest.ok(),
    "QA server must run the current local production build",
  );
} catch (error) {
  assert(false, `Could not verify the production build: ${error.message}`);
}

const projectImageDirectory = new URL("../public/projects/", import.meta.url);
const projectImageFiles = (await readdir(projectImageDirectory)).filter((file) =>
  file.endsWith(".webp"),
);
assert(projectImageFiles.length === 14, "Project art must contain 14 WebP files");
for (const file of projectImageFiles) {
  const imageUrl = new URL(file, projectImageDirectory);
  const [metadata, fileStats] = await Promise.all([
    sharp(fileURLToPath(imageUrl)).metadata(),
    stat(imageUrl),
  ]);
  assert(
    metadata.width === 1600 && metadata.height === 900,
    `${file} must be 1600 by 900 pixels`,
  );
  assert(fileStats.size < 300_000, `${file} must be smaller than 300 KB`);
}

for (const width of [320, 375, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 });

  for (const route of ["/", "/projects"]) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    const metrics = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      h1Count: document.querySelectorAll("h1").length,
      hashLinks: document.querySelectorAll('a[href="#"]').length,
      defaultImages: document.querySelectorAll('img[src*="default.jpg"]').length,
    }));

    assert(
      metrics.documentWidth === metrics.viewportWidth,
      `${route} overflows at ${width}px`,
    );
    assert(metrics.h1Count === 1, `${route} must contain one h1`);
    assert(metrics.hashLinks === 0, `${route} contains href="#"`);
    assert(metrics.defaultImages === 0, `${route} contains /default.jpg`);
  }
}

await page.setViewportSize({ width: 1280, height: 900 });

for (const route of ["/", "/projects"]) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });

  for (const colorScheme of ["light", "dark"]) {
    const htmlClass = await page.locator("html").getAttribute("class");
    const isDark = htmlClass?.split(/\s+/).includes("dark") ?? false;
    if ((colorScheme === "dark") !== isDark) {
      await page.getByRole("button", { name: "Toggle color theme" }).click();
      await page.waitForTimeout(100);
    }

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );

    assert(
      blocking.length === 0,
      `${route} has blocking Axe violations in ${colorScheme} mode: ${blocking
        .map(
          (violation) =>
            `${violation.id} (${violation.nodes
              .map((node) => node.target.join(" "))
              .join(", ")})`,
        )
        .join(", ")}`,
    );

    console.log(
      `${route} ${colorScheme}: ${results.violations.length} Axe violations, ${blocking.length} blocking`,
    );
  }
}

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
assert(
  (await page.locator("#projects img").count()) === 4,
  "Home must show four project images",
);
assert(
  (await page.getByRole("link", { name: "Home" }).getAttribute("aria-current")) ===
    "page",
  "Home navigation item must expose the current page",
);
assert(
  (await page.locator('a[href$="ishaan-goyal-ai-infrastructure.pdf"]').count()) ===
    1,
  "Home must link the AI Infrastructure resume",
);
const dockTargets = page.locator(
  'nav[aria-label="Primary navigation"] a, nav[aria-label="Primary navigation"] button',
);
for (let index = 0; index < (await dockTargets.count()); index += 1) {
  const box = await dockTargets.nth(index).boundingBox();
  assert(
    Boolean(box && box.width >= 44 && box.height >= 44),
    `Dock control ${index + 1} must have a 44px touch target`,
  );
}

assert(
  (await page.locator("#skills div.rounded-full").count()) === 65,
  "All 65 resume-backed skills must remain in the document",
);

const disclosures = page.locator("button[aria-controls][aria-expanded]");
const disclosureCount = await disclosures.count();
assert(disclosureCount === 6, "Home must expose all six resume disclosures");
for (let index = 0; index < disclosureCount; index += 1) {
  const disclosure = disclosures.nth(index);
  const disclosureTarget = await disclosure.getAttribute("aria-controls");
  assert(
    (await disclosure.getAttribute("aria-expanded")) === "false",
    `Resume disclosure ${index + 1} must start collapsed`,
  );
  assert(
    Boolean(disclosureTarget),
    `Resume disclosure ${index + 1} must identify its content`,
  );
  await disclosure.focus();
  await page.keyboard.press(index % 2 === 0 ? "Enter" : "Space");
  await page
    .waitForFunction(
      (target) =>
        [...document.querySelectorAll("button")].some(
          (button) =>
            button.getAttribute("aria-controls") === target &&
            button.getAttribute("aria-expanded") === "true",
        ),
      disclosureTarget,
      { timeout: 2000 },
    )
    .catch(() => undefined);
  const controlledDisclosure = disclosureTarget
    ? page.locator(`[aria-controls=${JSON.stringify(disclosureTarget)}]`)
    : disclosure;
  assert(
    (await controlledDisclosure.getAttribute("aria-expanded")) === "true",
    `Resume disclosure ${index + 1} must open from the keyboard`,
  );
  assert(
    disclosureTarget
      ? await page.locator(`[id=${JSON.stringify(disclosureTarget)}]`).isVisible()
      : false,
    `Resume disclosure ${index + 1} content must be visible when expanded`,
  );
}

await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
const reducedMotionState = await page.evaluate(() => {
  const fade = document.querySelector("[data-blur-fade]");
  const dockIcon = document.querySelector("[data-dock-icon]");
  const duration = fade ? getComputedStyle(fade).animationDuration : null;
  return {
    fadeDurationSeconds: duration
      ? duration.endsWith("ms")
        ? Number.parseFloat(duration) / 1000
        : Number.parseFloat(duration)
      : null,
    dockTransform: dockIcon ? getComputedStyle(dockIcon).transform : null,
  };
});
assert(
  reducedMotionState.fadeDurationSeconds !== null &&
    reducedMotionState.fadeDurationSeconds <= 0.001,
  "Reduced motion must collapse BlurFade animation duration",
);
assert(
  reducedMotionState.dockTransform === "none",
  "Reduced motion must disable dock transforms",
);
await page.emulateMedia({ reducedMotion: "no-preference" });

await page.goto(`${baseUrl}/projects`, { waitUntil: "networkidle" });
assert(
  (await page.locator("main img").count()) === 14,
  "Projects must show all 14 project images",
);
assert(
  (await page
    .getByRole("link", { name: "Projects" })
    .getAttribute("aria-current")) === "page",
  "Projects navigation item must expose the current page",
);
await page.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
});
await page.keyboard.press("Tab");
assert(
  (await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))) ===
    "Home",
  "Tab must reach primary navigation first",
);
for (const filter of [
  "All",
  "AI and ML",
  "Developer Tools and Web",
  "Systems, HFT, and Data",
]) {
  const height = await page.getByRole("button", { name: filter }).evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  assert(height >= 44, `${filter} filter must have a 44px touch target`);
}

const aiFilter = page.getByRole("button", { name: "AI and ML" });
await aiFilter.focus();
await page.keyboard.press("Space");
await page.waitForURL(/filter=AI(?:\+|%20)and(?:\+|%20)ML/);
assert(
  (await page.locator("main img").count()) === 3,
  "AI and ML filter must show three projects",
);
assert(
  (await page.getByRole("button", { name: "AI and ML" }).getAttribute(
    "aria-pressed",
  )) === "true",
  "AI and ML filter must expose its pressed state",
);

const resumeResponse = await context.request.get(
  `${baseUrl}/resumes/ishaan-goyal-ai-infrastructure.pdf`,
);
assert(resumeResponse.ok(), "Resume download must return a successful response");
assert(
  resumeResponse.headers()["content-type"]?.includes("application/pdf"),
  "Resume download must return a PDF content type",
);

await page.setViewportSize({ width: 320, height: 900 });
for (const route of ["/", "/projects"]) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  const dockOverlap = await page.evaluate(() => {
    const dock = document.querySelector('nav[aria-label="Primary navigation"]');
    if (!dock) return true;
    const dockRect = dock.getBoundingClientRect();
    return [...document.querySelectorAll("main a, main button")]
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.visibility !== "hidden" && style.display !== "none";
      })
      .some((element) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > dockRect.top && rect.top < dockRect.bottom;
      });
  });
  assert(!dockOverlap, `${route} dock must not cover interactive content`);
}

const noScriptContext = await browser.newContext({ javaScriptEnabled: false });
const noScriptPage = await noScriptContext.newPage();
for (const route of ["/", "/projects"]) {
  await noScriptPage.goto(`${baseUrl}${route}`, { waitUntil: "load" });
  assert(
    (await noScriptPage.locator("h1").count()) === 1,
    `${route} must keep server-rendered content without JavaScript`,
  );
}
await noScriptContext.close();

await browser.close();

assert(
  runtimeErrors.length === 0,
  `Browser runtime must have no errors: ${runtimeErrors.join(" | ")}`,
);

const lighthouseChrome = await launchChrome({
  chromePath,
  chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
});

try {
  for (const route of ["/", "/projects"]) {
    const result = await lighthouse(`${baseUrl}${route}`, {
      port: lighthouseChrome.port,
      logLevel: "error",
      onlyCategories: ["performance", "accessibility"],
    });
    const report = result?.lhr;
    assert(Boolean(report), `${route} Lighthouse report must complete`);
    if (!report) continue;

    const performance = Math.round(report.categories.performance.score * 100);
    const accessibility = Math.round(
      report.categories.accessibility.score * 100,
    );
    const lcp = report.audits["largest-contentful-paint"].numericValue;
    const cls = report.audits["cumulative-layout-shift"].numericValue;

    assert(performance >= 90, `${route} performance must be at least 90`);
    assert(accessibility >= 95, `${route} accessibility must be at least 95`);
    assert(lcp < 2500, `${route} LCP must be below 2.5 seconds`);
    assert(cls < 0.1, `${route} CLS must be below 0.1`);

    console.log(
      `${route} Lighthouse: performance ${performance}, accessibility ${accessibility}, LCP ${(lcp / 1000).toFixed(2)}s, CLS ${cls.toFixed(3)}`,
    );
  }
} finally {
  await lighthouseChrome.kill();
}

if (failures > 0) {
  console.error(`${failures} quality checks failed.`);
  process.exit(1);
}

console.log("All quality checks passed.");
