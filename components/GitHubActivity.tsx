"use client";
import GitHubCalendar from "react-github-calendar";

const githubDarkTheme = {
  dark: [
    "#161b22", // background
    "#0e4429", // grade1
    "#006d32", // grade2
    "#26a641", // grade3
    "#39d353", // grade4
  ],
};

export default function GitHubActivity() {
  return (
    <div
      className="overflow-x-auto w-full flex justify-center rounded-xl p-6"
      style={{ background: "#161b22", color: "#fff" }}
    >
      <GitHubCalendar
        username="GoyalIshaan"
        theme={githubDarkTheme}
        colorScheme="dark"
        year={2025}
      />
    </div>
  );
}
