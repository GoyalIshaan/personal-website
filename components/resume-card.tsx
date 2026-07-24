"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  summary?: string;
  description?: string;
}

function hasValidHref(href?: string): href is string {
  return Boolean(href && href.trim() && href.trim() !== "#");
}

export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  summary,
  description,
}: ResumeCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const detailsId = React.useId();
  const externalHref = hasValidHref(href) ? href : undefined;

  return (
    <article className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/40 motion-reduce:transition-none">
      <div className="flex-none">
        <div className="relative size-12 overflow-hidden rounded-full border bg-muted-background dark:bg-foreground">
          <Image
            src={logoUrl}
            alt={altText}
            fill
            loading="eager"
            sizes="48px"
            unoptimized
            className="object-contain"
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-x-4">
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-semibold leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 break-words font-sans text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {period}
          </time>
        </div>

        {summary && (
          <p className="mt-2 text-pretty text-xs font-medium leading-relaxed text-foreground/90">
            {summary}
          </p>
        )}

        {badges && badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1" aria-label="Skills used">
            {badges.map((badge) => (
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-xs"
                key={badge}
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {(description || externalHref) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {description && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11 px-2 text-xs"
                aria-expanded={isExpanded}
                aria-controls={detailsId}
                onClick={() => setIsExpanded((expanded) => !expanded)}
              >
                <ChevronRightIcon
                  className={cn(
                    "size-3.5 transition-transform duration-200 motion-reduce:transition-none",
                    isExpanded && "rotate-90",
                  )}
                  aria-hidden="true"
                />
                {isExpanded ? "Hide details" : "Show details"}
              </Button>
            )}
            {externalHref && (
              <Button asChild variant="outline" size="sm" className="min-h-11 px-3 text-xs">
                <Link href={externalHref} target="_blank" rel="noreferrer">
                  <ExternalLinkIcon className="size-3" aria-hidden="true" />
                  View
                  <span className="sr-only"> {title}</span>
                </Link>
              </Button>
            )}
          </div>
        )}

        {description && (
          <div
            id={detailsId}
            hidden={!isExpanded}
            className="mt-2 border-t pt-2 text-xs leading-relaxed text-muted-foreground"
          >
            {description}
          </div>
        )}
      </div>
    </article>
  );
};
