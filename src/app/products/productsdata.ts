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
  grammage: string; 
}

export interface Category {
  id: string;
  name: string;
}

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/222/fff?text=Coming+Soon';

export const productsData: Product[] = [
  // --- BEEF ---
  {
    id: 1,
    category: 'beef',
    name: 'T-Bone Steak',
    sku: 'BEEF-001',
    price: 285,
    originalPrice: 320,
    onSale: true,
    image: '/images/BEEF-001.png',
    description: 'Classic T-Bone combining the best of both worlds.',
    grammage: '750g'
  },
  {
    id: 2,
    category: 'beef',
    name: 'Ribeye Steak',
    sku: 'BEEF-002',
    price: 245,
    onSale: false,
    image: '/images/BEEF-002.png',
    description: 'Premium grain-fed ribeye steak with exceptional marbling.',
    grammage: '300g'
  },
  {
    id: 3, 
    category: 'beef', 
    name: 'Lean Beef Mince', 
    sku: 'BEEF-003', 
    price: 220,
    onSale: false, 
    image: '/images/BEEF-003.png', 
    description: 'Premium lean ground beef, ideal for bolognese.',
    grammage: '1kg'
  },
  {
    id: 4, 
    category: 'beef', 
    name: 'Beef Ribs', 
    sku: 'BEEF-004', 
    price: 110,
    onSale: true, 
    image: '/images/BEEF-004.png', 
    description: 'Succulent beef short ribs, perfect for slow cooking.',
    grammage: '1kg'
  },
  {
    id: 5, 
    category: 'beef', 
    name: 'Beef Burger Patties', 
    sku: 'BEEF-005', 
    price: 130,
    onSale: false, 
    image: '/images/BEEF-005.png', 
    description: 'Thick, juicy handcrafted beef burger patties.',
    grammage: '4 x 150g'
  },

  // --- PORK ---
  {
    id: 6, 
    category: 'pork', 
    name: 'Pork Chops', 
    sku: 'PORK-001', 
    price: 145,
    onSale: true, 
    image: '/images/PORK-001.png', 
    description: 'Thick-cut pork chops.',
    grammage: '1kg'
  },
  {
    id: 7, 
    category: 'pork', 
    name: 'Pork Belly', 
    sku: 'PORK-002', 
    price: 185,
    onSale: false, 
    image: '/images/PORK-002.png', 
    description: 'Premium pork belly.',
    grammage: '1.2kg'
  },
  {
    id: 8, 
    category: 'pork', 
    name: 'Pork Ribs', 
    sku: 'PORK-003', 
    price: 195,
    onSale: true, 
    image: '/images/PORK-003.png', 
    description: 'Meaty spare ribs.',
    grammage: '1kg'
  },
  {
    id: 9, 
    category: 'pork', 
    name: 'Pork Loin', 
    sku: 'PORK-004', 
    price: 155,
    onSale: false, 
    image: '/images/PORK-004.png', 
    description: 'Lean and tender pork loin.',
    grammage: '1kg'
  },
  {
    id: 10, 
    category: 'pork', 
    name: 'Pork Sausages', 
    sku: 'PORK-005', 
    price: 95,
    onSale: true, 
    image: '/images/PORK-005.png', 
    description: 'Traditional pork sausages.',
    grammage: '500g'
  },

  // --- CHICKEN ---
  {
    id: 11, 
    category: 'chicken', 
    name: 'Whole Chicken', 
    sku: 'CHIC-005', 
    price: 135,
    onSale: false, 
    image: '/images/CHIC-005.png', 
    description: 'Free-range whole chicken.',
    grammage: '1.4kg'
  },
  {
    id: 12, 
    category: 'chicken', 
    name: 'Chicken Breasts', 
    sku: 'CHIC-002', 
    price: 115,
    onSale: true, 
    image: '/images/CHIC-002.png', 
    description: 'Skinless, boneless chicken breasts.',
    grammage: '1kg'
  },
  {
    id: 13, 
    category: 'chicken', 
    name: 'Chicken Thighs', 
    sku: 'CHIC-003', 
    price: 95,
    onSale: false, 
    image: '/images/CHIC-003.png', 
    description: 'Bone-in chicken thighs.',
    grammage: '1kg'
  },
  {
    id: 14, 
    category: 'chicken', 
    name: 'Chicken Wings', 
    sku: 'CHIC-004', 
    price: 85,
    onSale: true, 
    image: '/images/CHIC-004.png', 
    description: 'Fresh chicken wings.',
    grammage: '1kg'
  },
  {
    id: 15, 
    category: 'chicken', 
    name: 'Chicken Drumsticks', 
    sku: 'CHIC-001', 
    price: 75,
    onSale: false, 
    image: '/images/CHIC-001.png', 
    description: 'Juicy chicken drumsticks.',
    grammage: '1kg'
  },

  // --- LAMB ---
  {
    id: 16, 
    category: 'lamb', 
    name: 'Lamb Chops', 
    sku: 'LAMB-001', 
    price: 295,
    onSale: true, 
    image: '/images/LAMB-001.png', 
    description: 'Premium lamb loin chops.',
    grammage: '1kg'
  },
  {
    id: 17, 
    category: 'lamb', 
    name: 'Leg of Lamb', 
    sku: 'LAMB-002', 
    price: 385,
    onSale: false, 
    image: '/images/LAMB-002.png', 
    description: 'Whole leg of lamb.',
    grammage: '2.5kg'
  },
  {
    id: 18, 
    category: 'lamb', 
    name: 'Lamb Shoulder', 
    sku: 'LAMB-003', 
    price: 265,
    onSale: true, 
    image: '/images/LAMB-003.png', 
    description: 'Lamb shoulder perfect for slow roasting.',
    grammage: '1.8kg'
  },
  {
    id: 19, 
    category: 'lamb', 
    name: 'Lamb Rack', 
    sku: 'LAMB-004', 
    price: 425,
    onSale: false, 
    image: '/images/LAMB-004.png', 
    description: 'French-trimmed rack of lamb.',
    grammage: '800g'
  },
  {
    id: 20, 
    category: 'lamb', 
    name: 'Lamb Shanks', 
    sku: 'LAMB-005', 
    price: 235,
    onSale: false, 
    image: '/images/LAMB-005.png', 
    description: 'Meaty lamb shanks.',
    grammage: '2 x 400g'
  }
];

export const categories: Category[] = [
  { id: 'all', name: 'All Products' },
  { id: 'beef', name: 'Beef' },
  { id: 'pork', name: 'Pork' },
  { id: 'chicken', name: 'Chicken' },
  { id: 'lamb', name: 'Lamb' }
];