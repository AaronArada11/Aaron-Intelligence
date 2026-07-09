import { motion, useMotionValue, useTransform } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

function getStableRotation(index) {
  const seed = Math.sin((index + 1) * 999) * 10000;
  const normalized = seed - Math.floor(seed);

  return normalized * 10 - 5;
}

function normalizeOrder(order, cardIds) {
  const orderedIds = order.filter((id) => cardIds.includes(id));
  const missingIds = cardIds.filter((id) => !orderedIds.includes(id));

  return [...missingIds, ...orderedIds];
}

function CardRotate({ children, onSendToBack, sensitivity, disableDrag = false }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_event, info) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  if (disableDrag) {
    return (
      <motion.div className="absolute inset-0 cursor-pointer" style={{ x: 0, y: 0 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cards = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  mobileClickOnly = false,
  mobileBreakpoint = 768,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [order, setOrder] = useState(() => cards.map((_, index) => index + 1));

  const cardEntries = useMemo(
    () =>
      cards.map((content, index) => ({
        id: index + 1,
        content,
        rotation: randomRotation ? getStableRotation(index) : 0,
      })),
    [cards, randomRotation]
  );
  const cardIds = useMemo(() => cardEntries.map((card) => card.id), [cardEntries]);
  const stack = useMemo(
    () => normalizeOrder(order, cardIds).map((id) => cardEntries[id - 1]).filter(Boolean),
    [cardEntries, cardIds, order]
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [mobileBreakpoint]);

  const sendToBack = useCallback((id) => {
    setOrder((prev) => {
      const newOrder = normalizeOrder(prev, cardIds);
      const index = newOrder.findIndex((cardId) => cardId === id);

      if (index === -1) return prev;

      const [cardId] = newOrder.splice(index, 1);
      newOrder.unshift(cardId);

      return newOrder;
    });
  }, [cardIds]);

  useEffect(() => {
    if (!autoplay || stack.length <= 1 || isPaused) {
      return undefined;
    }

    const interval = setInterval(() => {
      const topCardId = stack[stack.length - 1].id;
      sendToBack(topCardId);
    }, autoplayDelay);

    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isPaused, sendToBack, stack]);

  const shouldDisableDrag = mobileClickOnly && isMobile;
  const shouldEnableClick = sendToBackOnClick || shouldDisableDrag;

  return (
    <div
      className="relative h-full w-full"
      style={{ perspective: 600 }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => (
        <CardRotate
          key={card.id}
          onSendToBack={() => sendToBack(card.id)}
          sensitivity={sensitivity}
          disableDrag={shouldDisableDrag}
        >
          <motion.div
            className="h-full w-full overflow-hidden rounded-xl"
            onClick={() => shouldEnableClick && sendToBack(card.id)}
            animate={{
              rotateZ: (stack.length - index - 1) * 4 + card.rotation,
              scale: 1 + index * 0.06 - stack.length * 0.06,
              transformOrigin: "90% 90%",
            }}
            initial={false}
            transition={{
              type: "spring",
              stiffness: animationConfig.stiffness,
              damping: animationConfig.damping,
            }}
          >
            {card.content}
          </motion.div>
        </CardRotate>
      ))}
    </div>
  );
}
