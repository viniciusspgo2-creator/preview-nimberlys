"use client";

import { Lottie } from "lottie-react";
import React from "react";

/**
 * Lazy, reduced-motion-aware Lottie player.
 * JSON files live in /public/lottie.
 */
export function LottiePlayer({
  path,
  className,
  loop = true,
  ariaLabel,
}: {
  path: string;
  className?: string;
  loop?: boolean;
  ariaLabel?: string;
}) {
  const [data, setData] = React.useState<unknown>(null);
  const reduce = React.useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  React.useEffect(() => {
    let alive = true;
    fetch(path)
      .then((r) => r.json())
      .then((json) => {
        if (alive) setData(json);
      })
      .catch(() => null);
    return () => {
      alive = false;
    };
  }, [path]);

  if (!data) return <div className={className} aria-hidden />;
  return (
    <Lottie
      src={data as Record<string, unknown>}
      loop={loop}
      autoplay={!reduce}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
