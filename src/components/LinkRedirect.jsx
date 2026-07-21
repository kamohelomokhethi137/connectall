import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../lib/api";

export default function LinkRedirect() {
  const { shortCode } = useParams();
  const [statusText, setStatusText] = useState("Securing destination link...");
  const [isError, setIsError] = useState(false);
  const executionGuard = useRef(false);

  // YOUR LIVE MONETIZATION SMARTLINK
  const SMARTLINK_URL = "https://embargotechniquebattle.com";

  useEffect(() => {
    // Safety guard to prevent React Strict Mode from executing the link fetch/redirect twice
    if (executionGuard.current) return;
    executionGuard.current = true;

    async function handleRedirection() {
      try {
        // 1. Fetch the real long destination URL from your database API using the shortCode
        const response = await axios.get(`${API_BASE_URL}/links/resolve/${shortCode}`);
        const destinationUrl = response.data?.original_url || response.data?.link?.original_url;

        if (!destinationUrl) {
          throw new Error("Invalid destination payload configuration.");
        }

        setStatusText("Optimizing monetization matching parameters...");

        // 2. THE MONEY INJECTION STEP: Open the revenue-generating Smartlink in a new window/tab
        const adWindow = window.open(SMARTLINK_URL, "_blank");
        if (adWindow) {
          adWindow.blur(); // Blur the ad tab to try and push it to the background
          window.focus();  // Force focus back onto your website portal layout
        }

        // 3. Brief 2-second programmatic pause to guarantee the ad server tracks the impression revenue
        setTimeout(() => {
          window.location.href = destinationUrl; // Graceful hand-off to the target link
        }, 2200);

      } catch (err) {
        console.error("Redirection failure error:", err);
        setStatusText("This link has expired, been deleted, or is configured incorrectly.");
        setIsError(true);
      }
    }

    handleRedirection();
  }, [shortCode]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="text-center max-w-sm w-full space-y-5 bg-slate-800/50 p-8 rounded-2xl border border-slate-700/30 backdrop-blur-md">
        
        {/* Visual Feedback Loader Graphic Indicator */}
        {!isError ? (
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-4 border-teal-500/20 rounded-full absolute top-0 left-0" />
            <div className="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          </div>
        ) : (
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">
            {isError ? "Routing Blocked" : "Processing Safe Link Routing"}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed animate-pulse">
            {statusText}
          </p>
        </div>

        <div className="pt-2 text-[10px] text-slate-500 tracking-wider uppercase border-t border-slate-700/40">
          Monetized Link Gateway Engine
        </div>
      </div>
    </div>
  );
}
