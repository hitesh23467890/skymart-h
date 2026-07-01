// src/components/DesignCard.tsx
import React from "react";
import { Heart, Eye, MessageCircle, Star, Clock } from "lucide-react";
import { Design } from "../types";

interface DesignCardProps {
  design: Design;
  onLike: () => void;
  onClick: () => void;
}

export function DesignCard({ design, onLike, onClick }: DesignCardProps) {
  return (
    <div
      className="group bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl overflow-hidden shadow-lg shadow-stone-200/20 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={design.images[0]}
          alt={design.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/600x400?text=No+Image";
          }}
        />
        {design.images.length > 1 && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
            +{design.images.length - 1} more
          </div>
        )}
        {design.status === "featured" && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3" />
            Featured
          </div>
        )}
        {design.status === "pending" && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-amber-400/80 to-amber-500/80 text-white text-xs font-medium rounded-full backdrop-blur-sm flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Review
          </div>
        )}
        {/* Designer Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg">
            <img
              src={design.designerAvatar}
              alt={design.designerName}
              className="w-8 h-8 rounded-full object-cover border-2 border-amber-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/40x40?text=User";
              }}
            />
            <div>
              <p className="text-sm font-medium text-stone-700">
                {design.designerName}
              </p>
              <p className="text-xs text-stone-400 capitalize">
                {design.category}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg text-stone-800 mb-1 line-clamp-1">
          {design.title}
        </h3>
        <p className="text-sm text-stone-500 line-clamp-2">
          {design.description}
        </p>

        {/* Tags */}
        {design.tags && design.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {design.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-stone-100/80 rounded-full text-xs text-stone-500"
              >
                #{tag}
              </span>
            ))}
            {design.tags.length > 3 && (
              <span className="px-2.5 py-1 bg-stone-100/80 rounded-full text-xs text-stone-500">
                +{design.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className={`flex items-center gap-1.5 transition-all hover:scale-105 ${
              design.isLiked
                ? "text-rose-500"
                : "text-stone-400 hover:text-rose-500"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${design.isLiked ? "fill-rose-500" : ""}`}
            />
            <span className="text-sm font-medium">{design.likes}</span>
          </button>
          <button
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {design.comments?.length || 0}
            </span>
          </button>
          <div className="flex items-center gap-1.5 text-stone-400 ml-auto">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">{design.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
