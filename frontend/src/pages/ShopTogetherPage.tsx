// src/pages/ShopTogetherPage.tsx
import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import {
  Users,
  MessageCircle,
  ShoppingCart,
  Eye,
  X,
  Send,
  UserPlus,
  Copy,
  Check,
  User,
  ExternalLink,
  Crown,
  ArrowLeft,
  Heart,
  Share2,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Sparkles,
  Zap,
  Gift,
  Lock,
  Star,
} from "lucide-react";

interface ShopTogetherPageProps {
  currentProduct?: any;
  userId: string;
  username: string;
  onProductSelect?: (product: any) => void;
  onClose?: () => void;
}

export function ShopTogetherPage({
  currentProduct,
  userId,
  username,
  onProductSelect,
  onClose,
}: ShopTogetherPageProps) {
  const {
    isConnected,
    currentRoom,
    roomState,
    joinRoom,
    leaveRoom,
    viewProduct,
    sendMessage,
    addToCollabCart,
    removeFromCollabCart,
    updateCartQuantity,
    users,
    messages,
    cartItems,
  } = useSocket();

  const [roomId, setRoomId] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const generateRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    joinRoom(newRoomId, username, userId);
    setIsCreatingRoom(true);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      joinRoom(roomId.trim().toUpperCase(), username, userId);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setRoomId("");
    setIsCreatingRoom(false);
    if (onClose) onClose();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/shop-together/${currentRoom}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Not in a room - show beautiful landing UI
  if (!currentRoom) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0a0a0f] via-[#14141a] to-[#1a1a24] text-white overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleLeaveRoom}
          className="absolute top-6 right-6 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-xl border border-white/10 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-500/10 rounded-full filter blur-[150px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-amber-500/10 rounded-full filter blur-[130px] animate-pulse-slow-delayed"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full filter blur-[200px]"></div>

          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-3 h-3 bg-purple-400/30 rounded-full animate-float"></div>
          <div className="absolute top-40 right-40 w-2 h-2 bg-amber-400/30 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-40 left-1/3 w-4 h-4 bg-blue-400/20 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-green-400/20 rounded-full animate-float-delayed"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-6xl">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-white/10 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400 tracking-wider">
                  Collaborative Shopping Experience
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Shop Together
              </h1>
              <p className="text-white/60 text-lg mt-4 max-w-2xl mx-auto">
                Invite friends to browse, chat, and shop together in real-time.
                Create a room or join an existing one to start your
                collaborative shopping journey.
              </p>
            </div>

            {/* Main Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Left - Create Room */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex p-3 bg-gradient-to-br from-purple-500/20 to-amber-500/20 rounded-2xl mb-4">
                    <UserPlus className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Create a Room
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    Start a new shopping session and invite your friends
                  </p>
                  <button
                    onClick={handleCreateRoom}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-amber-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
                  >
                    Create Room
                  </button>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-32 bg-white/10"></div>
                <div className="md:hidden w-full h-px bg-white/10"></div>

                {/* Right - Join Room */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex p-3 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-2xl mb-4">
                    <Users className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Join a Room
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    Enter a room code to join your friends
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter room code (e.g., ABC123)"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-purple-500 text-white text-sm uppercase font-mono tracking-wider transition-all"
                      maxLength={6}
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={!roomId.trim()}
                      className="px-6 py-3 bg-white text-[#1a1a24] rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                  ></div>
                  <span className="text-xs text-white/40">
                    {isConnected ? "Connected to server" : "Connecting..."}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    End-to-end encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-all group">
                <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Real-time Chat
                </h4>
                <p className="text-xs text-white/40 mt-1">
                  Talk with friends instantly
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-all group">
                <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Eye className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Live Viewing
                </h4>
                <p className="text-xs text-white/40 mt-1">
                  See what others are viewing
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-all group">
                <div className="w-12 h-12 mx-auto bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">Group Cart</h4>
                <p className="text-xs text-white/40 mt-1">Add items together</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center hover:border-rose-500/30 transition-all group">
                <div className="w-12 h-12 mx-auto bg-rose-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-rose-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Friend Presence
                </h4>
                <p className="text-xs text-white/40 mt-1">See who's online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // In a room - show the collaborative shopping UI
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0a0a0f] via-[#14141a] to-[#1a1a24] text-white overflow-y-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-500/8 rounded-full filter blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-amber-500/8 rounded-full filter blur-[130px] animate-pulse-slow-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/3 rounded-full filter blur-[200px]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 sticky top-0 bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLeaveRoom}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-full border border-purple-500/30">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">
                Room: {currentRoom}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/40">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span>{users.length} online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyRoomLink}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
            title="Copy invite link"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm font-semibold transition-all"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Users Online */}
        <div className="mb-6 flex flex-wrap gap-2">
          {users.map((user) => {
            const isCurrentUser = user.userId === userId;
            return (
              <div
                key={user.socketId}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                  isCurrentUser
                    ? "bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-500/30 text-purple-300"
                    : "bg-white/5 border border-white/5 text-white/80"
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-xs font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  {user.isActive && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a24]"></span>
                  )}
                </div>
                <span className="font-medium">
                  {user.username}{" "}
                  {isCurrentUser && (
                    <span className="text-xs text-purple-400">(You)</span>
                  )}
                </span>
                {user.currentProduct && (
                  <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5" /> viewing
                  </span>
                )}
                {isCurrentUser && <Crown className="w-3 h-3 text-amber-400" />}
              </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product View - Left */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-h-[500px]">
            {currentProduct ? (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/2 bg-white/5 rounded-xl p-8 flex items-center justify-center">
                  <img
                    src={currentProduct.img}
                    alt={currentProduct.name}
                    className="max-h-80 object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x400?text=No+Image";
                    }}
                  />
                </div>
                <div className="w-full lg:w-1/2 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                        {currentProduct.brand}
                      </span>
                      <h2 className="text-2xl font-bold text-white mt-1">
                        {currentProduct.name}
                      </h2>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-rose-400">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-amber-400">
                      ₹{currentProduct.price}
                    </span>
                    {currentProduct.discount_price && (
                      <span className="text-sm text-white/40 line-through">
                        ₹{currentProduct.discount_price}
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {currentProduct.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <button
                      onClick={() =>
                        addToCollabCart(currentProduct.id, currentProduct)
                      }
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-amber-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
                    >
                      <ShoppingCart className="w-4 h-4 inline mr-2" />
                      Add to Group Cart
                    </button>
                  </div>

                  {/* Viewers */}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40">
                      👀 Currently viewing this product:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {users
                        .filter(
                          (u) =>
                            u.currentProduct === currentProduct.id &&
                            u.userId !== userId,
                        )
                        .map((u) => (
                          <span
                            key={u.socketId}
                            className="text-xs text-white/60 bg-white/5 px-3 py-1 rounded-full"
                          >
                            {u.username}
                          </span>
                        ))}
                      {users.filter(
                        (u) =>
                          u.currentProduct === currentProduct.id &&
                          u.userId !== userId,
                      ).length === 0 && (
                        <span className="text-xs text-white/40">Only you</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-white/40">
                <Eye className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">No product selected</p>
                <p className="text-sm">
                  Browse the catalog and click "View Together"
                </p>
              </div>
            )}
          </div>

          {/* Chat / Cart - Right */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col h-[600px]">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => {
                  setShowChat(true);
                  setShowCart(false);
                }}
                className={`flex-1 py-4 text-sm font-semibold transition-all ${
                  showChat
                    ? "border-b-2 border-purple-500 text-purple-400"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Chat ({messages.length})
              </button>
              <button
                onClick={() => {
                  setShowChat(false);
                  setShowCart(true);
                }}
                className={`flex-1 py-4 text-sm font-semibold transition-all ${
                  showCart
                    ? "border-b-2 border-amber-500 text-amber-400"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Cart ({cartItems.length})
              </button>
            </div>

            {/* Chat View */}
            {showChat && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, idx) => {
                    const isCurrentUser = msg.userId === userId;
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                            isCurrentUser
                              ? "bg-gradient-to-r from-purple-500 to-amber-500 text-white"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-white/30 mt-1 px-2">
                          {msg.username} •{" "}
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                  {messages.length === 0 && (
                    <div className="text-center text-white/30 text-sm py-12">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-xs">
                        Say hello to your shopping buddies!
                      </p>
                    </div>
                  )}
                </div>
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-white/10 flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-purple-500 placeholder-white/30 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-amber-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Cart View */}
            {showCart && (
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center text-white/40 text-sm py-12">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Group cart is empty</p>
                    <p className="text-xs">Add items from the product view</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-14 h-14 object-contain bg-white/5 rounded-lg border border-white/10 p-1"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/50x50?text=No+Image";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-white/50">
                            ₹{item.price} × {item.quantity || 1}
                          </p>
                          <p className="text-[10px] text-white/30">
                            Added by {item.addedBy || "someone"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                Math.max(1, (item.quantity || 1) - 1),
                              )
                            }
                            className="w-7 h-7 bg-white/10 rounded-lg hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center text-sm transition-all"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold w-8 text-center text-white">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                (item.quantity || 1) + 1,
                              )
                            }
                            className="w-7 h-7 bg-white/10 rounded-lg hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center text-sm transition-all"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCollabCart(item.id)}
                            className="w-7 h-7 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 flex items-center justify-center text-sm transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Cart Summary */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Total</span>
                        <span className="text-xl font-bold text-amber-400">
                          ₹
                          {cartItems.reduce(
                            (sum, item) =>
                              sum + item.price * (item.quantity || 1),
                            0,
                          )}
                        </span>
                      </div>
                      <button className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-amber-500/25">
                        Checkout Group Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Others Viewing - Bottom Bar */}
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/40 mb-3 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            Others are viewing:
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {users
              .filter(
                (u) =>
                  u.currentProduct &&
                  u.currentProduct !== currentProduct?.id &&
                  u.userId !== userId,
              )
              .slice(0, 5)
              .map((user) => {
                const product = roomState?.products.find(
                  (p) => p.id === user.currentProduct,
                );
                if (!product) return null;
                return (
                  <button
                    key={user.socketId}
                    onClick={() => {
                      if (onProductSelect) {
                        onProductSelect(product);
                      }
                    }}
                    className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/50 transition-all group"
                  >
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-10 h-10 object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/40x40?text=No+Image";
                      }}
                    />
                    <div className="text-left">
                      <p className="text-xs font-medium text-white truncate max-w-[150px]">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-white/40">
                        👁️ {user.username}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white transition-all" />
                  </button>
                );
              })}
            {users.filter(
              (u) =>
                u.currentProduct &&
                u.currentProduct !== currentProduct?.id &&
                u.userId !== userId,
            ).length === 0 && (
              <p className="text-sm text-white/30">
                No one else is viewing a product
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
