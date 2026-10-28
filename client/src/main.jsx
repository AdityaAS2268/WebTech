import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import DeliveryPage from './pages/DeliveryPage/DeliveryPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/checkout/delivery" element={<DeliveryPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
