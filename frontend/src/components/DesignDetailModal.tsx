// src/components/DesignDetailModal.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  Eye,
  MessageCircle,
  X,
  Star,
  Clock,
  Trash2,
  Send,
  Share2,
  Bookmark,
  User,
  Calendar,
  Tag,
  Package,
  MapPin,
} from "lucide-react";
import { Design } from "../types";

interface DesignDetailModalProps {
  design: Design;
  onClose: () => void;
  onLike: () => void;
  onComment: (content: string) => void;
  onDelete: () => void;
}

export function DesignDetailModal({
  design,
  onClose,
  onLike,
  onComment,
  onDelete,
}: DesignDetailModalProps) {
  const [commentText, setCommentText] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(design.isLiked || false);
  const [likes, setLikes] = useState(design.likes);
  const [comments, setComments] = useState(design.comments || []);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <img
              src={design.designerAvatar}
              alt={design.designerName}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/40x40?text=User";
              }}
            />
            <div>
              <p className="font-medium text-stone-800">
                {design.designerName}
              </p>
              <p className="text-xs text-stone-400">
                {formatDate(design.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-colors"
              title="Delete design"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src={design.images[activeImage]}
                  alt={design.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/600x600?text=Image+Not+Available";
                  }}
                />
              </div>
              {design.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {design.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === index
                          ? "border-amber-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-serif text-stone-800">
                  {design.title}
                </h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="px-3 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs capitalize">
                    {design.category}
                  </span>
                  {design.status === "featured" && (
                    <span className="px-3 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-xs flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                  {design.status === "pending" && (
                    <span className="px-3 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                  {design.collection && (
                    <span className="px-3 py-0.5 bg-stone-100 text-stone-600 rounded-full text-xs">
                      {design.collection}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed">
                {design.description}
              </p>

              {design.materials && design.materials.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-stone-700 mb-1">
                    Materials
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {design.materials.map((material) => (
                      <span
                        key={material}
                        className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {design.tags && design.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-stone-700 mb-1">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {design.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {design.price && (
                <div className="bg-gradient-to-r from-amber-50 to-rose-50 p-4 rounded-xl">
                  <p className="text-sm text-stone-500">Price</p>
                  <p className="text-2xl font-bold text-stone-800">
                    ₹{design.price.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 py-3 border-t border-b border-stone-100">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-all hover:scale-105 ${
                    isLiked
                      ? "text-rose-500"
                      : "text-stone-400 hover:text-rose-500"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked ? "fill-rose-500" : ""}`}
                  />
                  <span className="font-medium">{likes}</span>
                </button>
                <div className="flex items-center gap-2 text-stone-400">
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">{design.views || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{comments.length}</span>
                </div>
              </div>

              {/* Comments */}
              <div>
                <p className="text-sm font-medium text-stone-700 mb-3">
                  Comments ({comments.length})
                </p>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.userAvatar}
                        alt={comment.username}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/32x32?text=User";
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-stone-700">
                          {comment.username}
                        </p>
                        <p className="text-sm text-stone-600">
                          {comment.content}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-stone-400 text-center py-4">
                      No comments yet
                    </p>
                  )}
                </div>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-stone-700"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
