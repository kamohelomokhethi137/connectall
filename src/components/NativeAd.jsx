import { useEffect, useRef } from "react";

export default function NativeAd() {
  const containerRef = useRef(null);
  const scriptsLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptsLoaded.current) return;
    scriptsLoaded.current = true;

    const container = containerRef.current;

    // 1. Create a sandboxed iframe to isolate the ad network's crashy script
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.setAttribute("scrolling", "no");
    
    container.appendChild(iframe);

    // 2. Inject the ad HTML and script directly into the isolated iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; }
          </style>
        </head>
        <body>
          <div id="container-78572b5f5e90e5842d0dc6cbd5291b0c"></div>
          <script type="text/javascript" data-cfasync="false" src="https://embargotechniquebattle.com" async></script>
        </body>
        </html>
      `);
      iframeDoc.close();
    }

    // 3. Clear container element context on component destruction
    return () => {
      if (container) {
        container.innerHTML = "";
      }
      scriptsLoaded.current = false;
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full min-h-[100px] my-4 flex items-center justify-center mx-auto" 
      aria-label="Native Advertisement" 
    />
  );
}
