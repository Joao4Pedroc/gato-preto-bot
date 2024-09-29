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

config();

console.log(generateDependencyReport());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  partials: [Partials.Channel],
});

client.login(`${process.env.DISCORD_TOKEN}`);

client.on("ready", () => {
  console.log(`Bot conectado como ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "meow") {
    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      return interaction.reply(
        "Você precisa estar em um canal de voz para usar este comando!"
      );
    }

    const permissions = voiceChannel.permissionsFor(
      interaction.guild?.members.me!
    );
    if (!permissions?.has("Connect") || !permissions.has("Speak")) {
      return interaction.reply(
        "Eu preciso das permissões para entrar e falar no seu canal de voz!"
      );
    }

    await interaction.deferReply();

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();

      const resource = createAudioResource(path.join(__dirname, "meow.mp3"));

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      await interaction.editReply("Meow! 😺");
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "Ocorreu um erro ao tentar executar o comando."
      );
    }
  }
});
