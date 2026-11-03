import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { parseArticle, MAX_ARTICLE_BYTES } from "./article-parser";
import type { ArticleSnapshot } from "./editor-types";

export function editorEnabled() {
  return process.env.LOCAL_ARTICLE_EDITOR === "1" && (process.env.LOCAL_ARTICLE_EDITOR_TOKEN?.length ?? 0) >= 32;
}
function allowedOrigins() {
  return new Set((process.env.LOCAL_ARTICLE_EDITOR_ORIGINS ?? "").split(",").map(value => value.trim()).filter(Boolean));
}
function allowedHost(host: string | null) {
  return host !== null && Array.from(allowedOrigins()).some(origin => { try { return new URL(origin).host === host; } catch { return false; } });
}
export async function localEditorAccess() {
  if (!editorEnabled()) return null;
  const requestHeaders = await headers();
  if (!allowedHost(requestHeaders.get("host"))) return null;
  return { token: process.env.LOCAL_ARTICLE_EDITOR_TOKEN! };
}
export function articleFilePath() {
  const external = editorEnabled() ? process.env.LOCAL_ARTICLE_SOURCE_PATH : undefined;
  return path.resolve(external ?? path.join(process.cwd(), "content/blogs/inside-hbm3e.md"));
}
const revision = (text: string) => createHash("sha256").update(text).digest("hex");
export async function readArticleSnapshot(): Promise<ArticleSnapshot> {
  if (editorEnabled()) noStore();
  const file = articleFilePath();
  const [markdown, stat] = await Promise.all([fs.readFile(file, "utf8"), fs.stat(file)]);
  return { markdown, revision: revision(markdown), modifiedAt: stat.mtime.toISOString() };
}
export function checkEditorRequest(request: Request, write = false): Response | null {
  if (!editorEnabled()) return Response.json({ error: "Not found" }, { status: 404 });
  const host = request.headers.get("host");
  if (!allowedHost(host)) return Response.json({ error: "This host is not enabled for the local editor." }, { status: 403 });
  const origin = request.headers.get("origin");
  if (write && (!origin || !allowedOrigins().has(origin) || new URL(origin).host !== host)) return Response.json({ error: "Save requests must come from this editor." }, { status: 403 });
  const supplied = Buffer.from(request.headers.get("x-article-editor-token") ?? "");
  const expected = Buffer.from(process.env.LOCAL_ARTICLE_EDITOR_TOKEN!);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return Response.json({ error: "Reopen the editor to reconnect this session." }, { status: 403 });
  return null;
}
export class ArticleConflict extends Error {
  constructor(public current: ArticleSnapshot) { super("The file changed on disk. Your draft has been kept; load the new file before saving."); }
}
// A process-wide queue serializes saves, including across development hot reloads.
const state = globalThis as typeof globalThis & { __hbmArticleSaveQueue?: Promise<void> };
export async function saveArticle(markdown: string, baseRevision: string): Promise<ArticleSnapshot> {
  if (Buffer.byteLength(markdown, "utf8") > MAX_ARTICLE_BYTES) throw new Error("The article is too large (maximum 512 KB).");
  parseArticle(markdown);
  const previous = state.__hbmArticleSaveQueue ?? Promise.resolve();
  let release!: () => void;
  state.__hbmArticleSaveQueue = new Promise<void>(resolve => { release = resolve; });
  await previous;
  const file = articleFilePath();
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`);
  try {
    const current = await readArticleSnapshot();
    if (current.revision !== baseRevision) throw new ArticleConflict(current);
    const history = path.join(path.dirname(file), ".history", "inside-hbm3e");
    await fs.mkdir(history, { recursive: true });
    await fs.writeFile(path.join(history, `${Date.now()}-${randomUUID()}-${current.revision.slice(0, 12)}.md`), current.markdown, { flag: "wx", mode: 0o600 });
    await fs.writeFile(temporary, markdown, { flag: "wx", mode: 0o600 });
    const latest = await readArticleSnapshot();
    if (latest.revision !== baseRevision) throw new ArticleConflict(latest);
    await fs.rename(temporary, file);
    return readArticleSnapshot();
  } finally {
    await fs.unlink(temporary).catch(() => undefined);
    release();
  }
}
