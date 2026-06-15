import { useEffect, useRef, useState } from "react";

export function TextType({
  texts = ["Hello"],
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "|",
  cursorBlinkDuration = 0.8,
  className = "",
  textClassName = "",
  cursorClassName = "",
  loop = true,
}) {
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const currentText = texts[textIndex % texts.length];
    const speed = isDeleting ? deletingSpeed : typingSpeed;

    const tick = () => {
      setDisplayed((prev) => {
        if (!isDeleting) {
          if (prev === currentText) {
            timerRef.current = setTimeout(() => {
              setIsDeleting(true);
            }, pauseDuration);
            return prev;
          }
          return currentText.slice(0, prev.length + 1);
        } else {
          if (prev === "") {
            setIsDeleting(false);
            setTextIndex((i) => (loop ? (i + 1) % texts.length : i + 1));
            return prev;
          }
          return currentText.slice(0, prev.length - 1);
        }
      });
    };

    timerRef.current = setTimeout(tick, speed);

    return () => clearTimeout(timerRef.current);
  }, [displayed, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span className={textClassName}>{displayed}</span>
      {showCursor && (
        <span
          className={`inline-block ml-0.5 ${cursorClassName}`}
          style={{
            animation: `textTypeBlink ${cursorBlinkDuration}s step-end infinite`,
            color: "inherit",
          }}
        >
          {cursorCharacter}
        </span>
      )}
      <style>{`
        @keyframes textTypeBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
