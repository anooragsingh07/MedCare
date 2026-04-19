import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: 'text-sm shadow-lg',
        style: {
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px 14px',
        },
        success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
      }}
    />
  </StrictMode>,
)
