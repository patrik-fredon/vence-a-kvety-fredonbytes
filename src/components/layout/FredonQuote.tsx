// components/FredonQuote.tsx
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const FredonQuote = () => {
  const t = useTranslations("footer");
  const quotes = [t("quote1"), t("quote2"), t("quote3")].filter(Boolean);

  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (quotes.length === 0) return;

    const currentQuote = quotes[currentIndex % quotes.length];
    const timeout = isDeleting ? 30 : 50;

    const timer = setTimeout(() => {
      if (!isDeleting && displayedText === currentQuote) {
        // Pause before deleting
        setTimeout(() => setIsDeleting(true), 3000);
      } else if (isDeleting && displayedText === "") {
        // Move to next quote
        setIsDeleting(false);
        setCurrentIndex((prev) => prev + 1);
      } else if (isDeleting) {
        // Delete character
        setDisplayedText(currentQuote.substring(0, displayedText.length - 1));
      } else {
        // Type character
        setDisplayedText(currentQuote.substring(0, displayedText.length + 1));
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentIndex, quotes]);

  return (
    <p className="text-amber-300/40 italic text-sm break-words max-w-full">
      &quot;{displayedText}&quot;
      <span className="ml-1 animate-pulse">|</span>
    </p>
  );
}


export default FredonQuote;
