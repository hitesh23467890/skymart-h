// frontend/src/pages/SplitPaymentPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RazorpayPayment } from "../components/RazorpayPayment";
import {
  Users,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  ArrowLeft,
  Lock,
  IndianRupee,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://skymart-h.onrender.com";

interface SplitPlanItem {
  userId: string;
  username: string;
  percent: number;
  amount: number;
}

export function SplitPaymentPage() {
  const [params] = useSearchParams();
  const roomId = params.get("room") || "";
  const navigate = useNavigate();

  const [plan, setPlan] = useState<SplitPlanItem[]>([]);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [activePay, setActivePay] = useState<SplitPlanItem | null>(null);

  const myUserId = String(localStorage.getItem("userId") || "");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("splitPlan");
      if (raw) setPlan(JSON.parse(raw));
      // Persist room ID as fallback
      if (roomId) localStorage.setItem("groupRoomId", roomId);
    } catch (e) {
      console.error(e);
    }
  }, [roomId]);
  const handleMemberSuccess = (item: SplitPlanItem, paymentId: string) => {
    setPaidIds((prev) => new Set(prev).add(item.userId));
    setActivePay(null);

    const updated = new Set(paidIds).add(item.userId);
    if (updated.size === plan.length) {
      localStorage.setItem("paymentMode", "split");

      // Fallback: room might be empty in URL — grab from localStorage
      const finalRoom = roomId || localStorage.getItem("groupRoomId") || "";
      if (!finalRoom) {
        alert("Room ID missing — cannot continue");
        return;
      }

      console.log(
        "🎉 All paid, navigating to delivery assignment for room:",
        finalRoom,
      );

      setTimeout(() => {
        // Bulletproof: works with HashRouter regardless of useNavigate context
        window.location.hash = `#/delivery-assignment?room=${finalRoom}`;
      }, 1000);
    }
  };
  const totalAmount = plan.reduce((s, p) => s + p.amount, 0);
  const paidAmount = plan
    .filter((p) => paidIds.has(p.userId))
    .reduce((s, p) => s + p.amount, 0);

  const progressPct = plan.length ? (paidIds.size / plan.length) * 100 : 0;

  if (plan.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white/60 mb-6">No split plan found.</p>
          <button
            onClick={() => navigate(`/split-config?room=${roomId}`)}
            className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl"
          >
            Configure Split
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[180px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[160px]" />

      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
            <Crown className="w-3 h-3" />
            Step 2 of 3 — Split Payment
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light">
            Pay Your{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Share
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-3">
            Room{" "}
            <span className="text-amber-300 font-mono font-semibold">
              {roomId}
            </span>{" "}
            • {plan.length} friends · Total ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border border-amber-400/15 bg-black/60 backdrop-blur-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
              Payment Progress
            </span>
            <span className="text-xs font-mono text-white/60">
              {paidIds.size} / {plan.length} paid
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-3 text-right font-mono">
            ₹{paidAmount.toFixed(2)} / ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        {/* Members list */}
        <div className="space-y-3 mb-6">
          {plan.map((item) => {
            const isMe = item.userId === myUserId;
            const paid = paidIds.has(item.userId);
            return (
              <div
                key={item.userId}
                className={`rounded-2xl border p-5 transition-all ${
                  paid
                    ? "border-emerald-400/40 bg-emerald-400/[0.04]"
                    : isMe
                      ? "border-amber-400/40 bg-amber-400/[0.04]"
                      : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      paid
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                        : isMe
                          ? "bg-gradient-to-br from-amber-300 to-amber-500 text-black"
                          : "bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10"
                    }`}
                  >
                    {item.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {item.username}
                      {isMe && (
                        <span className="text-[10px] text-amber-300 ml-2">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {item.percent}% of total
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-amber-300 flex items-center gap-1 justify-end">
                      <IndianRupee className="w-4 h-4" />
                      {item.amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] mt-1">
                      {paid ? (
                        <span className="text-emerald-400 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="text-white/40 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {!paid && isMe && activePay?.userId !== item.userId && (
                  <button
                    onClick={() => setActivePay(item)}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black font-bold uppercase text-xs tracking-[0.25em] hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.6)] transition-all"
                  >
                    Pay Now
                  </button>
                )}

                {!paid && !isMe && (
                  <p className="mt-3 text-[10px] text-white/40 uppercase tracking-[0.25em] text-center">
                    Waiting for {item.username} to pay
                  </p>
                )}

                {/* Inline Razorpay for this member */}
                {activePay?.userId === item.userId && (
                  <div className="mt-4">
                    <RazorpayPayment
                      amount={item.amount}
                      orderId={`SPLIT-${item.username}-${Date.now()}`}
                      onSuccess={(paymentId) =>
                        handleMemberSuccess(item, paymentId)
                      }
                      onFailure={(err) => {
                        alert(`Payment failed: ${err}`);
                        setActivePay(null);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* All paid banner */}
        {paidIds.size === plan.length && (
          <div className="rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-400/10 to-emerald-600/5 p-6 text-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-xl font-bold text-emerald-300">
              🎉 All Payments Complete
            </p>
            <p className="text-xs text-white/60 mt-2">
              Assigning nearest delivery partner…
            </p>
          </div>
        )}

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 rounded-xl border border-white/10 text-white/50 font-bold uppercase text-xs tracking-[0.25em] hover:border-amber-400/40 hover:text-amber-300 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.2em]">
          <Lock className="w-3 h-3 text-amber-400/50" />
          Secured by Razorpay
        </div>
      </div>
    </div>
  );
}

export default SplitPaymentPage;
