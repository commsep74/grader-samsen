import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { jetbrainsMono } from '@/lib/utils'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{ style: { fontFamily: jetbrainsMono } }}
    />
  </StrictMode>,
)
