import { useEffect } from "react";

export default function SocialBarAd() {
  useEffect(() => {
    const SCRIPT_SRC =
      "https://embargotechniquebattle.com/15/6a/2c/156a2c1aecae6204fb88686b5a36f9e3.js";

    // Prevent loading twice
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);

    return () => {
      script.remove();

      // Remove any overlay elements the script created (if necessary)
      // Uncomment and adjust if your ad network leaves DOM elements behind.
      // document.querySelectorAll('[id^="at-"]').forEach(el => el.remove());
    };
  }, []);

  return null;
}