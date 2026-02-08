import type { WebhookEvent } from "@clerk/nextjs/server"; // type-only import
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createUser, updateUser, deleteUser } from "../../../../lib/actions/user.action";

export const runtime = "nodejs"; // explicit runtime for webhook libraries that rely on node

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("Missing WEBHOOK_SECRET env var");
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  // Use the raw text body for signature verification
  const rawBody = await req.text();

  // Read headers from the incoming request
  const svix_id = req.headers.get("svix-id") ?? undefined;
  const svix_timestamp = req.headers.get("svix-timestamp") ?? undefined;
  const svix_signature = req.headers.get("svix-signature") ?? undefined;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.warn("Missing Svix headers:", { svix_id, svix_timestamp, svix_signature });
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  // Build headers object expected by svix.verify
  const headersObj: Record<string, string> = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    // verify returns the parsed event
    evt = wh.verify(rawBody, headersObj) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  // Now parse the body (safe because we've already verified it)
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // Some webhook senders already parsed; fallback to evt.data if needed
    payload = evt?.data ?? {};
  }

  // Basic logging
  console.log("Clerk webhook verified:", evt.type, "id:", evt.data?.id);

  // Handle specific event types
  if (evt.type === "user.created") {
    const { id: clerkId, email_addresses, image_url, first_name, last_name, username } = evt.data as any;

    const generatedUsername = username || (email_addresses[0]?.email_address.split('@')[0] + '_' + clerkId.slice(-6));

    const user = {
      clerkId,
      email: Array.isArray(email_addresses) && email_addresses[0]?.email_address
        ? email_addresses[0].email_address
        : undefined,
      username: generatedUsername, 
      firstName: first_name || '', 
      lastName: last_name || '',   
      photo: image_url || 'https://via.placeholder.com/150', 
    };

    try {
      const newUser = await createUser(user);
      return NextResponse.json({ message: "User created", user: newUser }, { status: 200 });
    } catch (err) {
      console.error("Error creating user from webhook:", err);
      return NextResponse.json({ error: "Error creating user" }, { status: 500 });
    }
  }


if (evt.type === "user.updated") {
  const { id: clerkId, email_addresses, image_url, first_name, last_name, username } = evt.data as any;
  const generatedUsername = username || (email_addresses[0]?.email_address.split('@')[0] + '_' + clerkId.slice(-6));
  const user = {
    email: Array.isArray(email_addresses) && email_addresses[0]?.email_address
      ? email_addresses[0].email_address
      : undefined,
    username: generatedUsername,
    firstName: first_name || '',
    lastName: last_name || '',
    photo: image_url || 'https://via.placeholder.com/150',
  };
  try {
    const updatedUser = await updateUser(clerkId, user);
    return NextResponse.json({ message: "User updated", user: updatedUser }, { status: 200 });
  } catch (err) {
    console.error("Error updating user from webhook:", err);
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

if (evt.type === "user.deleted") {
  const { id: clerkId } = evt.data as any;
  try {
    const deletedUser = await deleteUser(clerkId);
    return NextResponse.json({ message: "User deleted", user: deletedUser }, { status: 200 });
  } catch (err) {
    console.error("Error deleting user from webhook:", err);
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}

  return NextResponse.json({ message: "OK" }, { status: 200 });
}

export const __modulePresent = true;