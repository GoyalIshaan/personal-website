import AxeBuilder from "@axe-core/playwright";
import { launch as launchChrome } from "chrome-launcher";
import { readFile } from "node:fs/promises";
import lighthouse from "lighthouse";
import { chromium } from "playwright-core";
const baseUrl = process.env.SITE_URL ?? "http://localhost:3210";
const chromePath = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let failures = 0;
const assert = (condition, message) => { if (!condition) { failures++; console.error(`FAIL: ${message}`); } };
const browser = await chromium.launch({executablePath: chromePath, headless:true});
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
try {
 const buildId = (await readFile(new URL("../.next/BUILD_ID", import.meta.url), "utf8")).trim();
 assert((await context.request.get(`${baseUrl}/_next/static/${buildId}/_buildManifest.js`)).ok(), "Current production build must be served");
 for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({width, height:900});
  for (const route of ["/", "/projects"]) {
   await page.goto(baseUrl + route, {waitUntil:"networkidle"});
   const metrics = await page.evaluate(() => ({width:innerWidth, content:document.documentElement.scrollWidth, headings:document.querySelectorAll("h1").length, broken:[...document.images].filter(i=>!i.complete || !i.naturalWidth).length}));
   assert(metrics.width === metrics.content, `${route} must fit ${width}px`);
   assert(metrics.headings === 1 && metrics.broken === 0, `${route} heading and images at ${width}px`);
  }
 }
 for (const route of ["/", "/projects"]) {
  await page.goto(baseUrl + route, {waitUntil:"networkidle"});
  const results = await new AxeBuilder({page}).analyze();
  const blocking = results.violations.filter(v => ["serious", "critical"].includes(v.impact));
  assert(!blocking.length, `${route} accessibility: ${blocking.map(v=>v.id).join(", ")}`);
 }
 await page.goto(baseUrl, {waitUntil:"networkidle"});
 assert(await page.locator('section[aria-labelledby="projects-title"] article').count() === 4, "Homepage must show four selected projects");
 const projects = page.getByRole("link", {name:"View all projects"});
 assert(await projects.count() === 1, "Single all-projects link");
 const resume = await page.getByRole("link", {name:"Résumé PDF"}).getAttribute("href");
 const pdf = await context.request.get(baseUrl + resume);
 assert(pdf.ok() && pdf.headers()["content-type"].includes("application/pdf"), "Résumé must serve a PDF");
 await page.getByRole("button", {name:"Pause background"}).click();
 assert(await page.getByRole("button", {name:"Resume background"}).getAttribute("aria-pressed") === "true", "Rain pause state");
 assert(await page.locator('.rain-drop').first().evaluate(e=>getComputedStyle(e).animationPlayState) === "paused", "Rain actually pauses");
 await projects.click();
 await page.waitForURL('**/projects');
 assert(await page.locator('article').count() === 14, "Archive must contain all 14 projects");
 assert(await page.locator('.category-heading').allTextContents().then(a=>JSON.stringify(a.map(x=>x.trim()))) === JSON.stringify(["ML systems 3","Developer tools & web 6","Systems & data 5"]), "Category counts must be 3, 6, 5");
 assert(await page.getByRole("button", {name:"Resume background"}).getAttribute("aria-pressed") === "true", "Pause preference survives navigation");
 await page.getByRole("button", {name:"Resume background"}).click();
 await page.locator('.breadcrumb').getByRole('link', {name:'Home'}).click();
 await page.waitForURL(baseUrl + '/');
 await page.emulateMedia({reducedMotion:"reduce"});
 assert(await page.locator('.code-background').evaluate(e=>getComputedStyle(e).display) === "none", "Reduced motion disables rain");
 const nojs = await browser.newContext({javaScriptEnabled:false});
 const plain = await nojs.newPage();
 for (const route of ["/", "/projects"]) {
  await plain.goto(baseUrl + route);
  assert(await plain.locator('h1').count() === 1, `${route} readable without JavaScript`);
 }
 await nojs.close();
 assert(errors.length === 0, `Runtime errors: ${errors.join('; ')}`);
 console.log('Navigation, all projects, PDFs, rain controls, responsive and accessibility checks complete.');
} finally { await browser.close(); }

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
