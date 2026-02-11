import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  guestId: { type: String, required: true, unique: true },
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product" 
  }]
}, { timestamps: true });

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);