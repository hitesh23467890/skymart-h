// src/pages/DesignerHub.tsx
import React, { useState, useEffect } from "react";
import {
  Palette,
  Heart,
  Eye,
  User,
  Search,
  Grid3x3,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  Users,
  PlusCircle,
  MessageCircle,
  Star,
  Crown,
  Leaf,
  Zap,
  X,
  ArrowLeft,
} from "lucide-react";
import { useDesigner } from "../hooks/useDesigner";
import { Design } from "../types";
import { DesignCard } from "../components/DesignCard";
import { DesignDetailModal } from "../components/DesignDetailModal";
import { PostDesign } from "./PostDesign";

const categories = [
  { id: "all", label: "All Designs", icon: Grid3x3 },
  { id: "fashion", label: "Fashion", icon: Palette },
  { id: "accessories", label: "Accessories", icon: Sparkles },
  { id: "footwear", label: "Footwear", icon: Zap },
  { id: "jewelry", label: "Jewelry", icon: Crown },
  { id: "textile", label: "Textile", icon: Leaf },
];

const sortOptions = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "popular", label: "Popular", icon: TrendingUp },
  { id: "mostLiked", label: "Most Liked", icon: Heart },
  { id: "mostViewed", label: "Most Viewed", icon: Eye },
];

export function DesignerHub() {
  const {
    designs,
    designer,
    isLoading,
    toggleLike,
    addComment,
    incrementView,
    deleteDesign,
    getFilteredDesigns,
  } = useDesigner();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateCards(true), 200);
  }, []);

  const filteredDesigns = getFilteredDesigns({
    category: selectedCategory,
    search: searchQuery,
    sortBy: sortBy as any,
  });

  const featuredDesigns = designs.filter((d) => d.status === "featured");
  const pendingDesigns = designs.filter((d) => d.status === "pending");
  const totalLikes = designs.reduce((acc, d) => acc + d.likes, 0);

  const handleDesignClick = (design: Design) => {
    incrementView(design.id);
    setSelectedDesign(design);
    setShowDetailModal(true);
  };

  if (showPostModal) {
    return <PostDesign onClose={() => setShowPostModal(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20">
      {/* Natural Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        ></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden px-6 pt-12 pb-8 md:pt-16 md:pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-transparent to-rose-600/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-400/5 rounded-full filter blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-rose-500/20 rounded-xl">
                  <Palette className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-amber-600/80 tracking-wider uppercase">
                  Designer Community
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-light text-stone-800">
                Fashion Designer<span className="text-amber-600">.</span>Hub
              </h1>
              <p className="text-stone-500 mt-2 max-w-lg text-sm leading-relaxed">
                Discover emerging talent, share your designs, and connect with
                the SkyMart fashion community.
              </p>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post Your Design
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-stone-200/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-600">
                <Palette className="w-5 h-5" />
                <span className="text-2xl font-serif font-light">
                  {designs.length}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">Total Designs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-rose-500">
                <Heart className="w-5 h-5" />
                <span className="text-2xl font-serif font-light">
                  {totalLikes}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">Total Likes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <Sparkles className="w-5 h-5" />
                <span className="text-2xl font-serif font-light">
                  {featuredDesigns.length}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">Featured Designs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <Award className="w-5 h-5" />
                <span className="text-2xl font-serif font-light">
                  {pendingDesigns.length}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">Pending Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25"
                      : "bg-white/50 text-stone-600 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/60 rounded-full text-sm text-stone-700 placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <div className="flex gap-1 bg-white/50 backdrop-blur-sm border border-white/60 rounded-full p-1">
              {sortOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`p-2 rounded-full transition-all ${
                      sortBy === opt.id
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                        : "text-stone-400 hover:text-stone-600"
                    }`}
                    title={opt.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            <div className="flex gap-1 bg-white/50 backdrop-blur-sm border border-white/60 rounded-full p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-full transition-all ${
                  viewMode === "grid"
                    ? "bg-stone-200 text-stone-700"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-full transition-all ${
                  viewMode === "list"
                    ? "bg-stone-200 text-stone-700"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-500">Loading designs...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-20">
            <Palette className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-stone-600">
              No designs found
            </h3>
            <p className="text-stone-400 mt-2">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => setShowPostModal(true)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
            >
              Be the first to post!
            </button>
          </div>
        ) : (
          <div
            className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
          >
            {filteredDesigns.map((design, index) => (
              <div
                key={design.id}
                className={`transition-all duration-500 ${
                  animateCards
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <DesignCard
                  design={design}
                  onLike={() => toggleLike(design.id)}
                  onClick={() => handleDesignClick(design)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Design Detail Modal */}
      {showDetailModal && selectedDesign && (
        <DesignDetailModal
          design={selectedDesign}
          onClose={() => setShowDetailModal(false)}
          onLike={() => toggleLike(selectedDesign.id)}
          onComment={(content) => addComment(selectedDesign.id, content)}
          onDelete={() => {
            deleteDesign(selectedDesign.id);
            setShowDetailModal(false);
          }}
        />
      )}
    </div>
  );
}
