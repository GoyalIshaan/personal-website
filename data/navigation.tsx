import { Icons } from "@/components/icons";
import { FileTextIcon, HomeIcon, NotebookIcon } from "lucide-react";

export const RESUME_HREF =
  "/resumes/ishaan-goyal-ai-infrastructure.pdf";

export const NAV_ITEMS = [
  { href: "/", icon: HomeIcon, label: "Home", newTab: false },
  {
    href: "/projects",
    icon: NotebookIcon,
    label: "Projects",
    newTab: false,
  },
  {
    href: RESUME_HREF,
    icon: FileTextIcon,
    label: "Resume",
    newTab: true,
  },
] as const;

export const SOCIAL_LINKS = {
  GitHub: {
    name: "GitHub",
    url: "https://github.com/GoyalIshaan",
    icon: Icons.github,
    navbar: true,
  },
  LinkedIn: {
    name: "LinkedIn",
    url: "https://linkedin.com/in/ishaan-goyal",
    icon: Icons.linkedin,
    navbar: true,
  },
  X: {
    name: "X",
    url: "https://x.com/IshaanGoyal05",
    icon: Icons.x,
    navbar: true,
  },
  email: {
    name: "Send Email",
    url: "mailto:ishaan6@illinois.edu",
    icon: Icons.email,
    navbar: false,
  },
} as const;
