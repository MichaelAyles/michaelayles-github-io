import G from "./glossary.js";

// Inline glossary term with a CSS-only hover/focus/tap tooltip.
// Presentational: no hooks, no client directive needed (renders to static HTML;
// the popover is driven entirely by the CSS in <GlossaryStyles/>, included once).
//
// Usage in MDX:  <T id="uram">URAM</T>   (children = what shows in the text)
export default function T({ id, children }) {
  const def = G[id];
  const label = children ?? (id ? id.toUpperCase() : "");

  // Unknown id: render plain text so a typo never breaks the prose.
  if (!def) return <span>{label}</span>;

  return (
    <span className="kg-term">
      <button type="button" className="kg-anchor" aria-label={`Definition: ${label}`}>
        {label}
      </button>
      <span role="tooltip" className="kg-tip">
        <b className="kg-tip-label">{label}: </b>
        {def}
      </span>
    </span>
  );
}

// Drop this once near the top of the post. Pure CSS, no JS shipped.
export function GlossaryStyles() {
  return (
    <style>{`
      .kg-term { position: relative; display: inline-block; }
      .kg-anchor {
        font: inherit; color: inherit; background: none; border: none;
        padding: 0; cursor: help; line-height: inherit;
        border-bottom: 1px dotted var(--text-secondary, #888);
      }
      .kg-tip {
        position: absolute; bottom: calc(100% + 8px); left: 50%;
        transform: translateX(-50%); width: min(280px, calc(100vw - 24px));
        z-index: 60;
        background: var(--surface, #1a1a1a); color: var(--text-primary, #eee);
        border: 1px solid var(--border, #444); border-radius: 8px;
        padding: 8px 10px; font-size: 0.78rem; font-weight: 400;
        line-height: 1.45; text-align: left;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        opacity: 0; visibility: hidden; transition: opacity 0.12s ease;
        pointer-events: none; white-space: normal;
      }
      .kg-tip-label { display: none; }
      .kg-term:hover .kg-tip,
      .kg-term:focus-within .kg-tip { opacity: 1; visibility: visible; }
      /* Small screens: a centered popover on the anchor can hang off the
         viewport edge, so pin the definition to the bottom of the screen as a
         sheet instead, and name the term since it's no longer attached to it. */
      @media (max-width: 640px) {
        .kg-tip {
          position: fixed; left: 12px; right: 12px; top: auto;
          bottom: calc(12px + env(safe-area-inset-bottom));
          width: auto; transform: none;
          font-size: 0.85rem; padding: 10px 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.35);
        }
        .kg-tip-label { display: inline; }
      }
    `}</style>
  );
}
