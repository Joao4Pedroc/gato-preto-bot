import { CacheType, Client, CommandInteraction } from "discord.js";
import fs from "fs";

interface Reminder {
  user: string;
  remindAt: number;
  message: string;
}

const remindMePath = "./backend/remindMe.json";
const CHECK_INTERVAL = 60 * 1000;

export async function handleRemindMe(
  interaction: CommandInteraction<CacheType>
) {
  const time = interaction.options.get("time")?.value as string; // Get the time argument
  const message =
    (interaction.options.get("message")?.value as string) || "miaaau!"; // Optional message
  console.log(time);
  console.log(message);

  // Parse the time or timestamp into a valid Date object
  const remindAt = calculateRemindTime(time);
  console.log(remindAt);

  if (!remindAt) {
    await interaction.reply(
      "Invalid time format. Please provide a valid time."
    );
    return;
  }

  // Store the reminder data in a JSON file

  const reminders = JSON.parse(fs.readFileSync(remindMePath, "utf-8"));

  reminders.push({
    user: interaction.user.id,
    remindAt: remindAt.getTime(),
    message: message,
  });

  fs.writeFileSync(remindMePath, JSON.stringify(reminders, null, 2));

  await interaction.reply(`Miaaw, vou te mandar mensagem em ${time}.`);
}

// Function to check reminders and send them if it's time
export async function checkReminders(client: Client) {
  if (!fs.existsSync(remindMePath)) return;

  const reminders = JSON.parse(fs.readFileSync(remindMePath, "utf-8"));
  const now = Date.now();

  // Filter out reminders that need to be sent
  const dueReminders = reminders.filter(
    (reminder: Reminder) => reminder.remindAt <= now
  );

  // Send the reminders
  for (const reminder of dueReminders) {
    try {
      // Fetch the user by ID and send the reminder message
      const user = await client.users.fetch(reminder.user);
      if (user) {
        await user.send(reminder.message);
        console.log(`Reminder sent to ${user.tag}: ${reminder.message}`);
      }
    } catch (error) {
      console.error(
        `Could not send reminder to user ID ${reminder.user}:`,
        error
      );
    }
  }

  // Remove sent reminders
  const updatedReminders = reminders.filter(
    (reminder: Reminder) => reminder.remindAt > now
  );
  fs.writeFileSync(remindMePath, JSON.stringify(updatedReminders, null, 2));
}

// Start the interval to check reminders
export function startReminderInterval(client: Client) {
  setInterval(() => checkReminders(client), CHECK_INTERVAL);
}

function calculateRemindTime(time: string): Date | null {
  // Parse time in a similar way as before
  const now = new Date();

  if (time.endsWith("s")) {
    const seconds = parseInt(time.slice(0, -1));
    now.setSeconds(now.getSeconds() + seconds);
  } else if (time.endsWith("m")) {
    const minutes = parseInt(time.slice(0, -1));
    now.setMinutes(now.getMinutes() + minutes);
  } else if (time.endsWith("h")) {
    const hours = parseInt(time.slice(0, -1));
    now.setHours(now.getHours() + hours);
  } else {
    const timestamp = Date.parse(time);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
    return null;
  }

  return now;
}
