import { checkEditorRequest, readArticleSnapshot, saveArticle, ArticleConflict } from "@/app/blogs/inside-hbm3e/article-file";
import { MAX_ARTICLE_BYTES, parseArticle } from "@/app/blogs/inside-hbm3e/article-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const responseHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
export async function GET(request: Request) {
  const denied = checkEditorRequest(request); if (denied) return denied;
  try {
    const snapshot = await readArticleSnapshot();
    if (request.headers.get("if-none-match") === `"${snapshot.revision}"`) return new Response(null, { status: 304, headers: responseHeaders });
    return Response.json(snapshot, { headers: { ...responseHeaders, ETag: `"${snapshot.revision}"` } });
  } catch { return Response.json({ error: "The Markdown file could not be read. Your draft is still in the editor." }, { status: 500, headers: responseHeaders }); }
}
export async function POST(request: Request) {
  const denied = checkEditorRequest(request, true); if (denied) return denied;
  let markdown: string, baseRevision: string;
  try {
    const reader = request.body?.getReader(); if (!reader) throw new Error("The save request is empty.");
    const chunks: Uint8Array[] = []; let bytes = 0;
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_ARTICLE_BYTES * 2) { await reader.cancel(); return Response.json({ error: "The save request is too large." }, { status: 413, headers: responseHeaders }); }
      chunks.push(chunk.value);
    }
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object") throw new Error("The save request is invalid.");
    const input = value as Record<string, unknown>;
    if (typeof input.markdown !== "string" || typeof input.baseRevision !== "string" || !/^[a-f0-9]{64}$/.test(input.baseRevision)) throw new Error("The file revision is missing. Reopen the editor and try again.");
    markdown = input.markdown; baseRevision = input.baseRevision;
    if (Buffer.byteLength(markdown, "utf8") > MAX_ARTICLE_BYTES) throw new Error("The article is too large (maximum 512 KB).");
    parseArticle(markdown);
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "The article could not be parsed." }, { status: 422, headers: responseHeaders }); }
  try { return Response.json(await saveArticle(markdown, baseRevision), { headers: responseHeaders }); }
  catch (error) {
    if (error instanceof ArticleConflict) return Response.json({ error: error.message, current: error.current }, { status: 409, headers: responseHeaders });
    return Response.json({ error: "The file could not be saved. Your draft is still in the editor." }, { status: 500, headers: responseHeaders });
  }
}
