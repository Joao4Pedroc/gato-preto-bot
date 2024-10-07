import { ChatInputCommandInteraction, VoiceChannel } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayer,
  VoiceConnection,
  DiscordGatewayAdapterCreator,
} from "@discordjs/voice";
import path from "path";
import fs from "fs";

let meowIntervals: { [guildId: string]: NodeJS.Timeout } = {};
let isFirstMeow: { [guildId: string]: boolean } = {};
let voiceConnections: { [guildId: string]: VoiceConnection } = {};
let audioPlayers: { [guildId: string]: AudioPlayer } = {};
let previusMeow: string;

export async function handleMeow(interaction: ChatInputCommandInteraction) {
  const nothing = interaction.options.getString("nothing");

  const guildId = interaction.guildId!;
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
    if (voiceConnections[guildId]) {
      // O bot já está conectado no servidor
      // Toca um miado aleatório imediatamente e reinicia o timer
      playImmediateMeow(guildId, nothing);

      await interaction.editReply("Meoow😺");
    } else {
      // O bot não está conectado, conectar e iniciar o processo
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild
          .voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
      });

      const player = createAudioPlayer();

      connection.subscribe(player);

      // Armazenar a conexão e o player
      voiceConnections[guildId] = connection;
      audioPlayers[guildId] = player;

      // Inicia o processo de tocar o som periodicamente
      startMeowing(guildId, player, connection, voiceChannel);

      await interaction.editReply("O gato entrou na call! 😺");
    }
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

  // Toca o primeiro miado imediatamente
  playMeow(guildId, player);

  // Monitorar o canal de voz para sair quando não houver mais usuários
  monitorVoiceChannel(connection, guildId, voiceChannel);
}

function playMeow(guildId: string, player: AudioPlayer) {
  let audioFilePath: string | null;

  if (isFirstMeow[guildId]) {
    // Toca o meow-1.mp3 no primeiro miado
    audioFilePath = path.join(process.cwd(), "public", "sound", "meow-1.mp3");
    isFirstMeow[guildId] = false; // Atualiza para indicar que o primeiro miado já ocorreu
  } else {
    // Toca um miado aleatório
    audioFilePath = getRandomMeowFilePath();
    if (!audioFilePath) {
      console.log("audio file path null");
      return;
    }
  }
  previusMeow = audioFilePath;
  const resource = createAudioResource(audioFilePath, {
    inlineVolume: true,
  });
  resource.volume?.setVolume(0.5); // toca a 50% do volume
  player.play(resource);

  // Agendar o próximo miado
  scheduleNextMeow(guildId, player);
}

function scheduleNextMeow(guildId: string, player: AudioPlayer) {
  // Definir o próximo intervalo
  const minIntervalSec = 60; // segundos
  const maxIntervalSec = 300; // segundos

  const nextInterval =
    Math.floor(
      Math.random() * (maxIntervalSec - minIntervalSec + 1) + minIntervalSec
    ) * 1000;

  meowIntervals[guildId] = setTimeout(() => {
    playMeow(guildId, player);
  }, nextInterval);
}

function getRandomMeowFilePath(): string | null {
  const soundDir = path.join(process.cwd(), "public", "sound");
  const files = fs.readdirSync(soundDir);

  // Filtrar apenas arquivos de áudio relevantes
  const meowFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return [".mp3", ".wav", ".ogg"].includes(ext) && file.startsWith("meow-");
  });

  // Remover 'meow-1.mp3' da lista, se quiser evitar repetir o primeiro miado
  const filteredMeowFiles = meowFiles.filter((file) => file !== previusMeow);

  if (filteredMeowFiles.length === 0) {
    console.error(
      "Nenhum arquivo de miado adicional encontrado para tocar aleatoriamente."
    );
    return null;
  }

  // Escolher um arquivo aleatório
  const randomIndex = Math.floor(Math.random() * filteredMeowFiles.length);
  const randomMeow = filteredMeowFiles[randomIndex];

  return path.join(soundDir, randomMeow);
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

      // Limpar a conexão e o player
      delete voiceConnections[guildId];
      delete audioPlayers[guildId];

      console.log(`Bot saiu do canal de voz no servidor ${guildId}`);
    }
  }, 10000); // Verifica a cada X segundos
}

// toca meow aleatorio e reseta o timmer
function playImmediateMeow(guildId: string, secret: string | null) {
  const player = audioPlayers[guildId];

  if (!player) return;

  // Limpa o timer atual
  if (meowIntervals[guildId]) {
    clearTimeout(meowIntervals[guildId]);
  }
  let audioFilePath;
  // Toca um miado semi-aleatório
  if (secret === "8") {
    audioFilePath = path.join(process.cwd(), "public", "sound", "meow-8.mp3");
  } else {
    audioFilePath = getRandomMeowFilePath();
  }

  if (!audioFilePath) return;

  previusMeow = audioFilePath;

  const resource = createAudioResource(audioFilePath, {
    inlineVolume: true,
  });
  resource.volume?.setVolume(0.5);
  player.play(resource);

  // Reinicia o timer
  scheduleNextMeow(guildId, player);
}
