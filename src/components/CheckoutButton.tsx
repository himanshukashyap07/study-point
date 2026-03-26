"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface CheckoutButtonProps {
  courseId: string;
  userId: string;
  amount: number;
}

export default function CheckoutButton({ courseId, userId, amount }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/payment/paytm", { userId, courseId, amount });
      const data = res.data;

      if (data.success && data.paytmParams) {
        // Create a hidden form and submit it to Paytm
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://securegw-stage.paytm.in/order/process"; // Staging URL

        for (const key in data.paytmParams) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.paytmParams[key];
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        alert(data.message || "Checkout failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout Request Error:", error);
      alert("Something went wrong with the payment request.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
        loading 
          ? "bg-gray-400 cursor-not-allowed text-gray-200" 
          : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/30 transform hover:-translate-y-1"
      }`}
    >
      {loading ? "Processing..." : `Buy Now for ₹${amount}`}
    </button>
  );
}
