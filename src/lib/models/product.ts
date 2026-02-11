import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  category: { type: String, required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  onSale: { type: Boolean, default: false },
  image: { type: String, required: true }, 
  description: { type: String, required: true },
}, { timestamps: true });

const Product = models.Product || model('Product', ProductSchema);

export default Product;