"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const GitHubActivity = dynamic(() => import("@/components/GitHubActivity"), {
  loading: () => (
    <div
      className="h-44 animate-pulse rounded-xl border bg-muted/50 motion-reduce:animate-none"
      aria-hidden="true"
    />
  ),
});

export default function LazyGitHubActivity() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-44">
      {shouldLoad ? (
        <GitHubActivity />
      ) : (
        <div
          className="h-44 rounded-xl border bg-muted/20"
          role="status"
          aria-label="GitHub activity loads when this section is nearby"
        />
      )}
    </div>
  );
}
