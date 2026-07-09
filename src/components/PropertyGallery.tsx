"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared property image gallery. Two entry points, one behaviour contract:
 *
 *  - <PropertyCardImage> — compact, for grid/list cards. Auto-advances through
 *    the photos (pauses on hover), tiny dot indicators, arrows on hover.
 *  - <PropertyGallery>   — full, for detail pages. Arrows, dots, counter,
 *    keyboard (←/→), touch swipe, optional auto-play until the user interacts.
 *
 * Both collapse gracefully: with a single photo they render a plain image with
 * NO arrows, dots, or counter.
 */

const PLACEHOLDER = "/images/prop1.jpg";

function useCarousel(count: number) {
  const [rawIndex, setIndex] = useState(0);
  // Clamp at read time so a shrinking photo set never points out of range
  // (avoids a setState-in-effect just to correct the index).
  const index = count > 0 ? ((rawIndex % count) + count) % count : 0;
  const clamp = useCallback((n: number) => (count > 0 ? ((n % count) + count) % count : 0), [count]);
  const go = useCallback((n: number) => setIndex(clamp(n)), [clamp]);
  const next = useCallback(() => setIndex((i) => clamp(i + 1)), [clamp]);
  const prev = useCallback(() => setIndex((i) => clamp(i - 1)), [clamp]);
  return { index, go, next, prev };
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Dot indicators — the active dot widens into a pill. */
function Dots({
  count,
  index,
  onDot,
  light = true,
}: {
  count: number;
  index: number;
  onDot?: (i: number) => void;
  light?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => {
        const active = i === index;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Go to photo ${i + 1}`}
            onClick={
              onDot
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDot(i);
                  }
                : undefined
            }
            style={{
              height: 6,
              width: active ? 18 : 6,
              borderRadius: 999,
              background: active
                ? light
                  ? "#FFFFFF"
                  : "#305E82"
                : light
                  ? "rgba(255,255,255,0.55)"
                  : "rgba(48,94,130,0.3)",
              border: "none",
              padding: 0,
              cursor: onDot ? "pointer" : "default",
              transition: "width 0.25s ease, background 0.25s ease",
            }}
          />
        );
      })}
    </div>
  );
}

/** A round, glassy arrow control used on both surfaces. */
function ArrowButton({
  dir,
  onClick,
  size = 36,
  className,
}: {
  dir: "left" | "right";
  onClick: () => void;
  size?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "Previous photo" : "Next photo"}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(18,18,18,0.45)",
        color: "#FFFFFF",
        border: "1px solid rgba(255,255,255,0.35)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        cursor: "pointer",
      }}
    >
      <Chevron dir={dir} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Card image — auto-advancing, minimal chrome.
// ---------------------------------------------------------------------------
export function PropertyCardImage({
  images,
  alt,
  sizes,
  intervalMs = 4000,
  className,
}: {
  images: string[];
  alt: string;
  sizes?: string;
  intervalMs?: number;
  className?: string;
}) {
  const imgs = images.length ? images : [PLACEHOLDER];
  const single = imgs.length <= 1;
  const { index, go, next, prev } = useCarousel(imgs.length);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (single || paused) return;
    const t = setInterval(next, intervalMs);
    return () => clearInterval(t);
  }, [single, paused, next, intervalMs]);

  return (
    <div
      className={`group relative h-full w-full overflow-hidden ${className ?? ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Stacked layers crossfade so the change reads as one continuous image. */}
      {imgs.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt={i === index ? alt : ""}
          fill
          sizes={sizes}
          style={{
            objectFit: "cover",
            opacity: i === index ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
          priority={i === 0}
        />
      ))}

      {!single && (
        <>
          {/* Arrows — revealed on hover so the card stays clean at rest. */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="pointer-events-auto">
              <ArrowButton dir="left" size={30} onClick={prev} />
            </span>
            <span className="pointer-events-auto">
              <ArrowButton dir="right" size={30} onClick={next} />
            </span>
          </div>
          {/* Dots — always visible so users know there's more than one photo. */}
          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            <Dots count={imgs.length} index={index} onDot={go} />
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full gallery — for detail pages.
// ---------------------------------------------------------------------------
export function PropertyGallery({
  images,
  alt,
  radius = 20,
  autoPlay = true,
  intervalMs = 5000,
  className,
}: {
  images: string[];
  alt: string;
  radius?: number;
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
}) {
  const imgs = images.length ? images : [PLACEHOLDER];
  const single = imgs.length <= 1;
  const { index, go, next, prev } = useCarousel(imgs.length);
  const [interacted, setInteracted] = useState(false);
  const touchX = useRef<number | null>(null);

  // Auto-play only until the first manual interaction, then hand over control.
  useEffect(() => {
    if (single || !autoPlay || interacted) return;
    const t = setInterval(next, intervalMs);
    return () => clearInterval(t);
  }, [single, autoPlay, interacted, next, intervalMs]);

  const stop = () => setInteracted(true);
  const onPrev = () => {
    stop();
    prev();
  };
  const onNext = () => {
    stop();
    next();
  };

  // Keyboard arrows when the gallery is focused.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (single) return;
    if (e.key === "ArrowLeft") onPrev();
    else if (e.key === "ArrowRight") onNext();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (single || touchX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (Math.abs(dx) > 40) {
      stop();
      if (dx < 0) next();
      else prev();
    }
    touchX.current = null;
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={{ borderRadius: radius, background: "#EDEDED" }}
      tabIndex={single ? -1 : 0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role={single ? undefined : "group"}
      aria-roledescription={single ? undefined : "carousel"}
    >
      <div className="relative h-full w-full">
        {imgs.map((src, i) => (
          <Image
            key={`${src}-${i}`}
            src={src}
            alt={i === index ? alt : ""}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            style={{
              objectFit: "cover",
              opacity: i === index ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
            priority={i === 0}
          />
        ))}
      </div>

      {!single && (
        <>
          <div className="absolute inset-0 flex items-center justify-between px-3 md:px-4">
            <ArrowButton dir="left" onClick={onPrev} />
            <ArrowButton dir="right" onClick={onNext} />
          </div>

          {/* Counter pill */}
          <div
            className="absolute right-3 top-3 md:right-4 md:top-4 inline-flex items-center"
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(18,18,18,0.55)",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 600,
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            {index + 1}/{imgs.length}
          </div>

          <div className="absolute inset-x-0 bottom-3 md:bottom-4 flex justify-center">
            <Dots
              count={imgs.length}
              index={index}
              onDot={(i) => {
                stop();
                go(i);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
