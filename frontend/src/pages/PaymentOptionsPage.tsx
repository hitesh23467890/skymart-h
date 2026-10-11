// frontend/src/pages/PaymentOptionsPage.tsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Wallet,
  Users,
  ArrowRight,
  Crown,
  Lock,
  ArrowLeft,
} from "lucide-react";

export function PaymentOptionsPage() {
  const [params] = useSearchParams();
  const roomId = params.get("room") || "";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[180px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[160px]" />

      {/* Gold hairline top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
            <Crown className="w-3 h-3" />
            Step 2 of 3 — Payment
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide">
            How Would You Like{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              to Pay?
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-3">
            Room{" "}
            <span className="text-amber-300 font-mono font-semibold">
              {roomId}
            </span>{" "}
            • Choose the option that fits your group
          </p>
        </div>

        {/* Two option cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Option 1: Pay fully */}
          <button
            onClick={() => navigate(`/pay-full?room=${roomId}`)}
            className="group relative text-left rounded-2xl border border-amber-400/20 bg-gradient-to-br from-black via-zinc-950 to-black p-8 hover:border-amber-400/60 transition-all hover:-translate-y-1 hover:shadow-[0_0_50px_-15px_rgba(245,158,11,0.5)]"
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
              <Wallet className="w-7 h-7 text-black" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
              Full Payment
            </span>
            <h3 className="text-2xl font-serif font-light text-white mt-2 mb-3">
              Pay Fully Myself
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              I'll cover the entire bill. My friends can settle up with me later
              — offline, no hassle.
            </p>

            <span className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
              Continue
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Option 2: Split the bill */}
          <button
            onClick={() => navigate(`/split-config?room=${roomId}`)}
            className="group relative text-left rounded-2xl border border-amber-400/20 bg-gradient-to-br from-black via-zinc-950 to-black p-8 hover:border-amber-400/60 transition-all hover:-translate-y-1 hover:shadow-[0_0_50px_-15px_rgba(245,158,11,0.5)]"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-black" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
              Custom Split
            </span>
            <h3 className="text-2xl font-serif font-light text-white mt-2 mb-3">
              Split the Bill
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Choose how to divide the amount — equal, or custom percentages
              like 80/20. Each friend pays their own share.
            </p>

            <span className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
              Continue
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="mt-10 mx-auto flex items-center gap-2 text-white/40 hover:text-amber-300 text-xs uppercase tracking-[0.25em] transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Location
        </button>

        {/* Trust footer */}
        <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.2em]">
          <Lock className="w-3 h-3 text-amber-400/50" />
          Secured by Razorpay · 256-bit encryption
        </div>
      </div>
    </div>
  );
}

export default PaymentOptionsPage;
