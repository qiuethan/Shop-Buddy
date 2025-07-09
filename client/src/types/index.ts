// Product related types
export interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  link: string;
  source: string;
  rating?: number;
  reviews?: number;
  linkType?: string;
  searchSource?: string;
}

export interface EmbeddedProduct {
  id: string;
  productIndex: number;
  product: Product;
  context: string;
  alternatives?: Product[];
}

// Categorized products
export interface CategorizedProducts {
  [category: string]: Product[];
}

// Search summary
export interface SearchSummary {
  totalSearches: number;
  categoriesFound: number;
  productsRecommended: number;
  alternativesAvailable: number;
  aiRecommendedSearches: number;
}

// Solution related types
export interface Solution {
  text: string;
  embeddedProducts: EmbeddedProduct[];
}

export interface SearchResult {
  keywords: string;
  solution: Solution;
  products: Product[];
  categorizedProducts: CategorizedProducts;
  alternativeProducts: Product[];
  totalFound: number;
  categories: string[];
  searchSummary: SearchSummary;
}

// API related types
export interface ApiError {
  error: string;
  details?: string;
  timestamp?: string;
}

export interface HealthCheck {
  status: string;
  service: string;
  timestamp: string;
  dependencies: {
    openai: boolean;
    serpapi: boolean;
  };
}

// Form related types
export interface Store {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Location {
  name: string;
  code: string;
}

export interface SearchFormData {
  problem: string;
  stores: string[];
  maxPrice: string;
  location: string;
}

// Component prop types
export interface SearchFormProps {
  onSearch: (problem: string, stores: string[], maxPrice: string, location: string) => void;
  loading: boolean;
}

export interface SolutionDisplayProps {
  solution: Solution;
  totalFound: number;
}

export interface ProductCardProps {
  product: Product;
  isEmbedded?: boolean;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export interface ErrorMessageProps {
  message: string;
  details?: string;
  onRetry?: () => void;
} 