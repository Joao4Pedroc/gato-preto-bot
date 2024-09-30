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
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "meow") {
    handleMeow(interaction);
  } else if (interaction.commandName === "random-gato-preto") {
    await handleRandomGatoPreto(interaction);
  }
});

client.on("messageCreate", (message) => {
  console.log(message.content);
  handleMessage(message);
});
