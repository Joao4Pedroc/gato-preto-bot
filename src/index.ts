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
import { handleMiawsagem } from "./handlers/handleMiawsagem";
import {
  handleMiawsagemConfig,
  loadSettings,
} from "./handlers/handleMiawsagemConfig";
import { cacheAllGuildMembers } from "./handlers/cacheMembers";

config();

console.log(generateDependencyReport());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
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

  //cacheAllGuildMembers(client, "365252818870992898");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "meow") {
    handleMeow(interaction);
  } else if (interaction.commandName === "random-gato-preto") {
    await handleRandomGatoPreto(interaction);
  } else if (interaction.commandName === "remindme") {
    handleRemindMe(interaction);
  } else if (interaction.commandName === "miawsagem-anônima") {
    loadSettings();

    handleMiawsagem(interaction);
  } else if ((interaction.commandName = "configurar-miawsagem")) {
    handleMiawsagemConfig(interaction);
  }
});

client.on("messageCreate", (message) => {
  console.log(message.content);
  handleMessage(message);
});
