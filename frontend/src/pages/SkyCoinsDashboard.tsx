// src/pages/SkyCoinsDashboard.tsx
import React from "react";
import {
  Flame,
  Gift,
  Calendar,
  ShoppingBag,
  Award,
  Sparkles,
  Coins,
  TrendingUp,
  Crown,
  Star,
  PartyPopper,
  Gem,
  CheckCircle,
  Clock,
  Zap,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { useSkyCoins } from "../hooks/useSkyCoins";

interface SkyCoinsDashboardProps {
  userId: string;
  onClose: () => void;
}

export function SkyCoinsDashboard({ userId, onClose }: SkyCoinsDashboardProps) {
  const {
    skyCoinsData,
    showCelebration,
    celebrationMessage,
    newCouponCode,
    resetCelebration,
    useCoupon,
    getSkyCoinsBalance,
    getStreakProgress,
    getStreakStatus,
    isEligibleForCoupon,
    REQUIRED_DAYS,
    SKYCOINS_REWARD,
  } = useSkyCoins(userId);

  const [copied, setCopied] = React.useState(false);
  const streakStatus = getStreakStatus();
  const progress = getStreakProgress();

  const copyCoupon = () => {
    if (skyCoinsData.couponCode) {
      navigator.clipboard.writeText(skyCoinsData.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 p-6 relative overflow-hidden">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-2xl w-full mx-4 animate-scale-in">
            <div className="bg-gradient-to-br from-amber-100 via-white to-amber-50 rounded-3xl p-8 shadow-2xl border-2 border-amber-300">
              <div className="absolute -top-6 -right-6 text-5xl animate-bounce">
                ✨
              </div>
              <div className="absolute -top-6 -left-6 text-5xl animate-bounce delay-100">
                ✨
              </div>
              <div className="absolute -bottom-6 -right-6 text-5xl animate-bounce delay-200">
                ✨
              </div>
              <div className="absolute -bottom-6 -left-6 text-5xl animate-bounce delay-300">
                ✨
              </div>
              <div className="text-center">
                <div className="text-8xl mb-4 animate-pulse">🌟</div>
                <h2 className="text-3xl font-bold text-amber-700 mb-2">
                  Congratulations!
                </h2>
                <div className="text-lg font-semibold text-stone-700 whitespace-pre-line">
                  {celebrationMessage}
                </div>
                {newCouponCode && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200 border-dashed">
                    <p className="text-sm font-medium text-amber-800">
                      Your 50% OFF Coupon
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <p className="text-2xl font-bold text-amber-600 font-mono tracking-wider">
                        {newCouponCode}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(newCouponCode);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="p-2 bg-amber-200 rounded-lg hover:bg-amber-300 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-amber-700" />
                        ) : (
                          <Copy className="w-5 h-5 text-amber-700" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={resetCelebration}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Awesome! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Decor */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-amber-400/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-rose-400/5 rounded-full filter blur-3xl"></div>

      {/* Header with Back Button */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Store</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-stone-700">
                  {getSkyCoinsBalance()} SkyCoins
                </span>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-serif font-light text-stone-800 mb-2">
          Sky<span className="text-amber-600">Coins</span>
        </h1>
        <p className="text-stone-500 mb-8">
          Maintain your streak to earn SkyCoins and unlock exclusive rewards!
        </p>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Flame className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Current Streak</p>
                <p className="text-2xl font-bold text-stone-800">
                  {skyCoinsData.currentStreak} days
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
                  {skyCoinsData.maxStreak} days
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
                  {skyCoinsData.purchases.length}
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
                  {isEligibleForCoupon()
                    ? "✅ Available"
                    : skyCoinsData.couponUnlocked
                      ? "🔒 Used"
                      : "🔒 Locked"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Challenge Progress */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-100/50 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-stone-800">
                7-Day Streak Challenge
              </h3>
              <p className="text-sm text-stone-500">
                Buy a product every day to earn <strong>500 SkyCoins</strong>{" "}
                and a <strong>50% OFF coupon</strong>!
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full ${streakStatus.isComplete ? "bg-green-100" : "bg-amber-50"}`}
            >
              <span
                className={`font-bold ${streakStatus.isComplete ? "text-green-600" : "text-amber-600"}`}
              >
                {streakStatus.statusText}
              </span>
            </div>
          </div>

          {/* Streak Days */}
          <div className="flex gap-2 mb-4">
            {[...Array(REQUIRED_DAYS)].map((_, i) => {
              const isActive = i < skyCoinsData.currentStreak;
              const isToday =
                i === skyCoinsData.currentStreak &&
                skyCoinsData.currentStreak < REQUIRED_DAYS;
              const isComplete = skyCoinsData.currentStreak >= REQUIRED_DAYS;

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
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-sm text-stone-500">
            <span>Start</span>
            <span>
              {streakStatus.isComplete
                ? "🎉 Complete!"
                : `${streakStatus.daysRemaining} day${streakStatus.daysRemaining > 1 ? "s" : ""} remaining`}
            </span>
            <span>🎯 Goal</span>
          </div>

          {/* SkyCoins Earned Display */}
          {isEligibleForCoupon() && (
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="w-8 h-8 text-amber-500 animate-bounce" />
                  <div>
                    <p className="font-bold text-amber-700">
                      🎉 SkyCoins Earned!
                    </p>
                    <p className="text-sm text-stone-600">
                      500 SkyCoins + 50% OFF Coupon
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-700 text-sm">
                    {skyCoinsData.couponCode}
                  </span>
                  <button
                    onClick={copyCoupon}
                    className="p-2 bg-amber-200 rounded-lg hover:bg-amber-300 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-amber-700" />
                    ) : (
                      <Copy className="w-4 h-4 text-amber-700" />
                    )}
                  </button>
                </div>
              </div>
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
              {skyCoinsData.purchases.length} items
            </span>
          </div>

          {skyCoinsData.purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No purchases yet</p>
              <p className="text-sm text-stone-400">Start your streak today!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...skyCoinsData.purchases].reverse().map((purchase, index) => {
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
                        className={`p-2 rounded-full ${isToday ? "bg-amber-200" : "bg-stone-100"}`}
                      >
                        <ShoppingBag
                          className={`w-5 h-5 ${isToday ? "text-amber-600" : "text-stone-500"}`}
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
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-4 font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
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
