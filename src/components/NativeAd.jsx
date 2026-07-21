import { useEffect, useRef } from "react";

export default function NativeAd() {
  const containerRef = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || loadedRef.current) return;

    loadedRef.current = true;

    container.innerHTML = "";

    const renderTimer = setTimeout(() => {
      // Remove previous provider scripts if React remounted
      const oldScript = document.querySelector(
        'script[src="https://embargotechniquebattle.com/78572b5f5e90e5842d0dc6cbd5291b0c/invoke.js"]'
      );

      if (oldScript) {
        oldScript.remove();
      }

      // Create script exactly like provider code
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src =
        "https://embargotechniquebattle.com/78572b5f5e90e5842d0dc6cbd5291b0c/invoke.js";

      // Create provider container
      const adContainer = document.createElement("div");
      adContainer.id =
        "container-78572b5f5e90e5842d0dc6cbd5291b0c";

      // Provider embed order
      container.appendChild(script);
      container.appendChild(adContainer);

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
      className="w-full min-h-[100px] flex justify-center items-center my-4"
      aria-label="Native Advertisement"
    />
  );
}