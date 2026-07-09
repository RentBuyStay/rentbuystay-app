"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared property media gallery. Two entry points, one behaviour contract:
 *
 *  - <PropertyCardImage> — compact, for grid/list cards. Auto-advances through
 *    the media (pauses on hover), tiny dot indicators, arrows on hover.
 *  - <PropertyGallery>   — full, for detail pages. Arrows, dots, counter,
 *    keyboard (←/→), touch swipe, optional auto-play until the user interacts.
 *
 * Both handle images AND videos, and collapse gracefully: with a single item
 * they render it plain with NO arrows, dots, or counter.
 */

const PLACEHOLDER = "/images/prop1.jpg";

export type MediaItem = { url: string; type: "image" | "video" };

/** Build media items from a backend photos[] array (contentType → image/video). */
export function toMediaItems(
  photos?: { url: string; contentType?: string | null }[],
  fallback: string[] = [PLACEHOLDER],
): MediaItem[] {
  if (!photos?.length) return fallback.map((url) => ({ url, type: "image" }));
  const items = photos
    .filter((p) => p.url)
    .map((p) => ({
      url: p.url,
      type: (p.contentType?.startsWith("video/") ? "video" : "image") as MediaItem["type"],
    }));
  return items.length ? items : fallback.map((url) => ({ url, type: "image" }));
}

/** Normalize the two accepted prop shapes (media items, or plain image URLs). */
function resolveMedia(media?: MediaItem[], images?: string[]): MediaItem[] {
  if (media?.length) return media;
  if (images?.length) return images.map((url) => ({ url, type: "image" }));
  return [{ url: PLACEHOLDER, type: "image" }];
}

function useCarousel(count: number) {
  const [rawIndex, setIndex] = useState(0);
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

/** Centered play glyph overlaid on video slides. */
function PlayBadge({ small = false }: { small?: boolean }) {
  const d = small ? 28 : 56;
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: d,
          height: d,
          borderRadius: 999,
          background: "rgba(18,18,18,0.5)",
          border: "1px solid rgba(255,255,255,0.6)",
          backdropFilter: "blur(2px)",
        }}
      >
        <svg width={small ? 12 : 20} height={small ? 12 : 20} viewBox="0 0 24 24" fill="#fff">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

/** One slide — an image or a video, sized to cover its container. */
function Slide({
  item,
  active,
  alt,
  sizes,
  controls,
  priority,
}: {
  item: MediaItem;
  active: boolean;
  alt: string;
  sizes?: string;
  controls?: boolean; // true on detail (real player), false on cards (poster frame)
  priority?: boolean;
}) {
  const common = {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    opacity: active ? 1 : 0,
    transition: "opacity 0.5s ease",
  };

  if (item.type === "video") {
    return (
      <>
        <video
          src={item.url}
          muted
          playsInline
          controls={controls}
          preload="metadata"
          style={common}
        />
        {/* Show the play affordance only on non-interactive (card) posters. */}
        {!controls && active && <PlayBadge small />}
      </>
    );
  }

  return (
    <Image
      src={item.url}
      alt={active ? alt : ""}
      fill
      sizes={sizes}
      style={{ objectFit: "cover", opacity: active ? 1 : 0, transition: "opacity 0.5s ease" }}
      priority={priority}
    />
  );
}

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
            aria-label={`Go to item ${i + 1}`}
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
      aria-label={dir === "left" ? "Previous item" : "Next item"}
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
// Card media — auto-advancing, minimal chrome.
// ---------------------------------------------------------------------------
export function PropertyCardImage({
  media,
  images,
  alt,
  sizes,
  intervalMs = 4000,
  className,
}: {
  media?: MediaItem[];
  images?: string[];
  alt: string;
  sizes?: string;
  intervalMs?: number;
  className?: string;
}) {
  const items = resolveMedia(media, images);
  const single = items.length <= 1;
  const { index, go, next, prev } = useCarousel(items.length);
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
      {items.map((item, i) => (
        <Slide key={`${item.url}-${i}`} item={item} active={i === index} alt={alt} sizes={sizes} priority={i === 0} />
      ))}

      {!single && (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="pointer-events-auto">
              <ArrowButton dir="left" size={30} onClick={prev} />
            </span>
            <span className="pointer-events-auto">
              <ArrowButton dir="right" size={30} onClick={next} />
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            <Dots count={items.length} index={index} onDot={go} />
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
  media,
  images,
  alt,
  radius = 20,
  autoPlay = true,
  intervalMs = 5000,
  className,
}: {
  media?: MediaItem[];
  images?: string[];
  alt: string;
  radius?: number;
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
}) {
  const items = resolveMedia(media, images);
  const single = items.length <= 1;
  const hasVideo = items.some((m) => m.type === "video");
  const { index, go, next, prev } = useCarousel(items.length);
  const [interacted, setInteracted] = useState(false);
  const touchX = useRef<number | null>(null);

  // Auto-play only for image-only sets, until the first manual interaction —
  // we never auto-advance past a video the user might be watching.
  useEffect(() => {
    if (single || hasVideo || !autoPlay || interacted) return;
    const t = setInterval(next, intervalMs);
    return () => clearInterval(t);
  }, [single, hasVideo, autoPlay, interacted, next, intervalMs]);

  const stop = () => setInteracted(true);
  const onPrev = () => {
    stop();
    prev();
  };
  const onNext = () => {
    stop();
    next();
  };

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
        {items.map((item, i) => (
          <Slide
            key={`${item.url}-${i}`}
            item={item}
            active={i === index}
            alt={alt}
            sizes="(max-width: 768px) 100vw, 800px"
            controls
            priority={i === 0}
          />
        ))}
      </div>

      {!single && (
        <>
          <div className="absolute inset-0 flex items-center justify-between px-3 md:px-4" style={{ pointerEvents: "none" }}>
            <span style={{ pointerEvents: "auto" }}>
              <ArrowButton dir="left" onClick={onPrev} />
            </span>
            <span style={{ pointerEvents: "auto" }}>
              <ArrowButton dir="right" onClick={onNext} />
            </span>
          </div>

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
            {index + 1}/{items.length}
          </div>

          <div className="absolute inset-x-0 bottom-3 md:bottom-4 flex justify-center">
            <Dots
              count={items.length}
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
