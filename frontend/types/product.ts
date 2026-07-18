export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  isBestSeller?: boolean;
  is_best_seller?: boolean;
  stock?: number;
  status?: string;
  warranty_months?: number;
  recommendation_reason?: string;
}
