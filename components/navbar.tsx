"use client";

import { Dock, DockIcon } from "@/components/magicui/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAV_ITEMS, SOCIAL_LINKS } from "@/data/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-2 flex h-full max-h-14 origin-bottom sm:mb-4"
    >
      <div
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"
      />
      <Dock className="pointer-events-auto relative z-50 mx-auto flex h-full min-h-full items-center bg-background p-1 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]">
        {NAV_ITEMS.map((item) => {
          const isCurrent =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <DockIcon key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isCurrent ? "page" : undefined}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noreferrer" : undefined}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "min-h-11 min-w-11 focus-visible:ring-offset-0",
                      isCurrent && "bg-accent text-accent-foreground",
                    )}
                  >
                    <item.icon className="size-4" aria-hidden="true" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          );
        })}
        <Separator orientation="vertical" className="h-6" />
        {Object.entries(SOCIAL_LINKS)
          .filter(([, social]) => social.navbar)
          .map(([name, social]) => (
            <DockIcon key={name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={social.url}
                    aria-label={social.name ?? name}
                    target={isExternalHref(social.url) ? "_blank" : undefined}
                    rel={isExternalHref(social.url) ? "noreferrer" : undefined}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "min-h-11 min-w-11 focus-visible:ring-offset-0",
                    )}
                  >
                    <social.icon className="size-4" aria-hidden="true" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
        <Separator orientation="vertical" className="h-6" />
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <ModeToggle />
            </TooltipTrigger>
            <TooltipContent>
              <p>Theme</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </nav>
  );
}
