"use client";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { fetchApi } from "@/lib/api-client";
import { useApp } from "@/components/providers";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const { getToken } = useAuth();
  const { user, authReady } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!authReady || !user) {
      router.push("/login?redirect_url=/pricing");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken({ template: "supabase" });
      const orderData = await fetchApi("/razorpay/create-order", { method: "POST" }, token);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "GS Hub BPSC Portal",
        description: "Premium Subscription",
        order_id: orderData.orderId,
        handler: function (response: any) {
          alert("Payment successful! Your account will be upgraded to Premium shortly.");
          router.push("/dashboard");
        },
        prefill: {
          name: user?.name || "Student",
          email: user?.email || "",
        },
        theme: {
          color: "#722F37", // Maroon branding
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error: any) {
      alert("Error initializing payment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-4xl text-center">
        <h1 className="h-display text-4xl text-maroon sm:text-5xl">Unlock Premium BPSC Prep</h1>
        <p className="mt-4 text-lg text-stone-600">
          Get access to high-yield current affairs, exclusive test series, and advanced analytics.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2 md:items-center">
          {/* Free Tier */}
          <div className="card flex flex-col items-center p-8 border-2 border-transparent hover:border-maroon/10 transition-colors">
            <h2 className="text-2xl font-bold text-stone-800">Free Tier</h2>
            <div className="mt-4 text-4xl font-extrabold text-stone-900">₹0</div>
            <p className="mt-2 text-sm text-stone-500">Forever Free</p>
            
            <ul className="mt-8 space-y-4 text-left w-full text-stone-600">
              <li className="flex items-center gap-3"><span className="text-green-600">✓</span> Access to all BPSC PYQs</li>
              <li className="flex items-center gap-3"><span className="text-green-600">✓</span> Basic Subject/Topic filtering</li>
              <li className="flex items-center gap-3"><span className="text-green-600">✓</span> Mistake Notebook (Basic)</li>
            </ul>

            <button className="btn-outline mt-8 w-full cursor-default opacity-50" disabled>
              {user ? "Current Plan" : "Included"}
            </button>
          </div>

          {/* Premium Tier */}
          <div className="card flex flex-col items-center p-8 border-2 border-gold bg-gold-50/30 relative shadow-xl transform md:scale-105">
            <div className="absolute top-0 right-0 bg-gold text-maroon-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
              Recommended
            </div>
            <h2 className="text-2xl font-bold text-maroon">Pro Plan</h2>
            <div className="mt-4 text-4xl font-extrabold text-maroon-900">₹499</div>
            <p className="mt-2 text-sm text-maroon-700">One-time payment</p>
            
            <ul className="mt-8 space-y-4 text-left w-full text-maroon-900">
              <li className="flex items-center gap-3"><span className="text-gold">★</span> <b>All Free features included</b></li>
              <li className="flex items-center gap-3"><span className="text-gold">★</span> <b>Exclusive Test Series</b> access</li>
              <li className="flex items-center gap-3"><span className="text-gold">★</span> <b>Current Affairs</b> quizzes</li>
              <li className="flex items-center gap-3"><span className="text-gold">★</span> <b>Advanced Analytics</b> & Heatmaps</li>
              <li className="flex items-center gap-3"><span className="text-gold">★</span> Premium Priority Support</li>
            </ul>

            <button 
              className="btn-primary mt-8 w-full shadow-lg hover:shadow-xl transition-all"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? "Initializing..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
