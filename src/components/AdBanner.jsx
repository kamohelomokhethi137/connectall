import { useEffect, useRef } from "react";

export default function AdBanner() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove previous contents
    container.innerHTML = "";

    // Set options immediately before loading script
    window.atOptions = {
      key: "8b9a2ca14fc3695a1ce9aeaa33e222a7",
      format: "iframe",
      height: 300,
      width: 160,
      params: {},
    };

    // Create a fresh script every mount
    const script = document.createElement("script");
    script.src =
      "https://embargotechniquebattle.com/8b9a2ca14fc3695a1ce9aeaa33e222a7/invoke.js";

    script.async = true;
    script.setAttribute("data-cfasync", "false");

    container.appendChild(script);

    return () => {
      // Remove injected iframe/script
      container.innerHTML = "";

      // Remove global config
      delete window.atOptions;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "160px",
        height: "300px",
        overflow: "hidden",
      }}
      aria-label="Advertisement"
    />
  );
}