import User from "../models/user.model";
import connect from "../mongodb/mongoose"; 

export const createOrUpdateUser = async (
  id: string,
  first_name: string,
  last_name: string,
  image_url: string,
  email_addresses: { email_address: string }[],
  username: string | undefined
) => {
  try {
    await connect(); 

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
      { upsert: true, new: true }
    );

    return user;
  } catch (error) {
    console.error("Error creating or updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
    try {
        await connect();
        await User.findOneAndDelete({ clerkId: id });
    } catch (error) {
        console.error("Error deleting user:", error);
    }

};