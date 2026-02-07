import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createOrUpdateUser, deleteUser } from "@/src/library/actions/user";

export async function POST(req: Request) {
  console.log("🎯 Webhook received!"); // ADD THIS

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ WEBHOOK_SECRET not found"); // ADD THIS
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing svix headers"); // ADD THIS
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("✅ Webhook verified successfully"); // ADD THIS
  } catch (err) {
    console.error("❌ Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;
  console.log(`📋 Event type: ${eventType}`); // ADD THIS
  console.log("📦 Event data:", JSON.stringify(evt.data, null, 2)); // ADD THIS

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, first_name, last_name, image_url, email_addresses, username } =
      evt.data as any;

    console.log("👤 Processing user:", { id, first_name, last_name }); // ADD THIS

    try {
      const user = await createOrUpdateUser(
        id as string,
        first_name as string,
        last_name as string,
        image_url as string,
        email_addresses as { email_address: string }[],
        username as string | undefined
      );

      console.log("✅ User created/updated in MongoDB:", user); // ADD THIS
      return new Response("User is created or updated", { status: 200 });
    } catch (error) {
      console.error("❌ Error creating or updating user:", error);
      return new Response("Error occured", {
        status: 400,
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data as any;
    console.log("🗑️ Deleting user:", id); // ADD THIS
    
    try {
      await deleteUser(id as string);
      console.log("✅ User deleted from MongoDB"); // ADD THIS
      return new Response("User is deleted", {
        status: 200,
      });
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      return new Response("Error occured", {
        status: 400,
      });
    }
  }

  return new Response("", { status: 200 });
}