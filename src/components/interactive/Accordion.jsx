"use client";

import { useState } from "react";

export function AccordionItem({ question, answer, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`faq-tab-link w-inline-block w-tab-link ${
        isOpen ? "w--current" : ""
      }`}
      onClick={() => setIsOpen(!isOpen)}
      style={{ cursor: "pointer" }}
    >
      <div className="faq-question">
        <div>{question}</div>
        <div className="faq-icon-wrap">
          <div
            className="faq-vertical"
            style={{
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 300ms ease",
            }}
          ></div>
          <div className="faq-horizontal-line"></div>
        </div>
      </div>
      <div
        className="faq-answer"
        style={{
          display: isOpen ? "block" : "none",
          transition: "all 300ms ease",
        }}
      >
        <div className="faq-answer-wrap">
          <p className="faq-answer-text">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function AccordionGroup({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="faq-tab w-tabs">
      <div className="faq-tab-menu w-tab-menu">
        {items.map((item, index) => (
          <div
            key={index}
            className={`faq-tab-link w-inline-block w-tab-link ${
              activeIndex === index ? "w--current" : ""
            }`}
            onClick={() => setActiveIndex(index)}
            style={{ cursor: "pointer" }}
          >
            <div className="faq-question">
              <div>{item.question}</div>
              <div className="faq-icon-wrap">
                <div
                  className="faq-vertical"
                  style={{
                    transform: activeIndex === index ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 300ms ease",
                  }}
                ></div>
                <div className="faq-horizontal-line"></div>
              </div>
            </div>
            {activeIndex === index && (
              <div className="faq-answer" style={{ display: "block" }}>
                <div className="faq-answer-wrap">
                  <p className="faq-answer-text">{item.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
