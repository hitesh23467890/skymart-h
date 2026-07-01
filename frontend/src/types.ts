// src/types.ts

// ============================================================
// PAGE ENUM
// ============================================================
export enum Page {
  Landing = "LANDING",
  Login = "LOGIN",
  Register = "REGISTER",
  Forgot = "FORGOT",
  ResetPassword = "RESET_PASSWORD",
  ProductCatalog = "PRODUCT_CATALOG",
  Wishlist = "WISHLIST",
  Cart = "CART",
  Dashboard = "DASHBOARD",
  DesignerHub = "DESIGNER_HUB",
  PostDesign = "POST_DESIGN",
  SkyCoins = "SKY_COINS",
}

// ============================================================
// PRODUCT TYPES
// ============================================================

// This matches your Django API response for products
export interface ProductAPI {
  id: number;
  name: string;
  slug: string;
  brand_id: number;
  category_id: number;
  price: number;
  discount_price: number | null;
  img: string;
  images: string | null;
  description: string;
  short_description: string;
  sizes: string | string[];
  colors: string | string[];
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  created_at: string;
  updated_at: string;
}

// This is what your frontend uses for products
export interface Product {
  id: number;
  name: string;
  brand: string; // Will be populated from brand_id
  category: string; // Will be populated from category_id
  price: number;
  discount_price?: number | null;
  img: string;
  description?: string;
  short_description?: string;
  sizes?: string | string[];
  colors?: string | string[];
  rating?: number;
  reviews_count?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  is_best_seller?: boolean;
  brand_id?: number; // For reference
  category_id?: number; // For reference
  slug?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// CATEGORY TYPES
// ============================================================

// Category hierarchy - matches your product_categories table
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  level: number;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  children?: Category[]; // For hierarchical display
}

// API Response for categories
export interface CategoryAPIResponse {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  level: number;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
}

// ============================================================
// BRAND TYPES
// ============================================================

// Brand - matches your store_brands table
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  category_id?: number;
  is_active?: boolean;
  created_at?: string;
}

// API Response for brands
export interface BrandAPIResponse {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  category_id?: number;
  is_active?: boolean;
  created_at?: string;
}

// ============================================================
// SHIPPING & ORDER TYPES
// ============================================================

export interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  lat?: number;
  lng?: number;
}

export interface PurchaseOrder {
  id: string;
  productId: number;
  productName: string;
  productPrice: number;
  productImg: string;
  productBrand: string;
  date: string;
  quantity: number;
  status: "Processing" | "In Transit" | "Out for Delivery" | "Delivered";
  trackingSteps: {
    title: string;
    desc: string;
    time: string;
    completed: boolean;
  }[];
  originCoordinates: { lat: number; lng: number; label: string };
  destinationCoordinates: { lat: number; lng: number; label: string };
}

// ============================================================
// NAVIGATION & FILTER TYPES
// ============================================================

// Helper type for navigation state
export interface NavigationState {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  selectedBrand: string | null;
  searchQuery: string;
  priceCap: number;
}

// Helper type for category with children
export interface CategoryNode extends Category {
  children: CategoryNode[];
}

// Helper type for building category hierarchy
export interface CategoryHierarchy {
  [key: number]: CategoryNode;
}

// Type for the category tree display
export interface CategoryTreeItem {
  category: Category;
  children: CategoryTreeItem[];
  isExpanded?: boolean;
  isSelected?: boolean;
  level: number;
}

// Type for filter state
export interface FilterState {
  categories: string[];
  subcategories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  inStock: boolean;
  rating: number;
}

// ============================================================
// DESIGNER HUB TYPES
// ============================================================

export interface Designer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  specialty: string[];
  location: string;
  experience: string;
  designs: Design[];
  followers: number;
  following: number;
  joinedDate: string;
  isVerified: boolean;
  website?: string;
  instagram?: string;
  portfolio?: string;
}

export interface Design {
  id: string;
  designerId: string;
  designerName: string;
  designerAvatar: string;
  designerBio?: string;
  title: string;
  description: string;
  category: "fashion" | "accessories" | "footwear" | "jewelry" | "textile";
  images: string[];
  sketchImages?: string[];
  tags: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  views: number;
  status: "pending" | "approved" | "featured" | "rejected";
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  price?: number;
  materials: string[];
  dimensions?: string;
  collection?: string;
  inspiration?: string;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface DesignFilter {
  category?: string;
  status?: string;
  sortBy?: "latest" | "popular" | "mostLiked" | "mostViewed";
  search?: string;
  designerId?: string;
}

// ============================================================
// SOCKET TYPES (for Shop Together feature)
// ============================================================

export interface RoomUser {
  socketId: string;
  username: string;
  userId: string;
  isActive: boolean;
  currentProduct: number | null;
}

export interface RoomState {
  users: RoomUser[];
  products: any[];
  messages: any[];
  selectedProduct: any | null;
  cart: any[];
  created_at: number;
}

export interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
  currentRoom: string | null;
  roomState: RoomState | null;
  joinRoom: (roomId: string, username: string, userId: string) => void;
  leaveRoom: () => void;
  viewProduct: (productId: number, product: any) => void;
  sendMessage: (message: string) => void;
  addToCollabCart: (productId: number, product: any) => void;
  removeFromCollabCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  users: RoomUser[];
  messages: any[];
  cartItems: any[];
}
