"use client";

import { useTheme } from "next-themes";
import GitHubCalendar from "react-github-calendar";

const githubTheme = {
  light: ["#f2f4f3", "#c8e6d2", "#78bd91", "#318357", "#175c39"],
  dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
};

export default function GitHubActivity() {
  const { resolvedTheme } = useTheme();
  const colorScheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-xl border bg-card p-4 text-card-foreground sm:p-6">
      <div className="mx-auto w-max min-w-full" aria-label="GitHub contribution calendar">
        <GitHubCalendar
          username="GoyalIshaan"
          theme={githubTheme}
          colorScheme={colorScheme}
          year={new Date().getFullYear()}
        />
      </div>
    </div>
  );
}
