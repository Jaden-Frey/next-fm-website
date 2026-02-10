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

export const productsData: Product[] = [
  // BEEF (5 Items)
  {
    id: 1,
    category: 'beef',
    name: 'Ribeye Steak',
    sku: 'BEEF-001',
    price: 285,
    originalPrice: 320,
    onSale: true,
    // Raw ribeye steak on a board
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop',
    description: 'Premium grain-fed ribeye steak with exceptional marbling. Cut to perfection at 2.5cm thickness.'
  },
  {
    id: 2,
    category: 'beef',
    name: 'T-Bone Steak',
    sku: 'BEEF-002',
    price: 245,
    onSale: false,
    // Raw T-Bone/Porterhouse
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    description: 'Classic T-Bone combining the best of both worlds - tender filet on one side, flavorful strip on the other.'
  },
  {
    id: 3,
    category: 'beef',
    name: 'Sirloin Steak',
    sku: 'BEEF-003',
    price: 195,
    originalPrice: 220,
    onSale: true,
    // Raw beef steak slice
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=2070&auto=format&fit=crop',
    description: 'Lean and flavorful sirloin steak. An excellent choice for health-conscious meat lovers.'
  },
  {
    id: 4,
    category: 'beef',
    name: 'Beef Fillet',
    sku: 'BEEF-004',
    price: 380,
    onSale: false,
    // Raw tenderloin/fillet piece
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2070&auto=format&fit=crop',
    description: 'The most tender cut of beef. Melt-in-your-mouth texture with a delicate flavor.'
  },
  {
    id: 5,
    category: 'beef',
    name: 'Rump Steak',
    sku: 'BEEF-005',
    price: 165,
    onSale: false,
    // Raw steak slab
    image: 'https://images.unsplash.com/photo-1504185945330-dd4fa29c4792?q=80&w=2070&auto=format&fit=crop',
    description: 'Flavorful and versatile rump steak. Great for grilling, pan-frying, or slicing thin for stir-fries.'
  },

  // PORK (5 Items)
  {
    id: 6,
    category: 'pork',
    name: 'Pork Chops',
    sku: 'PORK-001',
    price: 145,
    originalPrice: 165,
    onSale: true,
    // Raw pork meat/chops
    image: 'https://images.unsplash.com/photo-1628268909376-e8c42bb81592?q=80&w=2070&auto=format&fit=crop',
    description: 'Thick-cut pork chops with the perfect fat-to-meat ratio. Juicy and tender.'
  },
  {
    id: 7,
    category: 'pork',
    name: 'Pork Belly',
    sku: 'PORK-002',
    price: 185,
    onSale: false,
    // Raw pork belly slices
    image: 'https://images.unsplash.com/photo-1589189709282-3e284a1a5b82?q=80&w=2070&auto=format&fit=crop',
    description: 'Premium pork belly with beautiful layering of meat and fat. Perfect for crispy roasting.'
  },
  {
    id: 8,
    category: 'pork',
    name: 'Pork Ribs',
    sku: 'PORK-003',
    price: 195,
    originalPrice: 225,
    onSale: true,
    // Raw ribs
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop',
    description: 'Meaty spare ribs ideal for BBQ, smoking, or oven-roasting. Fall-off-the-bone tender.'
  },
  {
    id: 9,
    category: 'pork',
    name: 'Pork Loin',
    sku: 'PORK-004',
    price: 155,
    onSale: false,
    // Raw pork roast/loin
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?q=80&w=2070&auto=format&fit=crop',
    description: 'Lean and tender pork loin roast. Versatile cut perfect for roasting whole.'
  },
  {
    id: 10,
    category: 'pork',
    name: 'Pork Sausages',
    sku: 'PORK-006',
    price: 95,
    originalPrice: 110,
    onSale: true,
    // Raw sausages
    image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?q=80&w=2070&auto=format&fit=crop',
    description: 'Traditional pork sausages made with premium cuts and our signature blend of herbs and spices.'
  },

  // CHICKEN (5 Items)
  {
    id: 11,
    category: 'chicken',
    name: 'Whole Chicken',
    sku: 'CHIC-001',
    price: 135,
    onSale: false,
    // Raw whole chicken
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?q=80&w=2070&auto=format&fit=crop',
    description: 'Free-range whole chicken, perfect for roasting. Approximately 1.8-2kg.'
  },
  {
    id: 12,
    category: 'chicken',
    name: 'Chicken Breasts',
    sku: 'CHIC-002',
    price: 115,
    originalPrice: 130,
    onSale: true,
    // Raw chicken breast
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=2070&auto=format&fit=crop',
    description: 'Skinless, boneless chicken breasts. Lean protein perfect for healthy meals.'
  },
  {
    id: 13,
    category: 'chicken',
    name: 'Chicken Thighs',
    sku: 'CHIC-003',
    price: 95,
    onSale: false,
    // Raw chicken pieces (thighs/legs)
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=2070&auto=format&fit=crop',
    description: 'Bone-in chicken thighs with skin. More flavorful and juicier than breast meat.'
  },
  {
    id: 14,
    category: 'chicken',
    name: 'Chicken Wings',
    sku: 'CHIC-004',
    price: 85,
    originalPrice: 95,
    onSale: true,
    // Raw chicken wings
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=2080&auto=format&fit=crop',
    description: 'Fresh chicken wings perfect for your favorite wing recipes. Great for grilling, frying, or baking.'
  },
  {
    id: 15,
    category: 'chicken',
    name: 'Chicken Drumsticks',
    sku: 'CHIC-005',
    price: 75,
    onSale: false,
    // Raw drumsticks
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=2070&auto=format&fit=crop',
    description: 'Juicy chicken drumsticks loved by kids and adults alike. Easy to cook and full of flavor.'
  },

  // LAMB (5 Items)
  {
    id: 16,
    category: 'lamb',
    name: 'Lamb Chops',
    sku: 'LAMB-001',
    price: 295,
    originalPrice: 340,
    onSale: true,
    // Raw lamb chops
    image: 'https://images.unsplash.com/photo-1619780236006-32e39545d816?q=80&w=2074&auto=format&fit=crop',
    description: 'Premium lamb loin chops cut to perfection. Tender, juicy, and full of flavor.'
  },
  {
    id: 17,
    category: 'lamb',
    name: 'Leg of Lamb',
    sku: 'LAMB-002',
    price: 385,
    onSale: false,
    // Raw leg of lamb (roast)
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=2070&auto=format&fit=crop',
    description: 'Whole leg of lamb, bone-in for maximum flavor. Perfect centerpiece for family gatherings.'
  },
  {
    id: 18,
    category: 'lamb',
    name: 'Lamb Shoulder',
    sku: 'LAMB-003',
    price: 265,
    originalPrice: 290,
    onSale: true,
    // Raw lamb meat block
    image: 'https://images.unsplash.com/photo-1607623488235-e2e6b8ea0171?q=80&w=2070&auto=format&fit=crop',
    description: 'Lamb shoulder perfect for slow roasting or braising. Rich, deep flavor.'
  },
  {
    id: 19,
    category: 'lamb',
    name: 'Lamb Rack',
    sku: 'LAMB-004',
    price: 425,
    onSale: false,
    // Raw rack of lamb
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop',
    description: 'French-trimmed rack of lamb. The ultimate in elegance and flavor.'
  },
  {
    id: 20,
    category: 'lamb',
    name: 'Lamb Shanks',
    sku: 'LAMB-005',
    price: 235,
    onSale: false,
    // Raw lamb shanks (using a meat/bone image)
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=2070&auto=format&fit=crop',
    description: 'Meaty lamb shanks ideal for braising and slow cooking. Fall-off-the-bone tender.'
  }
];

export const categories: Category[] = [
  { id: 'all', name: 'All Products' },
  { id: 'beef', name: 'Beef' },
  { id: 'pork', name: 'Pork' },
  { id: 'chicken', name: 'Chicken' },
  { id: 'lamb', name: 'Lamb' }
];