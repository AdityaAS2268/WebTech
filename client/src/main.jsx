import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DeliveryAddressPage from "./components/DeliveryPage/DeliveryAddresspage.jsx";
import DeliveryOptionsPage from "./components/DeliveryOptionsPage/DeliverOptionsPage.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<App />*/}
    {/*  <DeliveryAddressPage />*/}
      <DeliveryOptionsPage />
  </StrictMode>,
)
