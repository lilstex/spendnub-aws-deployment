"use client";
import api from "@/lib/api";
import { useState } from "react";

export const usePayment = () => {
  const [loading, setLoading] = useState(false);

  const startSubscription = async (
    gateway: "stripe" | "paystack",
    amount: number
  ) => {
    setLoading(true);
    try {
      // Calls your /subscription/initiate endpoint we built in the backend
      const { data } = await api.post("/subscription/initiate", {
        gateway,
        amount,
        priceId:
          gateway === "stripe"
            ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
            : undefined,
      });

      // Redirect user to the hosted payment page (Stripe Checkout or Paystack Popup/URL)
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Payment initiation failed", error);
      alert("Could not initialize payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { startSubscription, loading };
};
