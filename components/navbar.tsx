"use client";
import Link from "next/link";

export function Navbar() {
  const navLinks = [
    { href: "/", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/writing", label: "Writing" },
  ];

  return (
    <nav className="fixed top-4 right-10 flex flex-row gap-6 items-center">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
