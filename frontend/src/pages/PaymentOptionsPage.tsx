// frontend/src/pages/PaymentOptionsPage.tsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Wallet, Users, ArrowRight } from "lucide-react";

export function PaymentOptionsPage() {
  const [params] = useSearchParams();
  const roomId = params.get("room") || "";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-2">
          How would you like to pay?
        </h1>
        <p className="text-white/60 text-center mb-10">
          Room {roomId} • Choose the option that works best for your group
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pay fully myself */}
          <button
            onClick={() => navigate(`/split-payment?room=${roomId}&mode=full`)}
            className="group bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-amber-400/50 rounded-2xl p-8 text-left transition-all hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wallet className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-2">Pay Fully Myself</h3>
            <p className="text-white/60 text-sm mb-4">
              I'll cover the entire bill. My friends will owe me later.
            </p>
            <span className="inline-flex items-center gap-2 text-amber-400 text-sm font-semibold">
              Continue <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          {/* Split the bill */}
          <button
            onClick={() => navigate(`/split-payment?room=${roomId}&mode=split`)}
            className="group bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-purple-400/50 rounded-2xl p-8 text-left transition-all hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-2">Split the Bill</h3>
            <p className="text-white/60 text-sm mb-4">
              Each friend pays their own share via Razorpay.
            </p>
            <span className="inline-flex items-center gap-2 text-purple-400 text-sm font-semibold">
              Continue <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-8 mx-auto block text-white/40 hover:text-white/80 text-sm transition-colors"
        >
          ← Back to location page
        </button>
      </div>
    </div>
  );
}
