// frontend/src/pages/SplitPaymentPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RazorpayPayment } from "../components/RazorpayPayment";
import {
  Users,
  CheckCircle2,
  Clock,
  Crown,
  ArrowLeft,
  Lock,
  IndianRupee,
  CreditCard,
  ShieldCheck,
  Sparkles,
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
  const [showPayWidget, setShowPayWidget] = useState(false);

  // Normalize userId — always compare as strings
  const rawMyId = localStorage.getItem("userId") || "";
  const myUserId = String(rawMyId).trim();
  const myUsername = localStorage.getItem("username") || "";

  // ---- Load split plan ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem("splitPlan");
      if (raw) setPlan(JSON.parse(raw));
      if (roomId) localStorage.setItem("groupRoomId", roomId);
    } catch (e) {
      console.error(e);
    }
  }, [roomId]);

  // ---- Identify my plan item ----
  const myPlanItem = useMemo(() => {
    if (!myUserId) return null;
    return (
      plan.find((p) => String(p.userId).trim() === myUserId) ||
      plan.find((p) => p.username === myUsername) ||
      null
    );
  }, [plan, myUserId, myUsername]);

  const myAlreadyPaid = myPlanItem
    ? paidIds.has(String(myPlanItem.userId))
    : false;

  // ---- When all paid, redirect ----
  useEffect(() => {
    if (plan.length > 0 && paidIds.size === plan.length) {
      localStorage.setItem("paymentMode", "split");
      const finalRoom = roomId || localStorage.getItem("groupRoomId") || "";
      const t = setTimeout(() => {
        window.location.hash = `#/delivery-assignment?room=${finalRoom}`;
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [paidIds, plan, roomId]);

  const handleMyPaymentSuccess = (paymentId: string) => {
    if (!myPlanItem) return;
    setPaidIds((prev) => new Set(prev).add(String(myPlanItem.userId)));
    setShowPayWidget(false);
  };

  const totalAmount = plan.reduce((s, p) => s + p.amount, 0);
  const paidAmount = plan
    .filter((p) => paidIds.has(String(p.userId)))
    .reduce((s, p) => s + p.amount, 0);
  const progressPct = plan.length ? (paidIds.size / plan.length) * 100 : 0;
  const allPaid = plan.length > 0 && paidIds.size === plan.length;

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

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-14">
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

        {/* Two-column layout: left = members list, right = payment panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
          {/* LEFT: Progress + members */}
          <div className="space-y-5">
            {/* Progress bar */}
            <div className="rounded-2xl border border-amber-400/15 bg-black/60 backdrop-blur-xl p-6">
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
            <div className="space-y-3">
              {plan.map((item) => {
                const itemIdStr = String(item.userId).trim();
                const isMe = itemIdStr === myUserId;
                const paid = paidIds.has(itemIdStr);
                return (
                  <div
                    key={item.userId}
                    className={`rounded-2xl border p-5 transition-all ${
                      paid
                        ? "border-emerald-400/40 bg-emerald-400/[0.04]"
                        : isMe
                          ? "border-amber-400/60 bg-amber-400/[0.06] shadow-[0_0_30px_-10px_rgba(245,158,11,0.4)]"
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

                    {/* Status line */}
                    {!paid && (
                      <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-center text-white/40">
                        {isMe
                          ? "Ready — use the panel on the right"
                          : `Waiting for ${item.username}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Payment panel */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.08] via-black to-black p-6 shadow-[0_0_60px_-20px_rgba(245,158,11,0.5)]">
              <div className="flex items-center gap-2 text-amber-300 mb-5">
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                  Your Payment
                </span>
              </div>

              {!myPlanItem ? (
                <p className="text-white/50 text-sm italic py-6 text-center">
                  You aren't part of this split.
                </p>
              ) : allPaid ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
                  <p className="text-lg font-bold text-emerald-300 mb-2">
                    All Payments Complete
                  </p>
                  <p className="text-xs text-white/60">
                    Assigning your delivery partner…
                  </p>
                </div>
              ) : myAlreadyPaid ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
                  <p className="text-lg font-bold text-emerald-300 mb-2">
                    You've Paid
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Waiting for {plan.length - paidIds.size} more friend
                    {plan.length - paidIds.size === 1 ? "" : "s"} to complete
                    their share.
                  </p>
                </div>
              ) : (
                <>
                  {/* Your share breakdown */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">
                      Your Share
                    </p>
                    <p className="text-4xl font-bold text-white flex items-center gap-2">
                      <IndianRupee className="w-7 h-7 text-amber-400" />
                      {myPlanItem.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-amber-300/80 mt-1">
                      {myPlanItem.percent}% of total bill
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent my-5" />

                  {/* Pay button */}
                  {!showPayWidget ? (
                    <button
                      onClick={() => setShowPayWidget(true)}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black font-bold uppercase text-xs tracking-[0.25em] flex items-center justify-center gap-2 hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay ₹{myPlanItem.amount.toFixed(2)} Now
                    </button>
                  ) : (
                    <RazorpayPayment
                      amount={myPlanItem.amount}
                      orderId={`SPLIT-${myPlanItem.username}-${Date.now()}`}
                      onSuccess={handleMyPaymentSuccess}
                      onFailure={(err) => {
                        alert(`Payment failed: ${err}`);
                        setShowPayWidget(false);
                      }}
                    />
                  )}

                  {/* Trust line */}
                  <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.2em]">
                    <ShieldCheck className="w-3 h-3 text-amber-400/50" />
                    Secured by Razorpay
                  </div>
                </>
              )}
            </div>

            {/* Info card */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Each friend pays their own share through Razorpay. Once
                  everyone has paid, delivery is automatically assigned to the
                  nearest friend.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mt-8 mx-auto flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/50 font-bold uppercase text-xs tracking-[0.25em] hover:border-amber-400/40 hover:text-amber-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
}

export default SplitPaymentPage;
