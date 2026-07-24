import { cn } from "@/lib/utils";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type BlurFadeStyle = CSSProperties & {
  "--blur-fade-delay"?: string;
  "--blur-fade-duration"?: string;
  "--blur-fade-y"?: string;
  "--blur-fade-blur"?: string;
};

interface BlurFadeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
  variant?: unknown;
}

const BlurFade = ({
  children,
  className,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  blur = "6px",
  style,
  variant: _variant,
  inView: _inView,
  inViewMargin: _inViewMargin,
  ...props
}: BlurFadeProps) => {
  void _variant;
  void _inView;
  void _inViewMargin;

  const safeDuration = Math.min(Math.max(duration, 0), 0.5);
  const safeDelay = Math.min(
    Math.max(delay, 0),
    Math.max(0, 0.6 - safeDuration),
  );
  const animationStyle: BlurFadeStyle = {
    ...style,
    "--blur-fade-delay": `${safeDelay}s`,
    "--blur-fade-duration": `${safeDuration}s`,
    "--blur-fade-y": `${yOffset}px`,
    "--blur-fade-blur": blur,
  };

  return (
    <div
      data-blur-fade=""
      className={cn("blur-fade", className)}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default BlurFade;
