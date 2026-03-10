export default function DemoEmbed({ src, height = 1100 }) {
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
        Let it run at full speed for a few thousand episodes, then compare trained behaviour
        to an untrained model using the snapshot controls. Toggle ablation to evaluate the
        model with random outputs, approximating the network's influence.{" "}
        <a href={src} target="_blank" rel="noopener noreferrer">
          Open full screen
        </a>
        .
      </figcaption>
    </figure>
  );
}
