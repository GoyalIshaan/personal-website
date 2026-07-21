"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface DockProps
  extends VariantProps<typeof dockVariants>,
    React.HTMLAttributes<HTMLDivElement> {
  magnification?: number;
  distance?: number;
}

const DEFAULT_SIZE = 44;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

const dockVariants = cva(
  "mx-auto flex h-full w-max items-end rounded-full border p-2",
);

const Dock = forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      magnification = DEFAULT_MAGNIFICATION,
      distance = DEFAULT_DISTANCE,
      onPointerMove,
      onPointerLeave,
      ...props
    },
    forwardedRef,
  ) => {
    const dockRef = useRef<HTMLDivElement>(null);
    const animationFrame = useRef<number | null>(null);
    const canMagnify = useRef(false);

    useImperativeHandle(forwardedRef, () => dockRef.current as HTMLDivElement);

    useEffect(() => {
      const pointerQuery = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      );
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const updateSupport = () => {
        canMagnify.current = pointerQuery.matches && !motionQuery.matches;
      };

      updateSupport();
      pointerQuery.addEventListener("change", updateSupport);
      motionQuery.addEventListener("change", updateSupport);

      return () => {
        pointerQuery.removeEventListener("change", updateSupport);
        motionQuery.removeEventListener("change", updateSupport);
      };
    }, []);

    useEffect(
      () => () => {
        if (animationFrame.current !== null)
          cancelAnimationFrame(animationFrame.current);
      },
      [],
    );

    const resetIcons = useCallback(() => {
      dockRef.current
        ?.querySelectorAll<HTMLElement>("[data-dock-icon]")
        .forEach((icon) => icon.style.setProperty("--dock-scale", "1"));
    }, []);

    const updateIcons = useCallback(
      (pointerX: number) => {
        dockRef.current
          ?.querySelectorAll<HTMLElement>("[data-dock-icon]")
          .forEach((icon) => {
            const bounds = icon.getBoundingClientRect();
            const delta = Math.abs(pointerX - (bounds.left + bounds.width / 2));
            const proximity = Math.max(0, 1 - delta / distance);
            const scale =
              1 + (magnification / DEFAULT_SIZE - 1) * proximity * proximity;
            icon.style.setProperty("--dock-scale", scale.toFixed(3));
          });
      },
      [distance, magnification],
    );

    return (
      <div
        ref={dockRef}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (!canMagnify.current) return;
          if (animationFrame.current !== null)
            cancelAnimationFrame(animationFrame.current);
          animationFrame.current = requestAnimationFrame(() =>
            updateIcons(event.clientX),
          );
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (animationFrame.current !== null)
            cancelAnimationFrame(animationFrame.current);
          resetIcons();
        }}
        className={cn(dockVariants({ className }))}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Dock.displayName = "Dock";

type DockIconStyle = React.CSSProperties & { "--dock-scale"?: string };

export interface DockIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const DockIcon = ({
  size = DEFAULT_SIZE,
  className,
  children,
  style,
  ...props
}: DockIconProps) => {
  const iconStyle: DockIconStyle = {
    ...style,
    width: size,
    height: size,
    "--dock-scale": "1",
  };

  return (
    <div
      data-dock-icon=""
      style={iconStyle}
      className={cn(
        "relative z-0 flex shrink-0 scale-[var(--dock-scale)] cursor-pointer items-center justify-center rounded-full transition-transform duration-150 ease-out hover:z-10 focus-within:z-10 motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon, dockVariants };
