import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true }, 
  publicId: { type: String, required: true }, 
  format: { type: String, required: true },
  size: { type: Number, required: true },
  folder: { type: String, default: '' },
  width: { type: Number },
  height: { type: Number }
}, {
  timestamps: true
});

export const Image = mongoose.models.Image || mongoose.model("Image", imageSchema);