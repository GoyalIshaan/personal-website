import { cn } from "@/lib/utils";
import type { CSSProperties, HTMLAttributes } from "react";

type TextElement = "div" | "span" | "p" | "h1" | "h2" | "h3";

type BlurFadeTextStyle = CSSProperties & {
  "--blur-fade-delay"?: string;
  "--blur-fade-duration"?: string;
  "--blur-fade-y"?: string;
  "--blur-fade-blur"?: string;
};

interface BlurFadeTextProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  text: string;
  as?: TextElement;
  duration?: number;
  characterDelay?: number;
  delay?: number;
  yOffset?: number;
  animateByCharacter?: boolean;
  variant?: unknown;
}

const BlurFadeText = ({
  text,
  as: Element = "div",
  className,
  duration = 0.4,
  characterDelay = 0.03,
  delay = 0,
  yOffset = 8,
  animateByCharacter = false,
  style,
  variant: _variant,
  ...props
}: BlurFadeTextProps) => {
  void _variant;

  const characters = Array.from(text);
  const safeDuration = Math.min(Math.max(duration, 0), 0.5);
  const safeDelay = Math.min(
    Math.max(delay, 0),
    Math.max(0, 0.6 - safeDuration),
  );
  const maximumCharacterDelay =
    characters.length > 1
      ? Math.max(
          0,
          (0.6 - safeDuration - safeDelay) / (characters.length - 1),
        )
      : 0;
  const safeCharacterDelay = Math.min(
    Math.max(characterDelay, 0),
    maximumCharacterDelay,
  );
  const animationStyle: BlurFadeTextStyle = {
    ...style,
    "--blur-fade-delay": `${safeDelay}s`,
    "--blur-fade-duration": `${safeDuration}s`,
    "--blur-fade-y": `${yOffset}px`,
    "--blur-fade-blur": "8px",
  };
  const getCharacterStyle = (index: number): BlurFadeTextStyle => ({
    ...animationStyle,
    "--blur-fade-delay": `${safeDelay + index * safeCharacterDelay}s`,
  });

  if (animateByCharacter) {
    return (
      <Element
        data-blur-fade-text=""
        className={cn("flex flex-wrap", className)}
        aria-label={text}
        style={style}
        {...props}
      >
        {characters.map((character, index) => (
          <span
            key={`${character}-${index}`}
            data-blur-fade=""
            aria-hidden="true"
            className="blur-fade inline-block"
            style={{
              ...getCharacterStyle(index),
              width: character.trim() === "" ? "0.25em" : "auto",
            }}
          >
            {character}
          </span>
        ))}
      </Element>
    );
  }

  return (
    <Element
      data-blur-fade=""
      className={cn("blur-fade", className)}
      style={animationStyle}
      {...props}
    >
      {text}
    </Element>
  );
};

export default BlurFadeText;
