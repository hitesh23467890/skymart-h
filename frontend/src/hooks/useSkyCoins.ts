// src/hooks/useSkyCoins.ts - DATABASE VERSION
import { useState, useEffect, useCallback, useRef } from "react";

interface PurchaseDay {
  date: string;
  productName: string;
  productId: number;
  amount: number;
  orderId?: string;
}

interface SkyCoinsData {
  currentStreak: number;
  maxStreak: number;
  streakStartDate: string | null;
  lastPurchaseDate: string | null;
  purchases: PurchaseDay[];
  couponUnlocked: boolean;
  couponCode: string | null;
  couponUnlockDate: string | null;
  couponUsed: boolean;
  skyCoinsBalance: number;
  totalSkyCoinsEarned: number;
  totalPurchases: number;
  requiredDays: number;
  skyCoinsReward: number;
}

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "http://127.0.0.1:8000";

export function useSkyCoins() {
  const [skyCoinsData, setSkyCoinsData] = useState<SkyCoinsData>({
    currentStreak: 0,
    maxStreak: 0,
    streakStartDate: null,
    lastPurchaseDate: null,
    purchases: [],
    couponUnlocked: false,
    couponCode: null,
    couponUnlockDate: null,
    couponUsed: false,
    skyCoinsBalance: 0,
    totalSkyCoinsEarned: 0,
    totalPurchases: 0,
    requiredDays: 7,
    skyCoinsReward: 500,
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [newCouponCode, setNewCouponCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get auth token from localStorage
  const getAuthToken = useCallback(() => {
    return localStorage.getItem("authToken") || "";
  }, []);

  // Load data from API on mount
  useEffect(() => {
    loadSkyCoinsData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  const loadSkyCoinsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();

      console.log("🔍 Loading SkyCoins data from API...");

      if (!token) {
        console.log("❌ No auth token found");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/skycoins/data/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to load SkyCoins data: ${response.status}`);
      }

      const result = await response.json();
      console.log("📥 API Response:", result);

      if (result.success) {
        setSkyCoinsData({
          currentStreak: result.data.current_streak || 0,
          maxStreak: result.data.max_streak || 0,
          streakStartDate: result.data.streak_start_date,
          lastPurchaseDate: result.data.last_purchase_date,
          purchases: result.data.purchases || [],
          couponUnlocked: result.data.coupon_unlocked || false,
          couponCode: result.data.coupon_code || null,
          couponUnlockDate: result.data.coupon_unlock_date,
          couponUsed: result.data.coupon_used || false,
          skyCoinsBalance: result.data.skycoins_balance || 0,
          totalSkyCoinsEarned: result.data.total_skycoins_earned || 0,
          totalPurchases: result.data.total_purchases || 0,
          requiredDays: result.data.required_days || 7,
          skyCoinsReward: result.data.skycoins_reward || 500,
        });
        console.log("✅ SkyCoins data loaded successfully!");
        console.log("📊 Streak:", result.data.current_streak);
        console.log("🪙 SkyCoins:", result.data.skycoins_balance);
        console.log("🎟️ Coupon:", result.data.coupon_code);
      } else {
        console.error("❌ API returned error:", result);
      }
    } catch (error) {
      console.error("❌ Error loading SkyCoins data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  const triggerCelebration = useCallback((message?: string) => {
    if (typeof window !== "undefined") {
      try {
        import("canvas-confetti").then((module) => {
          const confetti = module.default;
          const duration = 5000;
          const end = Date.now() + duration;
          const colors = [
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#3b82f6",
            "#22c55e",
            "#ec4899",
            "#ffd700",
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

          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 120,
              origin: { y: 0.6, x: 0.5 },
              colors: colors,
            });
          }, 500);
        });
      } catch (error) {
        console.warn("Confetti not available:", error);
      }
    }
  }, []);

  const addPurchase = useCallback(
    async (
      productId: number,
      productName: string,
      productPrice: number,
      quantity: number = 1,
    ): Promise<{
      success: boolean;
      couponUnlocked: boolean;
      couponCode: string | null;
      skyCoinsEarned: number;
      orderId?: string;
      message?: string;
      streakIncremented?: boolean;
      newStreak?: number;
    }> => {
      if (isProcessing) {
        return {
          success: false,
          couponUnlocked: false,
          couponCode: null,
          skyCoinsEarned: 0,
          message: "Processing...",
        };
      }

      try {
        setIsProcessing(true);
        const token = getAuthToken();

        if (!token) {
          return {
            success: false,
            couponUnlocked: false,
            couponCode: null,
            skyCoinsEarned: 0,
            message: "Please login first",
          };
        }

        console.log("📤 Adding purchase to streak...");
        const response = await fetch(`${API_BASE}/api/skycoins/add-purchase/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: productId,
            product_name: productName,
            product_price: productPrice,
            quantity: quantity,
          }),
        });

        const result = await response.json();
        console.log("📥 Add purchase response:", result);

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to add purchase");
        }

        const newData = result.data;
        setSkyCoinsData((prev) => ({
          ...prev,
          currentStreak: newData.current_streak,
          maxStreak: newData.max_streak,
          skyCoinsBalance: newData.skycoins_balance,
          couponUnlocked: newData.coupon_unlocked,
          couponCode: newData.coupon_code,
          totalPurchases: prev.totalPurchases + 1,
        }));

        const streakIncremented = newData.streak_incremented || false;
        const newStreak = newData.current_streak;

        if (streakIncremented && newStreak > 0 && newStreak < 7) {
          setCelebrationMessage(
            `🔥 Streak increased to ${newStreak}/7 days! Keep going!`,
          );
          setShowCelebration(true);

          if (celebrationTimerRef.current) {
            clearTimeout(celebrationTimerRef.current);
          }
          celebrationTimerRef.current = setTimeout(() => {
            setShowCelebration(false);
          }, 3000);
        }

        if (newData.coupon_unlocked && newData.coupon_code) {
          setShowCelebration(true);
          setCelebrationMessage(
            `🎉 Amazing! You've maintained a 7-day streak!\n\n` +
              `🌟 You earned 500 SkyCoins!\n` +
              `💰 50% OFF Coupon: ${newData.coupon_code}`,
          );
          setNewCouponCode(newData.coupon_code);
          triggerCelebration("🎉 STREAK COMPLETE! 500 SKYCOINS EARNED!");

          if (celebrationTimerRef.current) {
            clearTimeout(celebrationTimerRef.current);
          }
          celebrationTimerRef.current = setTimeout(() => {
            setShowCelebration(false);
            setIsProcessing(false);
          }, 6000);
        }

        setIsProcessing(false);

        return {
          success: true,
          couponUnlocked: newData.coupon_unlocked,
          couponCode: newData.coupon_code,
          skyCoinsEarned: newData.skycoins_earned || 0,
          orderId: newData.order_id,
          message: newData.message,
          streakIncremented: streakIncremented,
          newStreak: newStreak,
        };
      } catch (error) {
        console.error("❌ Error adding purchase:", error);
        setIsProcessing(false);
        return {
          success: false,
          couponUnlocked: false,
          couponCode: null,
          skyCoinsEarned: 0,
          message:
            error instanceof Error ? error.message : "Failed to add purchase",
        };
      }
    },
    [isProcessing, getAuthToken, triggerCelebration],
  );

  const useCoupon = useCallback(async (): Promise<{
    success: boolean;
    couponCode: string | null;
    message?: string;
  }> => {
    try {
      const token = getAuthToken();

      if (!token) {
        return {
          success: false,
          couponCode: null,
          message: "Please login first",
        };
      }

      if (!skyCoinsData.couponUnlocked || skyCoinsData.couponUsed) {
        return {
          success: false,
          couponCode: null,
          message: "No valid coupon available",
        };
      }

      const response = await fetch(`${API_BASE}/api/skycoins/use-coupon/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to use coupon");
      }

      setSkyCoinsData((prev) => ({
        ...prev,
        couponUsed: true,
      }));

      return {
        success: true,
        couponCode: skyCoinsData.couponCode,
        message: "Coupon applied successfully!",
      };
    } catch (error) {
      console.error("Error using coupon:", error);
      return {
        success: false,
        couponCode: null,
        message:
          error instanceof Error ? error.message : "Failed to use coupon",
      };
    }
  }, [
    skyCoinsData.couponUnlocked,
    skyCoinsData.couponUsed,
    skyCoinsData.couponCode,
    getAuthToken,
  ]);

  const resetCelebration = useCallback(() => {
    setShowCelebration(false);
    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
    }
    setIsProcessing(false);
  }, []);

  const getSkyCoinsBalance = useCallback((): number => {
    return skyCoinsData.skyCoinsBalance;
  }, [skyCoinsData.skyCoinsBalance]);

  const getStreakProgress = useCallback((): {
    current: number;
    required: number;
    percentage: number;
    remaining: number;
  } => {
    const current = skyCoinsData.currentStreak;
    const required = skyCoinsData.requiredDays || 7;
    const percentage = Math.min((current / required) * 100, 100);
    const remaining = Math.max(required - current, 0);
    return { current, required, percentage, remaining };
  }, [skyCoinsData.currentStreak, skyCoinsData.requiredDays]);

  const getStreakStatus = useCallback(() => {
    const progress = getStreakProgress();
    const isComplete = progress.current >= progress.required;
    return {
      isComplete,
      progress,
      statusText: isComplete
        ? "🎉 Streak Complete!"
        : `${progress.current} / ${progress.required} days`,
      daysRemaining: progress.remaining,
    };
  }, [getStreakProgress]);

  const isEligibleForCoupon = useCallback((): boolean => {
    return skyCoinsData.couponUnlocked && !skyCoinsData.couponUsed;
  }, [skyCoinsData.couponUnlocked, skyCoinsData.couponUsed]);

  const refreshData = useCallback(() => {
    return loadSkyCoinsData();
  }, [loadSkyCoinsData]);

  return {
    skyCoinsData,
    showCelebration,
    celebrationMessage,
    newCouponCode,
    isLoading,
    isProcessing,
    addPurchase,
    useCoupon,
    resetCelebration,
    getSkyCoinsBalance,
    getStreakProgress,
    getStreakStatus,
    isEligibleForCoupon,
    refreshData,
    REQUIRED_DAYS: skyCoinsData.requiredDays || 7,
    SKYCOINS_REWARD: skyCoinsData.skyCoinsReward || 500,
  };
}
