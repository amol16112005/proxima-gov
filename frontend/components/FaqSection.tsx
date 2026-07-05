"use client";

import { useState } from "react";
import type { FaqCategory } from "@/data/faqs";
import faq from "./faq.module.css";

interface FaqSectionProps {
  categories: FaqCategory[];
  defaultOpenId?: string;
}

export default function FaqSection({ categories, defaultOpenId }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className={faq.wrap}>
      {categories.map((category) => (
        <section
          key={category.id}
          id={`faq-${category.id}`}
          className={faq.category}
          aria-labelledby={`faq-heading-${category.id}`}
        >
          <h2 id={`faq-heading-${category.id}`} className={faq.categoryTitle}>
            <span aria-hidden="true">{category.icon}</span>
            {category.title}
          </h2>
          <div className={faq.list}>
            {category.items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <article key={item.id} className={faq.item} id={`faq-${item.id}`}>
                  <h3 className="sr-only">{item.question}</h3>
                  <button
                    type="button"
                    className={faq.trigger}
                    id={`faq-trigger-${item.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    onClick={() => toggle(item.id)}
                  >
                    <span>{item.question}</span>
                    <span className={`${faq.chevron} ${isOpen ? faq.chevronOpen : ""}`} aria-hidden="true">
                      ▾
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${item.id}`}
                    className={faq.answer}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    hidden={!isOpen}
                  >
                    <p>{item.answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}