'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHER_KEY
  );

  const initialPaypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_PUBLISHER_KEY,
    currency: "USD",
    intent: "capture",
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer />
        <PayPalScriptProvider options={initialPaypalOptions}>
          <Elements stripe={stripePromise}>
            {children}
          </Elements>
        </PayPalScriptProvider>
      </body>
    </html>
  );
}
