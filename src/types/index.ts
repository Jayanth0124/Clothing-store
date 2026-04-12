export type Category = 'Formal' | 'Bomber' | 'Sporty' | 'Casual';

export interface Product {
  id: string; 
  name: string;
  type: Category;
  price: number;
  original_price?: number; 
  image: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
  colorImages?: { [key: string]: string[] };
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  variantId: string; 
}