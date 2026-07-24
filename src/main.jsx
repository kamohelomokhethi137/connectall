import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { ThemeProvider, useTheme } from './lib/ThemeContext.jsx'

function ThemedToaster() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#1E293B' : '#0B1D3A',
          color: '#fff',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          borderRadius: '10px',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.08)',
        },
        success: { iconTheme: { primary: '#17A398', secondary: isDark ? '#1E293B' : '#0B1D3A' } },
        error: { iconTheme: { primary: '#E8A33D', secondary: isDark ? '#1E293B' : '#0B1D3A' } },
      }}
    />
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedToaster />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
