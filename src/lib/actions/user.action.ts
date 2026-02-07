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