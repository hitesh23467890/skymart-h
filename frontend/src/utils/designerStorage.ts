// src/utils/designerStorage.ts
import { Design, Designer, Comment } from "../types";

const DESIGNS_KEY = "skymart_designs";
const DESIGNER_KEY = "skymart_designer";
const USER_ID_KEY = "designer_user_id";

// ============================================================
// USER ID
// ============================================================

export const getCurrentUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId =
      "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

// ============================================================
// DESIGNS
// ============================================================

export const getStoredDesigns = (): Design[] => {
  try {
    const stored = localStorage.getItem(DESIGNS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const userId = getCurrentUserId();
      return parsed.map((d: any) => ({
        ...d,
        comments: d.comments || [],
        likedBy: d.likedBy || [],
        isLiked: d.likedBy?.includes(userId) || false,
      }));
    }
  } catch (e) {
    console.error("Error loading designs:", e);
  }
  return [];
};

export const saveDesigns = (designs: Design[]) => {
  try {
    localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs));
  } catch (e) {
    console.error("Error saving designs:", e);
  }
};

export const getDesignById = (id: string): Design | null => {
  const designs = getStoredDesigns();
  return designs.find((d) => d.id === id) || null;
};

export const getDesignsByDesigner = (designerId: string): Design[] => {
  const designs = getStoredDesigns();
  return designs.filter((d) => d.designerId === designerId);
};

// ============================================================
// DESIGNER
// ============================================================

export const getCurrentDesigner = (): Designer | null => {
  try {
    const stored = localStorage.getItem(DESIGNER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading designer:", e);
  }
  return null;
};

export const saveCurrentDesigner = (designer: Designer) => {
  try {
    localStorage.setItem(DESIGNER_KEY, JSON.stringify(designer));
  } catch (e) {
    console.error("Error saving designer:", e);
  }
};

export const getDefaultDesigner = (): Designer => ({
  id: getCurrentUserId(),
  name: "Your Name",
  email: "designer@skymart.com",
  avatar:
    "https://images.unsplash.com/photo-1494790108370-be9e1195e6d7?w=100&h=100&fit=crop",
  bio: "Fashion enthusiast sharing my creative journey. Let's make the world more beautiful together.",
  specialty: ["Fashion Design", "Textile Art"],
  location: "India",
  experience: "2 years",
  designs: [],
  followers: 0,
  following: 0,
  joinedDate: new Date().toISOString(),
  isVerified: false,
});

// ============================================================
// INITIAL DESIGNS (for first-time users)
// ============================================================

export const getInitialDesigns = (): Design[] => {
  return [
    {
      id: "1",
      designerId: "d1",
      designerName: "Ananya Sharma",
      designerAvatar:
        "https://images.unsplash.com/photo-1494790108370-be9e1195e6d7?w=100&h=100&fit=crop",
      designerBio: "Fashion designer specializing in sustainable textiles",
      title: "Ethereal Silk Saree Collection",
      description:
        "A modern take on traditional silk sarees with hand-painted botanical motifs. Each piece tells a story of nature and elegance.",
      category: "fashion",
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=400&fit=crop",
      ],
      tags: ["silk", "handpainted", "traditional", "elegant"],
      likes: 234,
      likedBy: [],
      comments: [],
      views: 1234,
      status: "featured",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      isPublic: true,
      price: 15000,
      materials: ["Silk", "Natural Dyes"],
      collection: "Botanical Dreams",
      isLiked: false,
    },
    {
      id: "2",
      designerId: "d2",
      designerName: "Rahul Mehta",
      designerAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      designerBio: "Sustainable fashion advocate",
      title: "Minimalist Denim Revolution",
      description:
        "Sustainable denim designs with zero-waste construction techniques. Comfort meets responsibility.",
      category: "fashion",
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556905072-8c1b9e9b9b3a?w=600&h=400&fit=crop",
      ],
      tags: ["sustainable", "denim", "zero-waste"],
      likes: 567,
      likedBy: [],
      comments: [],
      views: 2456,
      status: "featured",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      isPublic: true,
      price: 8999,
      materials: ["Recycled Denim", "Organic Cotton"],
      collection: "Urban Minimal",
      isLiked: false,
    },
    {
      id: "3",
      designerId: "d3",
      designerName: "Priya Patel",
      designerAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      designerBio: "Textile artist and weaver",
      title: "Handwoven Textile Art",
      description:
        "Traditional weaving techniques meet contemporary design aesthetics. Each piece is a unique work of art.",
      category: "textile",
      images: [
        "https://images.unsplash.com/photo-1589752739503-a43c50087cec?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=600&h=400&fit=crop",
      ],
      tags: ["handwoven", "textile", "traditional", "art"],
      likes: 89,
      likedBy: [],
      comments: [],
      views: 567,
      status: "approved",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      isPublic: true,
      price: 25000,
      materials: ["Cotton", "Natural Dyes", "Silk"],
      collection: "Heritage Weaves",
      isLiked: false,
    },
  ];
};
