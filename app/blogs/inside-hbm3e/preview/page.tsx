import { notFound } from "next/navigation";
import { localEditorAccess, readArticleSnapshot } from "../article-file";
import { DraftPreview } from "../draft-preview";
export const metadata = { title: "Article preview", robots: { index: false, follow: false } };
export default async function PreviewPage() {
  if (!await localEditorAccess()) notFound();
  return <DraftPreview initialMarkdown={(await readArticleSnapshot()).markdown} />;
}
