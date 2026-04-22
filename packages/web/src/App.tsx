import { CircuitBackground } from "@portfolio/circuit-bg";

export function App() {
  return (
    <>
      <CircuitBackground />
      <main
        style={{
          minHeight: "200vh",
          display: "grid",
          placeItems: "center",
          color: "#e2f4f7",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "3rem", margin: 0 }}>Hello, world!</h1>
      </main>
    </>
  );
}
