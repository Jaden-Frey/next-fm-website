// Product type definition
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
  // --- BEEF (5 Items) ---
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
  {
    id: 3, 
    category: 'beef', 
    name: 'Lean Beef Mince', 
    sku: 'BEEF-003', 
    price: 220,
    onSale: false, 
    image: '/images/BEEF-003.png', 
    description: 'Premium lean ground beef, ideal for bolognese, lasagna, or homemade burgers.'
  },
  {
    id: 4, 
    category: 'beef', 
    name: 'Beef Ribs', 
    sku: 'BEEF-004', 
    price: 110,
    onSale: true, 
    image: '/images/BEEF-004.png', 
    description: 'Succulent beef short ribs, perfect for slow cooking or braising.'
  },
  {
    id: 5, 
    category: 'beef', 
    name: 'Beef Burger Patties', 
    sku: 'BEEF-005', 
    price: 130,
    onSale: false, 
    image: '/images/BEEF-005.png', 
    description: 'Thick, juicy handcrafted beef burger patties. Ready for the grill.'
  },

  // --- PORK ---
  {
    id: 6, category: 'pork', name: 'Pork Chops', sku: 'PORK-001', price: 145,
    onSale: true, image: PLACEHOLDER_IMG, description: 'Thick-cut pork chops.'
  },
  {
    id: 7, category: 'pork', name: 'Pork Belly', sku: 'PORK-002', price: 185,
    onSale: false, image: PLACEHOLDER_IMG, description: 'Premium pork belly.'
  },
  {
    id: 8, category: 'pork', name: 'Pork Ribs', sku: 'PORK-003', price: 195,
    onSale: true, image: PLACEHOLDER_IMG, description: 'Meaty spare ribs.'
  },
  {
    id: 9, category: 'pork', name: 'Pork Loin', sku: 'PORK-004', price: 155,
    onSale: false, image: PLACEHOLDER_IMG, description: 'Lean and tender pork loin.'
  },
  {
    id: 10, category: 'pork', name: 'Pork Sausages', sku: 'PORK-006', price: 95,
    onSale: true, image: PLACEHOLDER_IMG, description: 'Traditional pork sausages.'
  },

  // --- CHICKEN ---
  {
    id: 11, category: 'chicken', name: 'Whole Chicken', sku: 'CHIC-001', price: 135,
    onSale: false, image: PLACEHOLDER_IMG, description: 'Free-range whole chicken.'
  },
  {
    id: 12, category: 'chicken', name: 'Chicken Breasts', sku: 'CHIC-002', price: 115,
    onSale: true, image: PLACEHOLDER_IMG, description: 'Skinless, boneless chicken breasts.'
  },
  {
    id: 13, category: 'chicken', name: 'Chicken Thighs', sku: 'CHIC-003', price: 95,
    onSale: false, image: PLACEHOLDER_IMG, description: 'Bone-in chicken thighs.'
  },
  {
    id: 14, category: 'chicken', name: 'Chicken Wings', sku: 'CHIC-004', price: 85,
    onSale: true, image: PLACEHOLDER_IMG, description: 'Fresh chicken wings.'
  },
  {
    id: 15, category: 'chicken', name: 'Chicken Drumsticks', sku: 'CHIC-005', price: 75,
    onSale: false, image: PLACEHOLDER_IMG, description: 'Juicy chicken drumsticks.'
  },

  // --- LAMB ---
  {
    id: 16, category: 'lamb', name: 'Lamb Chops', sku: 'LAMB-001', price: 295,
    onSale: true, image: PLACEHOLDER_IMG, description: 'Premium lamb loin chops.'
  },
  {
    id: 17, category: 'lamb', name: 'Leg of Lamb', sku: 'LAMB-002', price: 385,
    onSale: false, image: PLACEHOLDER_IMG, description: 'Whole leg of lamb.'
  },
  {
    id: 18, category: 'lamb', name: 'Lamb Shoulder', sku: 'LAMB-003', price: 265,
    onSale: true, image: PLACEHOLDER_IMG, description: 'Lamb shoulder perfect for slow roasting.'
  },
  {
    id: 19, category: 'lamb', name: 'Lamb Rack', sku: 'LAMB-004', price: 425,
    onSale: false, image: PLACEHOLDER_IMG, description: 'French-trimmed rack of lamb.'
  },
  {
    id: 20, category: 'lamb', name: 'Lamb Shanks', sku: 'LAMB-005', price: 235,
    onSale: false, image: PLACEHOLDER_IMG, description: 'Meaty lamb shanks.'
  }
];

export const categories: Category[] = [
  { id: 'all', name: 'All Products' },
  { id: 'beef', name: 'Beef' },
  { id: 'pork', name: 'Pork' },
  { id: 'chicken', name: 'Chicken' },
  { id: 'lamb', name: 'Lamb' }
];