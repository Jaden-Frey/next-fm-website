import User from "../models/user.model";
import { connect } from "../mongodb/mongoose";

export const createOrUpdateUser = async (
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
  username
) => {
  try {
    await connect();

    console.log("Creating/updating user with ID:", id);

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          clerkId: id,
          firstName: first_name,
          lastName: last_name,
          avatar: image_url,
          email: email_addresses[0].email_address,
          username: username || email_addresses[0].email_address.split("@")[0],
        },
      },
      { new: true, upsert: true }
    );

    console.log("User created/updated successfully:", user);
    return user;
  } catch (error) {
    console.error("Error creating or updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await connect();
    
    console.log("Deleting user with ID:", id);
    const result = await User.findOneAndDelete({ clerkId: id });
    console.log("User deleted:", result);
    
    return result;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};