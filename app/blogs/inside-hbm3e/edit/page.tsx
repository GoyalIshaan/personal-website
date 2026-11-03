import { notFound } from "next/navigation";
import { articleFilePath, localEditorAccess, readArticleSnapshot } from "../article-file";
import { ArticleEditor } from "../editor-client";
export const metadata = { title: "Edit Inside HBM3E", robots: { index: false, follow: false } };
export default async function EditPage() {
  const access = await localEditorAccess(); if (!access) notFound();
  return <ArticleEditor initial={await readArticleSnapshot()} token={access.token} filePath={articleFilePath()} />;
}
