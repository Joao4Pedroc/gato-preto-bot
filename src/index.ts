import { Client, GatewayIntentBits, Partials } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  generateDependencyReport,
} from "@discordjs/voice";
import path from "path";
import { config } from "dotenv";
import { handleRandomGatoPreto } from "./handlers/handleRandomGatoPreto";
import { handleMeow } from "./handlers/handleMeow";
import { handleMessage } from "./handlers/handleMessage";
import { channel } from "diagnostics_channel";
import {
  checkReminders,
  handleRemindMe,
  startReminderInterval,
} from "./handlers/handleRemindMe";
import { createInvitesForAllServers } from "./handlers/handleInvite";

config();

console.log(generateDependencyReport());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.login(`${process.env.DISCORD_TOKEN}`);

client.on("ready", () => {
  console.log(`Bot conectado como ${client.user?.tag}`);

  // Verificar e enviar lembretes ao iniciar
  checkReminders(client);

  // Iniciar o intervalo para verificar lembretes periodicamente
  startReminderInterval(client);

  //createInvitesForAllServers(client);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "meow") {
    handleMeow(interaction);
  } else if (interaction.commandName === "random-gato-preto") {
    await handleRandomGatoPreto(interaction);
  } else if (interaction.commandName === "remindme") {
    handleRemindMe(interaction);
  }
});

client.on("messageCreate", (message) => {
  console.log(message.content);
  handleMessage(message);
});
