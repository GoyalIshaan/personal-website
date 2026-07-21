import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";

export type ProjectCardVariant = "featured" | "archive";

interface Props {
  title: string;
  href?: string;
  description?: string;
  summary?: string;
  impact?: string;
  category?: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  imageAlt?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  variant?: ProjectCardVariant;
  priority?: boolean;
  className?: string;
}

function hasValidHref(href?: string): href is string {
  return Boolean(href && href.trim() && href.trim() !== "#");
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export function ProjectCard({
  title,
  href,
  description,
  summary,
  impact,
  category,
  dates,
  tags,
  link,
  image,
  imageAlt,
  video,
  links,
  variant = "archive",
  priority = false,
  className,
}: Props) {
  const projectHref = hasValidHref(href) ? href : undefined;
  const projectLinks = links?.filter((item) => hasValidHref(item.href)) ?? [];
  const cardHref =
    projectHref && !projectLinks.some((item) => item.href === projectHref)
      ? projectHref
      : undefined;
  const visibleTags = variant === "featured" ? tags.slice(0, 4) : tags;
  const fallbackCopy =
    variant === "featured" ? summary ?? description : description ?? summary;
  const media = (
    <>
      {video && (
        <video
          src={video}
          aria-label={imageAlt ?? `${title} project preview`}
          autoPlay
          loop
          muted
          playsInline
          className="pointer-events-none mx-auto h-40 w-full object-cover object-top"
        />
      )}
      {image && (
        <Image
          src={image}
          alt={imageAlt ?? `${title} project preview`}
          width={1600}
          height={900}
          priority={priority}
          sizes="(max-width: 639px) calc(100vw - 3rem), 400px"
          className="h-40 w-full overflow-hidden object-cover object-top transition-transform duration-300 ease-out motion-reduce:transition-none group-hover/media:scale-[1.015]"
        />
      )}
    </>
  );

  return (
    <Card
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden border transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-lg motion-reduce:transition-none",
        className,
      )}
    >
      {(video || image) &&
        (cardHref ? (
          <Link
            href={cardHref}
            aria-label={`Open ${title}`}
            target={isExternalHref(cardHref) ? "_blank" : undefined}
            rel={isExternalHref(cardHref) ? "noreferrer" : undefined}
            className="group/media block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            {media}
          </Link>
        ) : (
          <div className="group/media overflow-hidden">{media}</div>
        ))}

      <CardHeader className="px-4 pb-2 pt-4">
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <CardTitle className="min-w-0 text-base font-semibold leading-tight">
              {cardHref ? (
                <Link
                  href={cardHref}
                  target={isExternalHref(cardHref) ? "_blank" : undefined}
                  rel={isExternalHref(cardHref) ? "noreferrer" : undefined}
                  className="inline-flex min-h-11 items-center rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </CardTitle>
            {category && (
              <Badge
                variant="outline"
                className="shrink-0 px-2 py-0.5 text-[10px] font-medium"
              >
                {category}
              </Badge>
            )}
          </div>
          <time className="block font-sans text-xs text-muted-foreground">
            {dates}
          </time>
          {link && hasValidHref(link) && (
            <div className="hidden break-all font-sans text-xs underline print:block">
              {link.replace(/^https?:\/\//, "").replace(/^www\./, "")}
            </div>
          )}

          {impact && (
            <p className="text-pretty font-sans text-xs font-medium leading-relaxed text-foreground">
              {impact}
            </p>
          )}
          {fallbackCopy && fallbackCopy !== impact && (
            <div className="prose max-w-full break-words text-pretty font-sans text-xs leading-relaxed text-muted-foreground dark:prose-invert">
              <Markdown>{fallbackCopy}</Markdown>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 pb-2">
        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Technologies">
            {visibleTags.map((tag) => (
              <Badge
                className="px-2 py-1 text-[10px] font-medium"
                variant="secondary"
                key={tag}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {projectLinks.length > 0 && (
        <CardFooter className="px-4 pb-4 pt-2">
          <div className="flex w-full flex-wrap gap-2" aria-label="Project links">
            {projectLinks.map((item) => (
              <Link
                href={item.href}
                key={`${item.type}-${item.href}`}
                target={isExternalHref(item.href) ? "_blank" : undefined}
                rel={isExternalHref(item.href) ? "noreferrer" : undefined}
                className="inline-flex min-h-11 min-w-24 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[10px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <span className="shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="truncate text-center">{item.type}</span>
                <span className="sr-only"> for {title}</span>
              </Link>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
