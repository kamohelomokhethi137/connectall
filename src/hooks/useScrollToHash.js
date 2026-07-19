import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small delay lets the target page render first if we just navigated here
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [hash, pathname]);
}
