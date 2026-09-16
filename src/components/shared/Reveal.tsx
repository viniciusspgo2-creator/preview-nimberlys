"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Direction the element travels from */
  from?: "up" | "down" | "left" | "right" | "scale";
  /** Stagger delay in seconds */
  delay?: number;
  duration?: number;
  className?: string;
  /** Render as another tag */
  as?: "div" | "section" | "article" | "li" | "span";
  once?: boolean;
  amount?: number;
};

const offsets = {
  up: { y: 34, x: 0 },
  down: { y: -34, x: 0 },
  left: { y: 0, x: 40 },
  right: { y: 0, x: -40 },
  scale: { y: 0, x: 0 },
};

/**
 * Horizontal travel needs horizontal room: below Tailwind's `sm` breakpoint a
 * sideways offset can push card glyphs past the clipped (overflow-x hidden)
 * viewport edge (e.g. 320px phones). There, fall back to a vertical slide.
 * Desktop (sm+ / 1440px) behaviour is unchanged.
 */
function useAllowHorizontalOffset() {
  // SSR / desktop default — keeps the hydration render identical to the server
  // output. The post-hydration effect below syncs the real viewport.
  const [allow, setAllow] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setAllow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return allow;
}

/** Scroll-triggered reveal animation wrapper */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  duration = 0.65,
  className,
  as = "div",
  once = true,
  amount = 0.25,
}: RevealProps) {
  const reduce = useReducedMotion();
  const allowX = useAllowHorizontalOffset();
  const Comp = motion[as] as typeof motion.div;
  const off = allowX ? offsets[from] : offsets.up;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <Comp
      key={allowX ? "reveal-x" : "reveal-y"}
      className={className}
      initial={{ opacity: 0, x: off.x, y: off.y, ...(from === "scale" ? { scale: 0.88 } : {}) }}
      whileInView={{ opacity: 1, x: 0, y: 0, ...(from === "scale" ? { scale: 1 } : {}) }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Staggered container: children with `RevealItem` animate in sequence */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  from = "up",
}: {
  children: React.ReactNode;
  className?: string;
  from?: RevealProps["from"];
}) {
  const reduce = useReducedMotion();
  const allowX = useAllowHorizontalOffset();
  const off = allowX ? offsets[from] : offsets.up;
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      key={allowX ? "reveal-x" : "reveal-y"}
      className={className}
      variants={{
        hidden: { opacity: 0, y: off.y, x: off.x },
        show: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
