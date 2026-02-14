import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product",
    required: true
  },
  name: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const CartSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    index: true 
  },
  guestId: { 
    type: String, 
    index: true
  },
  items: [CartItemSchema],
  totalAmount: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);