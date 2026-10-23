import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import App from './App.jsx'

const DeliveryAddressPage = lazy(() => import('./components/DeliveryAddressPage/DeliveryAddresspage.jsx'));
const DeliveryOptionsPage = lazy(() => import('./components/DeliveryOptionsPage/DeliveryOptionsPage.jsx'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <Suspense fallback={
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                  Loading...
              </div>
          }>

              <Routes>
                  <Route path="/" element={<App />} />

                  <Route path="/checkout/address" element={<DeliveryAddressPage />} />

                  <Route path="/checkout/options" element={<DeliveryOptionsPage />} />
              </Routes>

          </Suspense>
      </BrowserRouter>
    {/*<App />*/}
    {/*  <DeliveryAddressPage />*/}
    {/*  <DeliveryOptionsPage />*/}
  </StrictMode>,
)
