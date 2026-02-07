import { Webhook } from "svix";
import { headers } from "next/headers";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET is not set in environment variables');
    return new Response('Server configuration error', { status: 500 });
  }

  // Get the headers - await in Next.js 15+
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return new Response('Error occurred -- no svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the payload with the headers
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred - invalid signature', { status: 400 });
  }

  // Handle the event
  const { id } = evt?.data;
  const eventType = evt?.type;
  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, first_name, last_name, image_url, email_addresses, username } = evt?.data;

    try {
      await createOrUpdateUser(
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        username
      );
      console.log(`User ${eventType === "user.created" ? "created" : "updated"} successfully:`, id);
      return new Response('User is created or updated', { status: 200 });
    } catch (error) {
      console.error('Error creating or updating user:', error);
      return new Response('Error occurred', { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt?.data;

    try {
      await deleteUser(id);
      console.log('User deleted successfully:', id);
      return new Response('User is deleted', { status: 200 });
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error occurred', { status: 500 });
    }
  }

  // Return success for unhandled event types
  console.log('Unhandled event type:', eventType);
  return new Response('Webhook received', { status: 200 });
}