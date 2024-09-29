import { ChatInputCommandInteraction, VoiceChannel } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
} from "@discordjs/voice";
import path from "path";

let meowIntervals: { [guildId: string]: NodeJS.Timeout } = {};

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

    connection.subscribe(player);

    // Inicia o processo de tocar o som periodicamente
    startMeowing(interaction.guildId!, player, connection, voiceChannel);

    await interaction.editReply("O gato entrou na call! 😺");
  } catch (error) {
    console.error(error);
    await interaction.editReply(
      "Ocorreu um erro ao tentar executar o comando."
    );
  }
}

function startMeowing(
  guildId: string,
  player: AudioPlayer,
  connection: VoiceConnection,
  voiceChannel: VoiceChannel
) {
  // Se já existe um intervalo para este servidor, não cria outro
  if (meowIntervals[guildId]) return;

  const playMeow = () => {
    const resource = createAudioResource(
      path.join(process.cwd(), "public", "sound", "meow.mp3")
    );
    player.play(resource);

    // Definir o próximo intervalo entre 1 e 5 minutos
    const nextInterval =
      Math.floor(Math.random() * (5 - 1 + 1) + 1) * 60 * 1000;
    meowIntervals[guildId] = setTimeout(playMeow, nextInterval);
  };

  // Toca o primeiro miado imediatamente
  playMeow();

  // Monitorar o canal de voz para sair quando não houver mais usuários
  monitorVoiceChannel(connection, guildId, voiceChannel);
}

function monitorVoiceChannel(
  connection: VoiceConnection,
  guildId: string,
  voiceChannel: VoiceChannel
) {
  const checkInterval = setInterval(() => {
    if (voiceChannel && voiceChannel.members.size === 1) {
      // Apenas o bot está no canal
      clearInterval(checkInterval);
      clearTimeout(meowIntervals[guildId]);
      delete meowIntervals[guildId];
      connection.destroy();
      console.log(`Bot saiu do canal de voz no servidor ${guildId}`);
    }
  }, 100000); // Verifica a cada 5 segundos
}
