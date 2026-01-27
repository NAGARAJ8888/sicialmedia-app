import { Inngest } from "inngest";
import User from "./../models/user.js";
import Connection from "../models/connection.js";
import sendEmail from "../config/nodeMailer.js";
import Story from "../models/story.js";

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
    { id: "sync-user-updation-from-clerk-to-mongodb" },
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

const sendConnectionRequestRemainder = inngest.createFunction(
  {id: "send-new-connection-request-reminder"},
  {event: "app/connection-request"},
  async ({ event, step }) =>{
    const {connectionId} = event.data;

    await step.run('send-connection-request-mail', async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id').populate('to_user_id');
      const subject = `👏 New Connection Request`;
      const body = `
        <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 24px;">
          <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0px 2px 8px rgba(0,0,0,0.07); overflow: hidden;">
            <div style="background: #4f8cff; color: #fff; padding: 20px 32px; font-size: 22px; font-weight: 600;">
              👏 New Connection Request
            </div>
            <div style="padding: 32px 32px 24px 32px; color: #333;">
              <p style="font-size:16px; margin-top: 0;">Hi <b>${connection.to_user_id?.full_name || "there"}</b>,</p>
              <p style="font-size:16px;">
                <b>${connection.from_user_id?.full_name || "A user"}</b> has sent you a connection request.
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL}/connections" style="background: #4f8cff; color: #fff; text-decoration: none; display: inline-block; border-radius: 5px; padding: 12px 30px; font-size: 16px; font-weight: 500;">
                  View Request
                </a>
              </div>
              <p style="font-size:13px; color:#888; margin-bottom: 0;">
                If you do not wish to act on this request, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      });
    });

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run('send-connection-request-reminder', async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id').populate('to_user_id');
      if(connection.status === "accepted"){
        return {message: "Already accepted"};
      }

      const subject = `👏 New Connection Request`;
      const body = `
        <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 24px;">
          <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0px 2px 8px rgba(0,0,0,0.07); overflow: hidden;">
            <div style="background: #4f8cff; color: #fff; padding: 20px 32px; font-size: 22px; font-weight: 600;">
              👏 New Connection Request
            </div>
            <div style="padding: 32px 32px 24px 32px; color: #333;">
              <p style="font-size:16px; margin-top: 0;">Hi <b>${connection.to_user_id?.full_name || "there"}</b>,</p>
              <p style="font-size:16px;">
                <b>${connection.from_user_id?.full_name || "A user"}</b> has sent you a connection request.
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.FRONTEND_URL}/connections" style="background: #4f8cff; color: #fff; text-decoration: none; display: inline-block; border-radius: 5px; padding: 12px 30px; font-size: 16px; font-weight: 500;">
                  View Request
                </a>
              </div>
              <p style="font-size:13px; color:#888; margin-bottom: 0;">
                If you do not wish to act on this request, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body
      });
      return {message: "Reminder sent."};
    });

  }
);

// Inngest Function to delete story after 24 hours/
const deleteStory = inngest.createFunction(
  {id: 'story-delete'},
  {event: 'app/story.delete'},
  async ({event, step}) => {
      const {storyId} = event.data;
      const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await step.sleepUntil('wait-for-24-hours', in24Hours)
      await step.run("delete-story", async () => {
        await Story.findByIdAndDelete(storyId)
        return {message: "Story deleted."}
      })
  }
);

const sendNotificationOfUnseenMessages = inngest.createFunction(
  {id: 'send-notification-of-unseen-messages'},
  {cron: 'TZ=America/New_York 0 9 * * *'},
  async ({step}) => {
    const messages = await Message.find({seen: false}).populate('from_user_id').populate('to_user_id');
    const unseenCount = {};

    messages.map(message => {
      unseenCount[message.to_user_id._id] = (unseenCount[message.to_user_id._id] || 0) + 1;
  })

  for(const userId in unseenCount){
    const user = await User.findById(userId);
    
    const subject = `👁️ You have ${unseenCount[userId]} unseen messages`;
    
    const body = `
             <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 24px;">
             <h2> Hi ${user.full_name || user.username},</h2>
             <p>You have ${unseenCount[userId]} unseen messages.</p>
             <a href="${process.env.FRONTEND_URL}/messages" style="background: #4f8cff; color: #fff; text-decoration: none; display: inline-block; border-radius: 5px; padding: 12px 30px; font-size: 16px; font-weight: 500;">
              View Messages 
             </a>
             <p>Thank you for using our app!</p>
             </div>
             `;

             await sendEmail({
              to: user.email,
              subject,
              body
             })
    
  }
  return {message: "Notification of unseen messages sent."}
});

// Export functions array - ensure all functions are valid
export const functions = [
  SyncUserCreation, 
  SyncUserUpdation, 
  SyncUserDeletion, 
  sendConnectionRequestRemainder,
  deleteStory,
  sendNotificationOfUnseenMessages
];
