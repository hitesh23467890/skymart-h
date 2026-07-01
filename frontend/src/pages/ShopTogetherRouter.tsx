// src/pages/ShopTogetherRouter.tsx
import React from "react";
import { ShopTogetherPage } from "./ShopTogetherPage";

interface ShopTogetherRouterProps {
  currentProduct?: any;
  userId: string;
  username: string;
  onProductSelect?: (product: any) => void;
  onClose?: () => void;
}

export function ShopTogetherRouter({
  currentProduct,
  userId,
  username,
  onProductSelect,
  onClose,
}: ShopTogetherRouterProps) {
  return (
    <ShopTogetherPage
      currentProduct={currentProduct}
      userId={userId}
      username={username}
      onProductSelect={onProductSelect}
      onClose={onClose}
    />
  );
}
