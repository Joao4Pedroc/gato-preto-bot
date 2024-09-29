import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import { ChatInputCommandInteraction } from "discord.js";
import path from "path";

export async function handleMeow(interaction: ChatInputCommandInteraction) {
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

    // Caminho atualizado para o arquivo de áudio
    const resource = createAudioResource(
      path.join(process.cwd(), "public", "sound", "meow.mp3")
    );

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      //connection.destroy();
    });

    await interaction.editReply("salve galerinha gato preto aq!! Meow! 😺");
  } catch (error) {
    console.error(error);
    await interaction.editReply(
      "Ocorreu um erro ao tentar executar o comando."
    );
  }
}
