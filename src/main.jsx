import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0B1D3A',
          color: '#fff',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
        },
        success: { iconTheme: { primary: '#17A398', secondary: '#0B1D3A' } },
        error: { iconTheme: { primary: '#E8A33D', secondary: '#0B1D3A' } },
      }}
    />
    <App />
  </StrictMode>,
)
