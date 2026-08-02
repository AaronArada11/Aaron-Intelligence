import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function BounceCards({
  className = "",
  images = [],
  imageAlts = [],
  cardTitles = [],
  cardDescriptions = [],
  cardKickers = [],
  containerWidth = 400,
  containerHeight = 400,
  cardSize = 200,
  cardAspectRatio = "1 / 1",
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = "elastic.out(1, 0.8)",
  transformStyles = [
    "rotate(10deg) translate(-170px)",
    "rotate(5deg) translate(-85px)",
    "rotate(-3deg)",
    "rotate(-10deg) translate(85px)",
    "rotate(2deg) translate(170px)",
  ],
  enableHover = false,
  onActiveIndexChange,
  onPointerLeave,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".card",
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [animationDelay, animationStagger, easeType]);

  const getNoRotationTransform = (transformStr) => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);

    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)");
    }

    if (transformStr === "none") {
      return "rotate(0deg)";
    }

    return `${transformStr} rotate(0deg)`;
  };

  const getPushedTransform = (baseTransform, offsetX) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);

    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    }

    return baseTransform === "none"
      ? `translate(${offsetX}px)`
      : `${baseTransform} translate(${offsetX}px)`;
  };

  const pushSiblings = (hoveredIdx) => {
    const q = gsap.utils.selector(containerRef);

    onActiveIndexChange?.(hoveredIdx);

    if (!enableHover || !containerRef.current) return;

    images.forEach((_, i) => {
      const selector = q(`.card-${i}`);
      gsap.killTweensOf(selector);

      const baseTransform = transformStyles[i] || "none";

      if (i === hoveredIdx) {
        gsap.to(selector, {
          transform: getNoRotationTransform(baseTransform),
          duration: 0.4,
          ease: "back.out(1.4)",
          overwrite: "auto",
        });
      } else {
        const offsetX = i < hoveredIdx ? -96 : 96;
        const pushedTransform = getPushedTransform(baseTransform, offsetX);
        const distance = Math.abs(hoveredIdx - i);

        gsap.to(selector, {
          transform: pushedTransform,
          duration: 0.4,
          ease: "back.out(1.4)",
          delay: distance * 0.05,
          overwrite: "auto",
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;

    onPointerLeave?.();

    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const selector = q(`.card-${i}`);
      gsap.killTweensOf(selector);

      gsap.to(selector, {
        transform: transformStyles[i] || "none",
        duration: 0.4,
        ease: "back.out(1.4)",
        overwrite: "auto",
      });
    });
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={containerRef}
      style={{
        width: containerWidth,
        maxWidth: "100%",
        height: containerHeight,
      }}
    >
      {images.map((src, idx) => (
        <div
          key={`${src}-${idx}`}
          className={`card card-${idx} group absolute overflow-hidden rounded-xl border-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4`}
          role="button"
          tabIndex={0}
          aria-label={cardTitles[idx] ? `Show ${cardTitles[idx]} details` : `Show event card ${idx + 1}`}
          style={{
            width: cardSize,
            aspectRatio: cardAspectRatio,
            borderColor: "var(--ctp-surface0)",
            boxShadow: "0 10px 22px rgba(0, 0, 0, 0.24)",
            transform: transformStyles[idx] || "none",
            background: "var(--ctp-crust)",
            outlineColor: "var(--ctp-accent)",
          }}
          onMouseEnter={() => pushSiblings(idx)}
          onMouseLeave={resetSiblings}
          onFocus={() => pushSiblings(idx)}
          onBlur={resetSiblings}
        >
          <img className="h-full w-full object-cover" src={src} alt={imageAlts[idx] || `Event card ${idx + 1}`} />

          {(cardTitles[idx] || cardDescriptions[idx]) && (
            <div className="card-caption pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 space-y-1 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
              {cardKickers[idx] && (
                <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-wider text-[var(--ctp-green)]">
                  {cardKickers[idx]}
                </p>
              )}
              {cardTitles[idx] && (
                <p className="font-sans text-xs font-semibold leading-snug text-white">
                  {cardTitles[idx]}
                </p>
              )}
              {cardDescriptions[idx] && (
                <p className="line-clamp-3 font-sans text-[0.68rem] leading-snug text-white/80">
                  {cardDescriptions[idx]}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
