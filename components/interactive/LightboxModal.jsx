"use client";

import { useState } from "react";

export function LightboxModal({ trigger, videoUrl, imageUrl }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} style={{ cursor: "pointer" }}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className="w-lightbox-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-lightbox-container"
            style={{ position: "relative", maxWidth: "900px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: "-40px",
                right: 0,
                color: "#fff",
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            {videoUrl ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={videoUrl}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="Lightbox View"
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
