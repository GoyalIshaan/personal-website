"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LocalArticleRefresh({ token, revision }: { token: string; revision: string }) {
  const router = useRouter();
  useEffect(() => {
    const controller = new AbortController(); let pending = false;
    const check = async () => {
      if (pending || document.hidden) return; pending = true;
      try {
        const response = await fetch("/api/local-article", { cache: "no-store", headers: { "x-article-editor-token": token, "If-None-Match": `"${revision}"` }, signal: controller.signal });
        if (response.ok && response.status !== 304 && (await response.json()).revision !== revision) router.refresh();
      } catch { /* The current article remains readable during reconnects. */ }
      finally { pending = false; }
    };
    const interval = window.setInterval(check, 1500); window.addEventListener("focus", check);
    return () => { controller.abort(); window.clearInterval(interval); window.removeEventListener("focus", check); };
  }, [revision, token, router]);
  return null;
}
