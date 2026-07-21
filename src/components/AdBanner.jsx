import { useEffect, useRef } from "react";

export default function AdBanner() {
  const containerRef = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || loadedRef.current) return;

    loadedRef.current = true;

    // Clear old instance
    container.innerHTML = "";

    // Required by provider - changed to horizontal banner
    window.atOptions = {
      key: "8b9a2ca14fc3695a1ce9aeaa33e222a7",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const renderTimer = setTimeout(() => {
      const script = document.createElement("script");

      script.type = "text/javascript";
      script.src =
        "https://embargotechniquebattle.com/8b9a2ca14fc3695a1ce9aeaa33e222a7/invoke.js";

      script.async = true;
      script.setAttribute("data-cfasync", "false");

      container.appendChild(script);
    }, 100);

    return () => {
      clearTimeout(renderTimer);

      if (container) {
        container.innerHTML = "";
      }

      loadedRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "728px",
        height: "90px",
        maxWidth: "100%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      aria-label="Advertisement"
    />
  );
}