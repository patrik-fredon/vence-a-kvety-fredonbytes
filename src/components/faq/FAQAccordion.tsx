"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@/lib/icons";
import Image from "next/image";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  image?: {
    src: string;
    alt: string;
    description?: string;
  };
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleItem(index);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openItems.has(index);

        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-soft border border-neutral-200 overflow-hidden"
          >
            <button
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-inset transition-colors"
              onClick={() => toggleItem(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
              id={`faq-question-${index}`}
            >
              <h3 className="text-lg font-semibold text-stone-800 pr-4">{item.question}</h3>
              <div className="flex-shrink-0">
                {isOpen ? (
                  <ChevronUpIcon className="w-5 h-5 text-stone-600" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-stone-600" />
                )}
              </div>
            </button>

            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                }`}
            >
              <div className="px-6 pb-4">
                <p className="text-neutral-700 leading-relaxed mb-4">{item.answer}</p>

                {item.image && (
                  <div className="mt-6">
                    <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain"
                        priority={false}
                      />
                    </div>
                    {item.image.description && (
                      <p className="text-sm text-neutral-600 text-center mt-3 italic">
                        {item.image.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
