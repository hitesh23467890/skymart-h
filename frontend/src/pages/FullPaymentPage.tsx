// frontend/src/pages/FullPaymentPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RazorpayPayment } from "../components/RazorpayPayment";
import { Crown, ArrowLeft, IndianRupee, Lock, Check } from "lucide-react";

export function FullPaymentPage() {
  const [params] = useSearchParams();
  const roomId = params.get("room") || "";
  const navigate = useNavigate();

  const [cartTotal, setCartTotal] = useState(0);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("groupCartItems");
      const cart = raw ? JSON.parse(raw) : [];
      setItems(cart);
      const total = cart.reduce(
        (s: number, i: any) => s + Number(i.price) * (i.quantity || 1),
        0,
      );
      setCartTotal(total);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSuccess = (paymentId: string) => {
    // Save payment info and navigate to delivery assignment
    localStorage.setItem("paymentId", paymentId);
    localStorage.setItem("paymentMode", "full");
    navigate(`/delivery-assignment?room=${roomId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[180px]" />
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
            <Crown className="w-3 h-3" />
            Step 2 of 3 — Full Payment
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light">
            Pay the{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Full Bill
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-3">
            Room{" "}
            <span className="text-amber-300 font-mono font-semibold">
              {roomId}
            </span>
          </p>
        </div>

        {/* Order summary */}
        <div className="rounded-2xl border border-amber-400/15 bg-black/60 backdrop-blur-xl p-6 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-4">
            Order Summary
          </p>

          <div className="space-y-3 mb-6">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-white/70 truncate pr-4">
                  {item.name}{" "}
                  <span className="text-white/40">× {item.quantity || 1}</span>
                </span>
                <span className="font-mono text-white/80">
                  ₹{(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
              Total
            </span>
            <span className="text-3xl font-bold text-amber-300 flex items-center gap-1">
              <IndianRupee className="w-6 h-6" />
              {cartTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pay button (uses Razorpay component) */}
        <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-transparent p-6 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-4 flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Secure Checkout
          </p>
          <RazorpayPayment
            amount={cartTotal}
            orderId={`FULL-${roomId}-${Date.now()}`}
            onSuccess={handleSuccess}
            onFailure={(err) => alert(`Payment failed: ${err}`)}
          />
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 rounded-xl border border-white/10 text-white/50 font-bold uppercase text-xs tracking-[0.25em] hover:border-amber-400/40 hover:text-amber-300 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payment Options
        </button>
      </div>
    </div>
  );
}

export default FullPaymentPage;
