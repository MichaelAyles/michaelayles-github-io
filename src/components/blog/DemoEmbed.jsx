export default function DemoEmbed({ src, height = 720 }) {
  return (
    <figure style={{ margin: "2rem 0" }}>
      <iframe
        src={src}
        width="100%"
        height={height}
        style={{
          border: "1px solid var(--border)",
          borderRadius: 6,
          background: "var(--surface)",
        }}
        loading="lazy"
        allow="autoplay"
        title="132 Parameters vs 200,000 Neurons — Interactive Demo"
      />
      <figcaption
        style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          marginTop: 8,
          textAlign: "center",
        }}
      >
        Interactive demo. Hit play if it hasn't started, or{" "}
        <a href={src} target="_blank" rel="noopener noreferrer">
          open full screen
        </a>
        .
      </figcaption>
    </figure>
  );
}
