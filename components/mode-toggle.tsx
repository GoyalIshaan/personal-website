"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

export function ModeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      className={`mode-toggle ${className}`.trim()}
      type="button"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      <span className="theme-light"><SunIcon aria-hidden="true" />Light mode</span>
      <span className="theme-dark"><MoonIcon aria-hidden="true" />Dark mode</span>
    </button>
  );
}
