"use client";
import { useEffect, useState } from "react";
import { parseArticle } from "./article-parser";
import { ArticleView } from "./article-view";

function read(markdown: string) {
  try { return { article: parseArticle(markdown), error: null }; }
  catch (error) { return { article: null, error: error instanceof Error ? error.message : "The Markdown could not be read." }; }
}
export function DraftPreview({ initialMarkdown }: { initialMarkdown: string }) {
  const [value, setValue] = useState(() => read(initialMarkdown));
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== parent || event.data?.type !== "hbm-draft" || typeof event.data.markdown !== "string") return;
      const next = read(event.data.markdown);
      if (next.article) setValue(next);
      parent.postMessage({ type: "hbm-draft-result", sequence: event.data.sequence, error: next.error }, location.origin);
    };
    window.addEventListener("message", receive);
    parent.postMessage({ type: "hbm-preview-ready" }, location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  return value.article ? <ArticleView article={value.article} /> : <main style={{ padding: 24 }}><p>{value.error}</p></main>;
}
