import type { Metadata } from "next";
import { HBM3E_POST } from "@/data/blogs";
import { localEditorAccess, readArticleSnapshot } from "./article-file";
import { parseArticle } from "./article-parser";
import { ArticleView } from "./article-view";
import { LocalArticleRefresh } from "./local-article-refresh";

export const metadata: Metadata = {
  title: HBM3E_POST.title,
  description: "Follow a read from a DRAM cell through the banks, channels, TSVs, base die and interposer. An illustrated explanation of HBM3E, bandwidth, power and GPU memory access.",
  alternates: { canonical: `/blogs/${HBM3E_POST.slug}` },
  openGraph: { title: `${HBM3E_POST.title} — Ishaan Goyal`, description: HBM3E_POST.description, type: "article", authors: ["Ishaan Goyal"], url: `/blogs/${HBM3E_POST.slug}` },
};


export default async function Page() {
  const [snapshot, access] = await Promise.all([readArticleSnapshot(), localEditorAccess()]);
  try {
    const article = parseArticle(snapshot.markdown);
    return <>{access && <LocalArticleRefresh token={access.token} revision={snapshot.revision} />}<ArticleView article={article} editable={!!access} /></>;
  } catch (error) {
    if (!access) throw error;
    return <main style={{ padding: 40 }}><LocalArticleRefresh token={access.token} revision={snapshot.revision} /><h1>The article needs a small fix</h1><p>{error instanceof Error ? error.message : "The Markdown could not be read."}</p><a href="/blogs/inside-hbm3e/edit">Open the editor</a></main>;
  }
}
