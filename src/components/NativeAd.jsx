import { useEffect, useRef } from "react";

export default function NativeAd() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent duplicate ads
    container.innerHTML = "";

    // Create the ad container
    const adContainer = document.createElement("div");
    adContainer.id = "container-78572b5f5e90e5842d0dc6cbd5291b0c";

    // Create the ad script
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://embargotechniquebattle.com/78572b5f5e90e5842d0dc6cbd5291b0c/invoke.js";

    // Append in the same order as the provider's code
    container.appendChild(script);
    container.appendChild(adContainer);

    return () => {
      container.innerHTML = "";
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