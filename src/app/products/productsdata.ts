
export interface Product {
  id: number;
  category: 'beef' | 'pork' | 'chicken' | 'lamb';
  name: string;
  sku: string;
  price: number;
  originalPrice?: number;
  onSale: boolean;
  image: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
}

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/222/fff?text=Coming+Soon';

export const productsData: Product[] = [
  {
    id: 1,
    category: 'beef',
    name: 'Ribeye Steak',
    sku: 'BEEF-001',
    price: 285,
    originalPrice: 320,
    onSale: true,
    image: '/images/BEEF-001.png', 
    description: 'Premium grain-fed ribeye steak with exceptional marbling. Cut to perfection at 2.5cm thickness.'
  },
  {
    id: 2,
    category: 'beef',
    name: 'T-Bone Steak',
    sku: 'BEEF-002',
    price: 245,
    onSale: false,
    image: '/images/BEEF-002.png', 
    description: 'Classic T-Bone combining the best of both worlds - tender filet on one side, flavorful strip on the other.'
  },
  // ... (Include the rest of your placeholder items here)
  {
     id: 3, category: 'beef', name: 'Sirloin Steak', sku: 'BEEF-003', price: 195,
     originalPrice: 220, onSale: true, image: PLACEHOLDER_IMG, description: 'Lean and flavorful sirloin steak.'
  },
  // ... keep all other items as you had them ...
];

export const categories: Category[] = [
  { id: 'all', name: 'All Products' },
  { id: 'beef', name: 'Beef' },
  { id: 'pork', name: 'Pork' },
  { id: 'chicken', name: 'Chicken' },
  { id: 'lamb', name: 'Lamb' }
];