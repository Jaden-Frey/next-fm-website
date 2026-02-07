"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function setRole(formData: FormData) {
const {sessionClaims} = await auth();

if(sessionClaims?.metadata?.role !== "admin") {
    throw new Error("Unauthorized");

}

const client = await clerkClient()
const id = formData.get("id") as string;
const role = formData.get("role") as string;

try {
  await client.users.updateUser(id, {
    publicMetadata: {
      role,
    },
  });
} catch (error) {
  throw new Error("Failed to set role");
}

}

export async function removeRole(formData: FormData) {
  const { sessionClaims } = await auth();

  // Check if the user is an admin before allowing them to remove a role
  if (sessionClaims?.metadata?.role !== "admin") {
    throw new Error("Not Authorized");
  }

  const client = await clerkClient();
  const id = formData.get("id") as string;

  try {
    await client.users.updateUser(id, {
      publicMetadata: { role: null },
    });
    revalidatePath("/admin"); // Revalidate the admin page to reflect changes
  } catch {
    throw new Error("Failed to remove role");
  }
}