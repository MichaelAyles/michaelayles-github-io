import G from "./glossary.js";

// Inline glossary term with a CSS-only hover/focus/tap tooltip.
// Presentational: no hooks, no client directive needed (renders to static HTML;
// the popover is driven entirely by the CSS in <GlossaryStyles/>, included once).
//
// Usage in MDX:  <T id="uram">URAM</T>   (children = what shows in the text)
// Each instance gets a unique CSS anchor-name (stamped at build time, this is
// static HTML): a shared name resolves to the wrong element when a term
// appears more than once, which flings the tip off-screen.
let seq = 0;
export default function T({ id, children }) {
  const def = G[id];
  const label = children ?? (id ? id.toUpperCase() : "");

  // Unknown id: render plain text so a typo never breaks the prose.
  if (!def) return <span>{label}</span>;

  const anchor = `--kg${++seq}`;
  return (
    <span className="kg-term">
      <button
        type="button"
        className="kg-anchor"
        aria-label={`Definition: ${label}`}
        style={{ anchorName: anchor }}
      >
        {label}
      </button>
      <span role="tooltip" className="kg-tip" style={{ positionAnchor: anchor }}>
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
      /* Where CSS anchor positioning exists (all evergreen browsers), pin the
         tip to its own term via its unique inline anchor-name.
         anchor-center alignment auto-shifts to keep the tip inside the
         viewport, which is exactly the left/right clamp a centered popover
         can't do by itself; flip-block drops it below the word when there is
         no room above. Older browsers keep the plain centered popover. */
      @supports (position-area: top) {
        .kg-tip {
          position: fixed;
          position-area: top;
          position-try-fallbacks: flip-block;
          justify-self: anchor-center;
          left: auto; bottom: auto; transform: none;
          margin: 0 8px 6px;
          width: max-content;
          max-width: min(280px, calc(100vw - 32px));
        }
      }
    `}</style>
  );
}
