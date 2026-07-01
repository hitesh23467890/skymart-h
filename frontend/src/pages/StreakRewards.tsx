// src/pages/StreakRewards.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Gift,
  Zap,
  Flame,
  ShoppingBag,
  Award,
  Sparkles,
  Coins,
  CheckCircle,
  Clock,
  TrendingUp,
  Crown,
  Star,
  PartyPopper,
  Gem,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PurchaseDay {
  date: string;
  productName: string;
  productId: number;
  amount: number;
}

interface StreakData {
  currentStreak: number;
  maxStreak: number;
  streakStartDate: string | null;
  lastPurchaseDate: string | null;
  purchases: PurchaseDay[];
  couponUnlocked: boolean;
  couponCode: string | null;
  couponUnlockDate: string | null;
}

const STORAGE_KEY = "skymart_streak_data";
const REQUIRED_DAYS = 7;

export function StreakRewards({
  userId,
  onCouponUnlocked,
}: {
  userId: string;
  onCouponUnlocked?: (code: string) => void;
}) {
  const [streakData, setStreakData] = useState<StreakData>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      currentStreak: 0,
      maxStreak: 0,
      streakStartDate: null,
      lastPurchaseDate: null,
      purchases: [],
      couponUnlocked: false,
      couponCode: null,
      couponUnlockDate: null,
    };
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check and update streak on mount
  useEffect(() => {
    checkStreakStatus();
    // Check if coupon was recently unlocked
    if (streakData.couponUnlocked) {
      setShowCelebration(true);
      setCelebrationMessage(
        `🎉 You unlocked a 50% OFF coupon! Code: ${streakData.couponCode}`,
      );
      triggerConfetti();
      setTimeout(() => {
        setShowCelebration(false);
        setConfettiTriggered(false);
      }, 5000);
    }
  }, []);

  const checkStreakStatus = () => {
    const today = new Date().toDateString();
    const lastPurchase = streakData.lastPurchaseDate
      ? new Date(streakData.lastPurchaseDate).toDateString()
      : null;

    if (lastPurchase && lastPurchase !== today) {
      const diffDays = Math.floor(
        (new Date().getTime() -
          new Date(streakData.lastPurchaseDate!).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (diffDays > 1) {
        // Streak broken
        setStreakData((prev) => ({
          ...prev,
          currentStreak: 0,
          streakStartDate: null,
          couponUnlocked: false,
          couponCode: null,
        }));
      }
    }
  };

  const triggerConfetti = () => {
    if (confettiTriggered) return;
    setConfettiTriggered(true);

    const duration = 5000;
    const end = Date.now() + duration;

    const colors = [
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#3b82f6",
      "#22c55e",
      "#ec4899",
    ];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Big burst
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
      });
    }, 500);
  };

  const addPurchase = (
    productName: string,
    productId: number,
    amount: number,
  ) => {
    const today = new Date().toISOString();
    const todayDate = new Date().toDateString();
    const lastPurchaseDate = streakData.lastPurchaseDate
      ? new Date(streakData.lastPurchaseDate).toDateString()
      : null;

    let newStreak = streakData.currentStreak;
    let streakStartDate = streakData.streakStartDate;

    if (lastPurchaseDate === todayDate) {
      // Already purchased today, just add to purchases
    } else if (lastPurchaseDate) {
      const diffDays = Math.floor(
        (new Date().getTime() -
          new Date(streakData.lastPurchaseDate!).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
        if (!streakStartDate) {
          streakStartDate = today;
        }
      } else if (diffDays > 1) {
        // Streak broken, reset
        newStreak = 1;
        streakStartDate = today;
      }
    } else {
      // First purchase
      newStreak = 1;
      streakStartDate = today;
    }

    // Check if streak completed
    let couponUnlocked = streakData.couponUnlocked;
    let couponCode = streakData.couponCode;
    let couponUnlockDate = streakData.couponUnlockDate;

    if (newStreak >= REQUIRED_DAYS && !couponUnlocked) {
      couponUnlocked = true;
      couponCode = `SKY50-${userId.slice(0, 4)}-${Date.now().toString().slice(-4)}`;
      couponUnlockDate = today;

      // Trigger celebration
      setShowCelebration(true);
      setCelebrationMessage(
        `🎉 Amazing! You've maintained a ${REQUIRED_DAYS}-day streak! 🎉\nHere's your 50% OFF coupon: ${couponCode}`,
      );
      triggerConfetti();

      if (onCouponUnlocked) {
        onCouponUnlocked(couponCode);
      }

      // Reset streak after unlocking coupon
      setTimeout(() => {
        setShowCelebration(false);
        setConfettiTriggered(false);

        // Reset streak but keep coupon
        setStreakData((prev) => ({
          ...prev,
          currentStreak: 0,
          streakStartDate: null,
          couponUnlocked: true,
          couponCode: couponCode,
          couponUnlockDate: couponUnlockDate,
          purchases: [
            ...prev.purchases,
            { date: today, productName, productId, amount },
          ],
          lastPurchaseDate: today,
        }));
        return;
      }, 5000);
    }

    // Update state
    const updatedData = {
      currentStreak: newStreak,
      maxStreak: Math.max(streakData.maxStreak, newStreak),
      streakStartDate: streakStartDate,
      lastPurchaseDate: today,
      purchases: [
        ...streakData.purchases,
        { date: today, productName, productId, amount },
      ],
      couponUnlocked: couponUnlocked,
      couponCode: couponCode,
      couponUnlockDate: couponUnlockDate,
    };

    setStreakData(updatedData);
    localStorage.setItem(
      `${STORAGE_KEY}_${userId}`,
      JSON.stringify(updatedData),
    );
  };

  const getStreakStatus = () => {
    if (streakData.currentStreak >= REQUIRED_DAYS) {
      return {
        text: "🎉 Streak Complete!",
        color: "text-green-600",
        bgColor: "bg-green-100",
        progress: 100,
      };
    }
    return {
      text: `${streakData.currentStreak} / ${REQUIRED_DAYS} days`,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      progress: (streakData.currentStreak / REQUIRED_DAYS) * 100,
    };
  };

  const streakStatus = getStreakStatus();
  const daysRemaining = Math.max(REQUIRED_DAYS - streakData.currentStreak, 0);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 p-6"
    >
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-2xl w-full mx-4">
            <div className="bg-gradient-to-br from-amber-100 via-white to-amber-50 rounded-3xl p-8 shadow-2xl border-2 border-amber-300 animate-scale-in">
              {/* Sparkle decorations */}
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
                ✨
              </div>
              <div className="absolute -top-4 -left-4 text-4xl animate-bounce delay-100">
                ✨
              </div>
              <div className="absolute -bottom-4 -right-4 text-4xl animate-bounce delay-200">
                ✨
              </div>
              <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce delay-300">
                ✨
              </div>

              <div className="text-center">
                <div className="text-8xl mb-4 animate-pulse">🎉</div>
                <h2 className="text-3xl font-bold text-amber-700 mb-2">
                  Congratulations!
                </h2>
                <div className="text-xl font-semibold text-stone-700 whitespace-pre-line">
                  {celebrationMessage}
                </div>
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200 border-dashed">
                  <p className="text-sm font-medium text-amber-800">
                    Your 50% OFF Coupon
                  </p>
                  <p className="text-2xl font-bold text-amber-600 font-mono tracking-wider">
                    {streakData.couponCode || "SKY50-XXXX-XXXX"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    setConfettiTriggered(false);
                  }}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Awesome! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-light text-stone-800">
              Your <span className="text-amber-600">Streak</span> Journey
            </h1>
            <p className="text-stone-500 mt-1">
              Buy daily to unlock amazing rewards!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-200/50">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-stone-700">
                  {streakData.currentStreak} days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Flame className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Current Streak</p>
                <p className="text-2xl font-bold text-stone-800">
                  {streakData.currentStreak} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Best Streak</p>
                <p className="text-2xl font-bold text-stone-800">
                  {streakData.maxStreak} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Total Purchases</p>
                <p className="text-2xl font-bold text-stone-800">
                  {streakData.purchases.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Gift className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Coupon Status</p>
                <p className="text-2xl font-bold text-stone-800">
                  {streakData.couponUnlocked ? "✅ Unlocked" : "🔒 Locked"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Progress */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-100/50 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-stone-800">
                7-Day Streak Challenge
              </h3>
              <p className="text-sm text-stone-500">
                Buy a product every day to unlock a 50% OFF coupon!
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full ${streakStatus.bgColor}`}>
              <span className={`font-bold ${streakStatus.color}`}>
                {streakStatus.text}
              </span>
            </div>
          </div>

          {/* Streak Days */}
          <div className="flex gap-2 mb-4">
            {[...Array(REQUIRED_DAYS)].map((_, i) => {
              const isActive = i < streakData.currentStreak;
              const isToday =
                i === streakData.currentStreak &&
                streakData.currentStreak < REQUIRED_DAYS;
              const isComplete = streakData.currentStreak >= REQUIRED_DAYS;

              return (
                <div
                  key={i}
                  className={`flex-1 h-16 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isActive
                      ? "bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30"
                      : isToday
                        ? "bg-amber-100 text-amber-600 border-2 border-amber-400 animate-pulse"
                        : "bg-stone-100 text-stone-400"
                  }`}
                >
                  <span className="text-lg font-bold">Day {i + 1}</span>
                  {isActive && <CheckCircle className="w-4 h-4" />}
                  {isToday && <Zap className="w-4 h-4 animate-pulse" />}
                  {isComplete && <Star className="w-4 h-4 text-amber-400" />}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-700"
              style={{ width: `${streakStatus.progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-sm text-stone-500">
            <span>Start</span>
            <span>
              {streakData.currentStreak >= REQUIRED_DAYS
                ? "🎉 Complete!"
                : `${daysRemaining} day${daysRemaining > 1 ? "s" : ""} remaining`}
            </span>
            <span>🎯 Goal</span>
          </div>

          {streakData.couponUnlocked && (
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="w-8 h-8 text-amber-500 animate-bounce" />
                  <div>
                    <p className="font-bold text-amber-700">
                      50% OFF Coupon Unlocked! 🎉
                    </p>
                    <p className="text-sm text-stone-600 font-mono">
                      {streakData.couponCode}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(streakData.couponCode || "");
                    alert("Coupon code copied!");
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Copy Code
                </button>
              </div>
              <p className="text-xs text-stone-400 mt-2">
                Unlocked on{" "}
                {new Date(
                  streakData.couponUnlockDate || "",
                ).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Purchase History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-100/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-stone-800">
              Purchase History
            </h3>
            <span className="text-sm text-stone-500">
              {streakData.purchases.length} items
            </span>
          </div>

          {streakData.purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No purchases yet</p>
              <p className="text-sm text-stone-400">Start your streak today!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...streakData.purchases].reverse().map((purchase, index) => {
                const purchaseDate = new Date(purchase.date);
                const isToday =
                  purchaseDate.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      isToday
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-white/50 border border-stone-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          isToday ? "bg-amber-200" : "bg-stone-100"
                        }`}
                      >
                        <ShoppingBag
                          className={`w-5 h-5 ${
                            isToday ? "text-amber-600" : "text-stone-500"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">
                          {purchase.productName}
                        </p>
                        <p className="text-sm text-stone-500">
                          {purchaseDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {isToday && " (Today)"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-800">
                        ₹{purchase.amount}
                      </p>
                      {isToday && (
                        <span className="text-xs text-green-600">
                          ✅ Streak +1
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-4 font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shop Now
          </button>
          <button className="bg-white/80 backdrop-blur-sm border border-amber-200 text-stone-700 rounded-xl p-4 font-semibold hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
            <Gift className="w-5 h-5" />
            View Rewards
          </button>
          <button className="bg-white/80 backdrop-blur-sm border border-stone-200 text-stone-700 rounded-xl p-4 font-semibold hover:bg-stone-50 transition-all flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
