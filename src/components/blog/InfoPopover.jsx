import { useState, useRef, useEffect } from "react";

// Inline popover. Wrap a word or phrase and reveal a panel of detail on
// click (or hover on desktop). Theme-adaptive via CSS variables.
export default function InfoPopover({ label, title, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          font: "inherit",
          color: "#f97316",
          background: "none",
          border: "none",
          borderBottom: "1px dotted #f97316",
          padding: 0,
          cursor: "pointer",
          lineHeight: "inherit",
        }}
      >
        {label}
      </button>
      {open && (
        <span
          role="dialog"
          style={{
            position: "absolute",
            zIndex: 50,
            top: "calc(100% + 8px)",
            left: 0,
            width: "min(340px, 80vw)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            padding: "14px 16px",
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--text-secondary)",
            fontWeight: 400,
            textAlign: "left",
            whiteSpace: "normal",
          }}
        >
          {title && (
            <span
              style={{
                display: "block",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 11,
                letterSpacing: 0.3,
                textTransform: "uppercase",
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              {title}
            </span>
          )}
          {children}
        </span>
      )}
    </span>
  );
}
