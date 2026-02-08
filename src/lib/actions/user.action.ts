"use server";

import User from "../models/user.model";
import { connect } from "../mongodb";

export async function createUser(user: any) {

    try {
        await connect();
        const newUser = await User.create(user);
        return JSON.parse(JSON.stringify(newUser));

    } catch (error) {
        console.error(error);
    }
}

export async function updateUser(clerkId: string, user: any) {
    try {
        await connect();
        const updatedUser = await User.findOneAndUpdate(
            { clerkId },
            user,
            { new: true }
        );
        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        console.error("Error updating user:", error);
    }
}

export async function deleteUser(clerkId: string) {
    try {
        await connect();
        const deletedUser = await User.findOneAndDelete({ clerkId });
        return JSON.parse(JSON.stringify(deletedUser));
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}