// frontend/src/components/SplitPaymentPage.tsx

import React, { useState, useEffect } from "react";
import {
  Users,
  Wallet,
  CheckCircle,
  Clock,
  X,
  ChevronRight,
  IndianRupee,
  Loader2,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://skymart-h.onrender.com";

interface Participant {
  userId: string;
  username: string;
  amount: number;
  status: "pending" | "paid";
  paymentId?: number;
}

interface SplitPaymentPageProps {
  roomId: string;
  cartItems: any[];
  currentUserId: string;
  currentUsername: string;
  participants: any[];
  onClose: () => void;
  onComplete: () => void;
}

export function SplitPaymentPage({
  roomId,
  cartItems,
  currentUserId,
  currentUsername,
  participants,
  onClose,
  onComplete,
}: SplitPaymentPageProps) {
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [groupOrderId, setGroupOrderId] = useState<number | null>(null);
  const [payments, setPayments] = useState<Participant[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  const perPerson = totalAmount / participants.length;

  // Create group order on mount
  useEffect(() => {
    createGroupOrder();
  }, []);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createGroupOrder = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/payments/group/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          room_id: roomId,
          cart_items: cartItems,
          total_amount: totalAmount,
          split_type: splitType,
          participants: participants.map((p) => ({
            userId: p.userId,
            username: p.username,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGroupOrderId(data.group_order_id);
        setPayments(
          data.payments.map((p: any) => ({
            userId: p.user_id,
            username: p.username,
            amount: p.amount,
            status: p.status,
            paymentId: p.id,
          })),
        );
      } else {
        setError(data.error || "Failed to create group order");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePayNow = async (participant: Participant) => {
    if (!participant.paymentId) return;

    setIsPaying(true);
    setError(null);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load Razorpay");
      }

      // Create member payment
      const response = await fetch(
        `${API_BASE}/api/payments/group/member/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            group_order_id: groupOrderId,
            user_id: participant.userId,
            amount: participant.amount,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Open Razorpay
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "SkyMart Group Payment",
        description: `Split payment for ${participant.username}`,
        order_id: data.order_id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch(
            `${API_BASE}/api/payments/group/member/verify/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify({
                payment_id: participant.paymentId,
                razorpay_order_id: data.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            },
          );

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            // Update payment status
            setPayments((prev) =>
              prev.map((p) =>
                p.userId === participant.userId ? { ...p, status: "paid" } : p,
              ),
            );

            // Check if all paid
            if (verifyData.all_paid) {
              setTimeout(() => {
                onComplete();
              }, 1500);
            }
          }
        },
        theme: { color: "#F59E0B" },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPaying(false);
    }
  };

  const paidCount = payments.filter((p) => p.status === "paid").length;
  const allPaid = paidCount === payments.length && payments.length > 0;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-amber-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                Split the Bill
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Room: {roomId} • {participants.length} friends
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Total */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">
                  Total Amount
                </p>
                <p className="text-4xl font-bold text-stone-900 mt-1 flex items-center">
                  <IndianRupee className="w-8 h-8" />
                  {totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">
                  Each Pays
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1 flex items-center justify-end">
                  <IndianRupee className="w-5 h-5" />
                  {perPerson.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Split Type Selector */}
          <div className="flex gap-3">
            <button
              onClick={() => setSplitType("equal")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                splitType === "equal"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Equal Split
            </button>
            <button
              onClick={() => setSplitType("custom")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                splitType === "custom"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Custom Split
            </button>
          </div>

          {/* Progress */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-900">
                Payment Progress
              </span>
              <span className="text-sm font-bold text-blue-600">
                {paidCount} / {payments.length} paid
              </span>
            </div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${(paidCount / payments.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
              Friends
            </h3>
            {payments.map((participant) => {
              const isCurrentUser = participant.userId === currentUserId;
              const isPaid = participant.status === "paid";

              return (
                <div
                  key={participant.userId}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    isPaid
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-stone-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        isPaid
                          ? "bg-emerald-500 text-white"
                          : "bg-gradient-to-br from-purple-500 to-amber-500 text-white"
                      }`}
                    >
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">
                        {participant.username}
                        {isCurrentUser && (
                          <span className="text-xs text-purple-600 ml-2">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        {isPaid ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">
                              Paid
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-stone-900 flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {participant.amount.toFixed(2)}
                      </p>
                    </div>

                    {!isPaid && isCurrentUser && (
                      <button
                        onClick={() => handlePayNow(participant)}
                        disabled={isPaying}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isPaying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Pay Now"
                        )}
                      </button>
                    )}

                    {!isPaid && !isCurrentUser && (
                      <span className="text-xs text-stone-400 italic">
                        Waiting...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All Paid Message */}
          {allPaid && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-5 text-center animate-pulse">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-emerald-700 text-lg">
                🎉 All Payments Complete!
              </p>
              <p className="text-sm text-stone-600 mt-1">
                Order confirmed. Processing delivery...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-stone-600 font-semibold hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancel
          </button>

          {allPaid ? (
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              Continue to Delivery
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs text-stone-500">
              {payments.length - paidCount} friend(s) still need to pay
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
