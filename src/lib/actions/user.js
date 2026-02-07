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

    console.log("Creating/updating user:", id);

    // SAFEGUARDS: Handle missing data gracefully
    const primaryEmail = email_addresses && email_addresses.length > 0 
      ? email_addresses[0].email_address 
      : "";

    // If username is null (common in Clerk), fallback to part of the email
    const safeUsername = username || (primaryEmail ? primaryEmail.split("@")[0] : "user");

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name || "Unknown",
          lastName: last_name || "Unknown",
          avatar: image_url,
          email: primaryEmail,
          username: safeUsername,
        },
      },
      { new: true, upsert: true } // Create if doesn't exist
    );

    console.log("Database updated successfully");
    return user;
  } catch (error) {
    console.error("Error in createOrUpdateUser:", error);
    throw error; // This causes the webhook to fail (which is good, so Clerk retries)
  }
};

export const deleteUser = async (id) => {
  try {
    await connect();
    await User.findOneAndDelete({ clerkId: id });
    console.log("User deleted from DB");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};