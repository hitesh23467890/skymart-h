/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "../types";

export const imageMappingBank: Record<string, string> = {
  Smartphone:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
  "Wireless Earbuds":
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
  "Smart Watch":
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
  "Mechanical Keyboard":
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80",
  "Denim Jacket":
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80",
  "Leather Boots":
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&q=80",
  "Air Fryer":
    "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500&q=80",
  "Coffee Maker":
    "https://images.unsplash.com/photo-1517914103301-477038e0787e?w=500&q=80",
  "Sci-Fi Thriller":
    "https://images.unsplash.com/photo-1614849963640-9cc74b2a826f?w=500&q=80",
  "Biography Collection":
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80",
};

export const mockCategories: Record<string, string[]> = {
  Electronics: [
    "Smartphone",
    "Wireless Earbuds",
    "Smart Watch",
    "Mechanical Keyboard",
  ],
  Fashion: ["Denim Jacket", "Leather Boots"],
  "Home & Kitchen": ["Air Fryer", "Coffee Maker"],
  Books: ["Sci-Fi Thriller", "Biography Collection"],
};

export const generateProducts = (): Product[] => {
  const products: Product[] = [];
  let assignedId = 1;

  Object.keys(mockCategories).forEach((category) => {
    const models = mockCategories[category];
    // Create 8 items per category
    for (let i = 1; i <= 8; i++) {
      const defaultModel = models[(i - 1) % models.length];
      products.push({
        id: assignedId,
        name: `Studio Edition ${defaultModel} X${i}`,
        brand: [
          "Nordic Studio",
          "Atelier Craft",
          "Apex Precision",
          "Vogue Arc",
        ][i % 4],
        category,
        price: [499, 1299, 2499, 399, 899, 199, 3499, 1799][(i - 1) % 8],
        img: imageMappingBank[defaultModel],
        description: `Engineered strictly for peak tactile responsiveness and structural elegance. Featuring balanced weight metrics that fit comfortably within both formal environments and personal curation sets.`,
        discount_price: null,
        is_new: true,
        is_best_seller: false,
        rating: 4.5,
        reviews_count: 0,
        sizes: [],
        colors: [],
        short_description: `Premium ${category} product`,
        in_stock: true,
        is_featured: i % 2 === 0,
        slug: `studio-edition-${defaultModel.toLowerCase().replace(/\s/g, "-")}-x${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      assignedId++;
    }
  });

  return products;
};

// Export the generated products pool
export const datasetProductsPool: Product[] = generateProducts();
