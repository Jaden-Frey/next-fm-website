import {Schema, model, models} from 'mongoose';
import { unique } from 'next/dist/build/utils';

const UserSchema = new Schema({
    clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true, 
  },
  firstName: {
    type: String,
    default: '', 
  },
  lastName: {
    type: String,
    default: '', 
  },
  photo: {
    type: String,
    default: 'https://via.placeholder.com/150', 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

});

const User = models?.User || model("User", UserSchema);

export default User;