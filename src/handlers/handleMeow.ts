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
import fs from "fs";

let meowIntervals: { [guildId: string]: NodeJS.Timeout } = {};
let isFirstMeow: { [guildId: string]: boolean } = {};

export async function handleMeow(interaction: ChatInputCommandInteraction) {
  const voiceChannel = (interaction.member as any).voice
    .channel as VoiceChannel;
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

  // Marca que é o primeiro miado
  isFirstMeow[guildId] = true;

  const playMeow = () => {
    let audioFilePath: string;

    if (isFirstMeow[guildId]) {
      // Toca o meow-1.mp3 no primeiro miado
      audioFilePath = path.join(process.cwd(), "public", "sound", "meow-1.mp3");
      isFirstMeow[guildId] = false; // Atualiza para indicar que o primeiro miado já ocorreu
    } else {
      // Toca um miado aleatório nos subsequentes
      const soundDir = path.join(process.cwd(), "public", "sound");
      const files = fs.readdirSync(soundDir);

      // Filtrar apenas arquivos de áudio relevantes
      const meowFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return (
          [".mp3", ".wav", ".ogg"].includes(ext) && file.startsWith("meow-")
        );
      });

      if (meowFiles.length === 0) {
        console.error(
          "Nenhum arquivo de miado encontrado na pasta public/sound."
        );
        return;
      }

      // Remover 'meow-1.mp3' da lista
      const filteredMeowFiles = meowFiles.filter(
        (file) => file !== "meow-1.mp3"
      );

      if (filteredMeowFiles.length === 0) {
        console.error(
          "Nenhum arquivo de miado adicional encontrado para tocar aleatoriamente."
        );
        return;
      }

      // Escolher um arquivo aleatório
      const randomIndex = Math.floor(Math.random() * filteredMeowFiles.length);
      const randomMeow = filteredMeowFiles[randomIndex];

      audioFilePath = path.join(soundDir, randomMeow);
    }

    // Cria o recurso de áudio com controle de volume habilitado
    const resource = createAudioResource(audioFilePath, {
      inlineVolume: true,
    });

    // Tocar a 50% do volume
    resource.volume?.setVolume(0.5);

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
      delete isFirstMeow[guildId];
      connection.destroy();
      console.log(`Bot saiu do canal de voz no servidor ${guildId}`);
    }
  }, 10000); // Verifica a cada 5 segundos
}
