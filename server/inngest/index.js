import { Inngest } from "inngest";
import User from "./../models/user.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "social-media-app" });

const SyncUserCreation = inngest.createFunction(
  { id: "sync-user-creation-from-clerk-to-mongodb" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const email = email_addresses?.[0]?.email_address ?? "";
    let username = email.split("@")[0] || `user_${id}`;

    const existing = await User.findOne({ username });
    if (existing) {
      username = `${username}${Math.floor(Math.random() * 10000)}`;
    }

    const userData = {
      _id: id,
      email,
      full_name: first_name + " " + last_name,
      profile_picture: image_url || "",
      username,
    };

    await User.create(userData);
  }
);

const SyncUserUpdation = inngest.createFunction(
    { id: "sync-user-uption-from-clerk-to-mongodb" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      
  
      const updatedUserData = {
        email: email_addresses?.[0]?.email_address ?? "",
        full_name: first_name + " " + last_name,
        profile_picture: image_url || "",
      };
  
      await User.findByIdAndUpdate(id, updatedUserData);
    }
);

const SyncUserDeletion = inngest.createFunction(
    { id: "sync-user-deletion-from-clerk-to-mongodb" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
      const { id } = event.data;
      await User.findByIdAndDelete(id);
    }
);

export const functions = [SyncUserCreation, SyncUserUpdation, SyncUserDeletion];