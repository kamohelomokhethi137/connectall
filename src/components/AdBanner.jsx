import { useEffect, useRef } from "react";

export default function AdBanner() {
  const containerRef = useRef(null);
  const scriptsLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptsLoaded.current) return;
    scriptsLoaded.current = true;

    const container = containerRef.current;

    // 1. Create the iframe element container
    const iframe = document.createElement("iframe");
    iframe.style.width = "160px";
    iframe.style.height = "300px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.setAttribute("scrolling", "no");
    
    container.appendChild(iframe);

    // 🚀 2. Delay the write slightly to force complete context separation from React
    const renderTimeout = setTimeout(() => {
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
            <div id="8b9a2ca14fc3695a1ce9aeaa33e222a7"></div>
            <script type="text/javascript">
              window.atOptions = {
                'key' : '8b9a2ca14fc3695a1ce9aeaa33e222a7',
                'format' : 'iframe',
                'height' : 300,
                'width' : 160,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://embargotechniquebattle.com" async></script>
          </body>
          </html>
        `);
        iframeDoc.close();
      }
    }, 50);

    // 3. Clear resources on unmount
    return () => {
      clearTimeout(renderTimeout);
      if (container) {
        container.innerHTML = "";
      }
      scriptsLoaded.current = false;
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-[160px] min-h-[300px] flex items-center justify-center mx-auto" 
      aria-label="Advertisement" 
    />
  );
}
