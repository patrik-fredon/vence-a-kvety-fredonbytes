// components/FredonQuote.tsx
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const FredonQuote = () => {
  const t = useTranslations("footer");

  // Get the raw quote texts from translations
  const rawQuotes = [t("quote1"), t("quote2"), t("quote3")];

  // Ensure rawQuotes always has at least one item to prevent fullText being undefined
  const safeQuotes = rawQuotes.length > 0 ? rawQuotes : [t("fallbackQuote") || ""]; // Fallback if all quotes are missing

  // Refs to hold the latest state values
  const displayedTextRef = useRef("");
  const isDeletingRef = useRef(false);
  const loopNumRef = useRef(0);
  const typingSpeedRef = useRef(50); // Initial typing speed
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deletingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State just for triggering re-renders
  const [, setRender] = useState({});

  // Function to update state and trigger re-render
  const updateState = (
    newDisplayedText: string,
    newIsDeleting: boolean,
    newLoopNum: number,
    newTypingSpeed: number
  ) => {
    let shouldUpdate = false;

    if (displayedTextRef.current !== newDisplayedText) {
      displayedTextRef.current = newDisplayedText;
      shouldUpdate = true;
    }
    if (isDeletingRef.current !== newIsDeleting) {
      isDeletingRef.current = newIsDeleting;
      shouldUpdate = true;
    }
    if (loopNumRef.current !== newLoopNum) {
      loopNumRef.current = newLoopNum;
      shouldUpdate = true;
    }
    if (typingSpeedRef.current !== newTypingSpeed) {
      typingSpeedRef.current = newTypingSpeed;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      setRender({}); // Trigger re-render
    }
  };

  // Define the typing logic function
  const handleTyping = () => {
    // Ensure currentQuoteIndex is valid before accessing the array
    const currentQuoteIndex = loopNumRef.current % safeQuotes.length;
    const fullText = safeQuotes[currentQuoteIndex] || ""; // Fallback to empty string if somehow undefined

    if (isDeletingRef.current) {
      // Deleting phase
      const newText = fullText.substring(0, displayedTextRef.current.length - 1);
      updateState(newText, isDeletingRef.current, loopNumRef.current, 30); // Faster delete speed
    } else {
      // Typing phase
      const newText = fullText.substring(0, displayedTextRef.current.length + 1);
      updateState(newText, isDeletingRef.current, loopNumRef.current, 50); // Faster type speed
    }

    // Check if typing is complete
    if (!isDeletingRef.current && displayedTextRef.current === fullText) {
      // Clear any existing timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      // Pause for 3 seconds before deleting
      typingTimeoutRef.current = setTimeout(() => {
        updateState(displayedTextRef.current, true, loopNumRef.current, 30); // Set isDeletingRef.current = true, set delete speed
        handleTyping(); // Immediately call handleTyping again to start deleting
      }, 3000);
      return; // Exit this call, the timeout will handle the next call
    }

    // Check if deleting is complete
    if (isDeletingRef.current && displayedTextRef.current === "") {
      // Clear any existing timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      // Update loop number and reset for next quote
      const nextLoopNum = loopNumRef.current + 1;
      updateState("", false, nextLoopNum, 50); // Reset text, set isDeletingRef.current = false, update loop, set type speed
      // Start the next typing cycle immediately after updating state
      handleTyping(); // Call handleTyping again to start typing the next quote
      return; // Exit this call, the function call above handles the next step
    }

    // Set timeout for the next character (only if still typing or deleting)
    // This should only happen if we are not at the end of typing or deleting
    if (
      !(!isDeletingRef.current && displayedTextRef.current === fullText) &&
      !(isDeletingRef.current && displayedTextRef.current === "")
    ) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(handleTyping, typingSpeedRef.current);
    }
    // Otherwise, the timeout for pause or the direct call after deleting handles the next step.
  };

  useEffect(() => {
    // Start the typing effect when component mounts
    handleTyping();

    // Cleanup timeouts on component unmount
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (deletingTimeoutRef.current) clearTimeout(deletingTimeoutRef.current);
    };
  }, []); // Empty dependency array

  // Return the JSX using the values from refs
  return (
    <p className="text-amber-300/40 italic text-sm">
      &quot;{displayedTextRef.current}&quot;
      <span className="ml-1 animate-pulse">|</span> {/* Blinking cursor effect */}
    </p>
  );
};

export default FredonQuote;
