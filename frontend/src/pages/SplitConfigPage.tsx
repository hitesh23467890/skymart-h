// frontend/src/pages/SplitConfigPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Users,
  Crown,
  ArrowRight,
  ArrowLeft,
  Lock,
  IndianRupee,
  Sparkles,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://skymart-h.onrender.com";

interface Participant {
  userId: string;
  username: string;
}

export function SplitConfigPage() {
  const [params] = useSearchParams();
  const roomId = params.get("room") || "";
  const navigate = useNavigate();

  const [cartTotal, setCartTotal] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  // Percentages per participant — should sum to 100
  const [splits, setSplits] = useState<number[]>([]);
  const [locked, setLocked] = useState(false); // once split confirmed

  // Load cart + participants from localStorage (saved by Shop Together)
  useEffect(() => {
    try {
      const rawCart = localStorage.getItem("groupCartItems");
      const rawParts = localStorage.getItem("groupParticipants");
      const cart = rawCart ? JSON.parse(rawCart) : [];
      const parts: Participant[] = rawParts ? JSON.parse(rawParts) : [];

      const total = cart.reduce(
        (sum: number, i: any) => sum + Number(i.price) * (i.quantity || 1),
        0,
      );
      setCartTotal(total);
      setParticipants(parts);

      // Default: equal split
      const n = parts.length || 1;
      const equal = 100 / n;
      setSplits(parts.map(() => Math.round(equal)));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const myUserId = parseInt(localStorage.getItem("userId") || "0");

  const totalAssigned = splits.reduce((a, b) => a + b, 0);
  const diff = 100 - totalAssigned;

  const amountFor = (pct: number) => (cartTotal * pct) / 100;

  // Presets
  const applyEqual = () => {
    const n = participants.length || 1;
    const equal = Math.round(100 / n);
    const arr = participants.map(() => equal);
    // Fix rounding on first entry
    if (arr.length > 0) arr[0] += 100 - equal * n;
    setSplits(arr);
  };

  const apply80_20 = () => {
    if (participants.length < 2) return;
    const arr = participants.map((_, i) => (i === 0 ? 80 : 0));
    if (arr.length === 2) arr[1] = 20;
    setSplits(arr);
  };

  const apply70_30 = () => {
    if (participants.length < 2) return;
    const arr = participants.map((_, i) => (i === 0 ? 70 : 0));
    if (arr.length === 2) arr[1] = 30;
    setSplits(arr);
  };

  const updateSplit = (idx: number, value: number) => {
    setSplits((prev) => {
      const next = [...prev];
      next[idx] = Math.max(0, Math.min(100, Math.round(value)));
      return next;
    });
  };

  const myShare = useMemo(() => {
    const idx = participants.findIndex((p) => p.userId === String(myUserId));
    if (idx === -1) return { pct: 0, amount: 0 };
    const pct = splits[idx] ?? 0;
    return { pct, amount: (cartTotal * pct) / 100 };
  }, [participants, splits, myUserId, cartTotal]);

  const canProceed = totalAssigned === 100 && splits.every((s) => s >= 0);

  const handleProceed = () => {
    if (!canProceed) {
      alert(`Total must equal 100%. Currently ${totalAssigned}%.`);
      return;
    }

    // Save the split plan for the payment page
    const plan = participants.map((p, i) => ({
      userId: p.userId,
      username: p.username,
      percent: splits[i],
      amount: (cartTotal * splits[i]) / 100,
    }));
    localStorage.setItem("splitPlan", JSON.stringify(plan));

    // Navigate to the split payment page (existing flow)
    navigate(`/split-payment?room=${roomId}`);
  };

  if (participants.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white/60 mb-6">
            No participants found in this room.
          </p>
          <button
            onClick={() => navigate("/catalog")}
            className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl"
          >
            Back to Catalog
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
            Step 2 of 3 — Split Configuration
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light">
            Split the{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Bill
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-3">
            Room{" "}
            <span className="text-amber-300 font-mono font-semibold">
              {roomId}
            </span>{" "}
            • {participants.length} friends · Total ₹{cartTotal.toFixed(2)}
          </p>
        </div>

        {/* Quick presets */}
        <div className="mb-8 rounded-2xl border border-amber-400/15 bg-black/60 backdrop-blur-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Quick Presets
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={applyEqual}
              className="px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/5 text-amber-200 text-xs font-semibold hover:bg-amber-400/15 transition-all"
            >
              Equal Split
            </button>
            {participants.length === 2 && (
              <>
                <button
                  onClick={apply80_20}
                  className="px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/5 text-amber-200 text-xs font-semibold hover:bg-amber-400/15 transition-all"
                >
                  80 / 20
                </button>
                <button
                  onClick={apply70_30}
                  className="px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/5 text-amber-200 text-xs font-semibold hover:bg-amber-400/15 transition-all"
                >
                  70 / 30
                </button>
                <button
                  onClick={() => setSplits([100, 0])}
                  className="px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/5 text-amber-200 text-xs font-semibold hover:bg-amber-400/15 transition-all"
                >
                  100 / 0
                </button>
              </>
            )}
          </div>
        </div>

        {/* Participant rows */}
        <div className="space-y-3 mb-6">
          {participants.map((p, i) => {
            const isMe = p.userId === String(myUserId);
            const pct = splits[i] ?? 0;
            const amt = amountFor(pct);
            return (
              <div
                key={p.userId}
                className={`rounded-2xl border p-5 transition-all ${
                  isMe
                    ? "border-amber-400/40 bg-amber-400/[0.04]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold ${
                      isMe
                        ? "bg-gradient-to-br from-amber-300 to-amber-500 text-black"
                        : "bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10"
                    }`}
                  >
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {p.username}
                      {isMe && (
                        <span className="text-[10px] text-amber-300 ml-2">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-white/40">
                      Click and drag to adjust
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-300">{pct}%</p>
                    <p className="text-xs text-white/60 font-mono">
                      ₹{amt.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pct}
                  onChange={(e) => updateSplit(i, Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-amber-400 cursor-pointer"
                />

                {/* +/- quick buttons */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  {[-10, -5, 5, 10].map((d) => (
                    <button
                      key={d}
                      onClick={() => updateSplit(i, pct + d)}
                      className="px-3 py-1 rounded-md border border-white/10 text-xs text-white/60 hover:border-amber-400/40 hover:text-amber-300 transition-all"
                    >
                      {d > 0 ? `+${d}` : d}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total check */}
        <div
          className={`rounded-2xl border p-5 mb-8 flex items-center justify-between ${
            totalAssigned === 100
              ? "border-emerald-400/40 bg-emerald-400/[0.04]"
              : "border-rose-400/40 bg-rose-400/[0.04]"
          }`}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 mb-1">
              Total Assigned
            </p>
            <p
              className={`text-2xl font-bold ${
                totalAssigned === 100 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {totalAssigned}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 mb-1">
              Amount
            </p>
            <p className="text-2xl font-bold text-amber-300 font-mono">
              ₹{((cartTotal * totalAssigned) / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Your share summary */}
        <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-transparent p-5 mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-2">
            Your Share
          </p>
          <p className="text-3xl font-bold text-white flex items-center gap-1">
            <IndianRupee className="w-6 h-6 text-amber-400" />
            {myShare.amount.toFixed(2)}
            <span className="text-sm text-amber-300 font-normal ml-2">
              ({myShare.pct}%)
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-4 rounded-2xl border border-white/10 text-white/60 font-bold uppercase text-xs tracking-[0.25em] hover:border-amber-400/40 hover:text-amber-300 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black font-bold uppercase text-xs tracking-[0.25em] flex items-center justify-center gap-3 hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.6)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue to Payment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.2em]">
          <Lock className="w-3 h-3 text-amber-400/50" />
          Secured by Razorpay
        </div>
      </div>
    </div>
  );
}

export default SplitConfigPage;
