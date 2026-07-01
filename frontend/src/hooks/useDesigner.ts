// src/hooks/useDesigner.ts
import { useState, useEffect, useCallback } from "react";
import { Design, Designer, Comment } from "../types";
import {
  getStoredDesigns,
  saveDesigns,
  getCurrentDesigner,
  saveCurrentDesigner,
  getDefaultDesigner,
  getCurrentUserId,
  getInitialDesigns,
} from "../utils/designerStorage";

export function useDesigner() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      // Load designer
      let currentDesigner = getCurrentDesigner();
      if (!currentDesigner) {
        currentDesigner = getDefaultDesigner();
        saveCurrentDesigner(currentDesigner);
      }
      setDesigner(currentDesigner);

      // Load designs
      let allDesigns = getStoredDesigns();
      if (allDesigns.length === 0) {
        allDesigns = getInitialDesigns();
        saveDesigns(allDesigns);
      }

      // Update like status
      const userId = getCurrentUserId();
      allDesigns = allDesigns.map((d) => ({
        ...d,
        isLiked: d.likedBy?.includes(userId) || false,
      }));

      setDesigns(allDesigns);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================
  // CRUD OPERATIONS
  // ============================================================

  const addDesign = useCallback(
    (
      newDesign: Omit<
        Design,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "likes"
        | "likedBy"
        | "comments"
        | "views"
        | "isLiked"
      >,
    ) => {
      const userId = getCurrentUserId();
      const user = getCurrentDesigner();

      const design: Design = {
        ...newDesign,
        id: "design_" + Date.now(),
        likes: 0,
        likedBy: [],
        comments: [],
        views: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLiked: false,
        designerId: userId,
        designerName: user?.name || "Anonymous Designer",
        designerAvatar: user?.avatar || getDefaultDesigner().avatar,
        designerBio: user?.bio || "",
      };

      const updatedDesigns = [design, ...designs];
      setDesigns(updatedDesigns);
      saveDesigns(updatedDesigns);

      // Update designer's designs
      if (user) {
        const updatedUser = {
          ...user,
          designs: [design, ...(user.designs || [])],
        };
        saveCurrentDesigner(updatedUser);
        setDesigner(updatedUser);
      }

      return design;
    },
    [designs],
  );

  const deleteDesign = useCallback(
    (designId: string) => {
      if (!window.confirm("Are you sure you want to delete this design?"))
        return;
      const updatedDesigns = designs.filter((d) => d.id !== designId);
      setDesigns(updatedDesigns);
      saveDesigns(updatedDesigns);
    },
    [designs],
  );

  const updateDesign = useCallback(
    (designId: string, updates: Partial<Design>) => {
      const updatedDesigns = designs.map((d) => {
        if (d.id === designId) {
          return { ...d, ...updates, updatedAt: new Date().toISOString() };
        }
        return d;
      });
      setDesigns(updatedDesigns);
      saveDesigns(updatedDesigns);
    },
    [designs],
  );

  const toggleLike = useCallback(
    (designId: string) => {
      const userId = getCurrentUserId();
      const updatedDesigns = designs.map((d) => {
        if (d.id === designId) {
          const isLiked = d.likedBy?.includes(userId) || false;
          const updatedLikedBy = isLiked
            ? d.likedBy.filter((id) => id !== userId)
            : [...(d.likedBy || []), userId];
          return {
            ...d,
            likedBy: updatedLikedBy,
            likes: isLiked ? d.likes - 1 : d.likes + 1,
            isLiked: !isLiked,
          };
        }
        return d;
      });
      setDesigns(updatedDesigns);
      saveDesigns(updatedDesigns);
    },
    [designs],
  );

  const addComment = useCallback(
    (designId: string, content: string) => {
      if (!content.trim()) return;

      const user = getCurrentDesigner();
      const userId = getCurrentUserId();

      const comment: Comment = {
        id: "comment_" + Date.now(),
        userId: userId,
        username: user?.name || "Anonymous",
        userAvatar: user?.avatar || getDefaultDesigner().avatar,
        content: content.trim(),
        likes: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedDesigns = designs.map((d) => {
        if (d.id === designId) {
          return {
            ...d,
            comments: [...(d.comments || []), comment],
          };
        }
        return d;
      });
      setDesigns(updatedDesigns);
      saveDesigns(updatedDesigns);
      return comment;
    },
    [designs],
  );

  const incrementView = useCallback(
    (designId: string) => {
      const updatedDesigns = designs.map((d) => {
        if (d.id === designId) {
          return { ...d, views: (d.views || 0) + 1 };
        }
        return d;
      });
      setDesigns(updatedDesigns);
      saveDesigns(updatedDesigns);
    },
    [designs],
  );

  const updateDesigner = useCallback(
    (updates: Partial<Designer>) => {
      if (!designer) return;
      const updatedDesigner = { ...designer, ...updates };
      saveCurrentDesigner(updatedDesigner);
      setDesigner(updatedDesigner);
    },
    [designer],
  );

  // ============================================================
  // FILTERING & SEARCH
  // ============================================================

  const getFilteredDesigns = useCallback(
    ({
      category = "all",
      search = "",
      sortBy = "latest",
      designerId,
    }: {
      category?: string;
      search?: string;
      sortBy?: "latest" | "popular" | "mostLiked" | "mostViewed";
      designerId?: string;
    }) => {
      let filtered = designs;

      // Filter by designer
      if (designerId) {
        filtered = filtered.filter((d) => d.designerId === designerId);
      }

      // Filter by category
      if (category !== "all") {
        filtered = filtered.filter((d) => d.category === category);
      }

      // Filter by search
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.title.toLowerCase().includes(query) ||
            d.designerName.toLowerCase().includes(query) ||
            d.description.toLowerCase().includes(query) ||
            d.tags?.some((tag) => tag.toLowerCase().includes(query)),
        );
      }

      // Sort
      switch (sortBy) {
        case "popular":
          filtered = [...filtered].sort(
            (a, b) => (b.views || 0) - (a.views || 0),
          );
          break;
        case "mostLiked":
          filtered = [...filtered].sort((a, b) => b.likes - a.likes);
          break;
        case "mostViewed":
          filtered = [...filtered].sort(
            (a, b) => (b.views || 0) - (a.views || 0),
          );
          break;
        default:
          filtered = [...filtered].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      }

      return filtered;
    },
    [designs],
  );

  return {
    designs,
    designer,
    isLoading,
    error,
    addDesign,
    deleteDesign,
    updateDesign,
    toggleLike,
    addComment,
    incrementView,
    updateDesigner,
    getFilteredDesigns,
    reload: loadData,
  };
}
