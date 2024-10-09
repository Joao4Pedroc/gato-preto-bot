import {
  ChatInputCommandInteraction,
  Client,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayer,
  VoiceConnection,
  DiscordGatewayAdapterCreator,
  getVoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import path from "path";
import fs from "fs";
import { icrementServerMeowCount } from "./handleGlobalMiaw";
import {
  eventoComum,
  eventoEpico,
  eventoLendario,
  eventoRaro,
  getRandomEvent,
} from "../cat game/Helpers/meawEvent";

let meowIntervals: { [guildId: string]: NodeJS.Timeout } = {};
let isFirstMeow: { [guildId: string]: boolean } = {};
let voiceConnections: { [guildId: string]: VoiceConnection } = {};
let audioPlayers: { [guildId: string]: AudioPlayer } = {};
let previusMeow: string;

export async function handleMeow(
  interaction: ChatInputCommandInteraction,
  client: Client
) {
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
      playImmediateMeow(guildId, nothing, interaction, client);

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
      startMeowing(
        guildId,
        player,
        connection,
        voiceChannel,
        interaction,
        client
      );

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
  voiceChannel: VoiceChannel,
  interaction: ChatInputCommandInteraction,
  client: Client
) {
  // Se já existe um intervalo para este servidor, não cria outro
  if (meowIntervals[guildId]) return;

  // Marca que é o primeiro miado
  isFirstMeow[guildId] = true;

  // Toca o primeiro miado imediatamente
  playMeow(guildId, player, interaction, client);

  // Monitorar o canal de voz para sair quando não houver mais usuários
  monitorVoiceChannel(connection, guildId, voiceChannel);
}

async function playMeow(
  guildId: string,
  player: AudioPlayer,
  interaction: ChatInputCommandInteraction,
  client: Client
) {
  let audioFilePath: string | null;
  let event;

  if (isFirstMeow[guildId]) {
    // Toca o meow-1.mp3 no primeiro miado
    audioFilePath = path.join(process.cwd(), "public", "sound", "meow-1.mp3");
    isFirstMeow[guildId] = false; // Atualiza para indicar que o primeiro miado já ocorreu
  } else {
    event = getRandomEvent();
    // Toca um miado aleatório
    audioFilePath = getRandomMeowFilePath();
    icrementServerMeowCount(guildId, interaction);

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

  const channel = getCurrentVoiceChannel(guildId, client);

  if (!channel) {
    return;
  }

  const membersInVoice = [
    ...channel.members.filter((member) => !member.user.bot).values(),
  ];

  switch (event) {
    case "common":
      await eventoComum(interaction, membersInVoice);
      break;
    case "rare":
      await eventoRaro(interaction, membersInVoice);
      break;
    case "epic":
      await eventoEpico(interaction, membersInVoice);
      break;
    case "legendary":
      await eventoLendario(interaction, membersInVoice);
      break;
    default:
      break;
  }

  // Agendar o próximo miado
  scheduleNextMeow(guildId, player, interaction, client);
}

function scheduleNextMeow(
  guildId: string,
  player: AudioPlayer,
  interaction: ChatInputCommandInteraction,
  client: Client
) {
  // Definir o próximo intervalo
  const minIntervalSec = 60; // segundos
  const maxIntervalSec = 300; // segundos

  const nextInterval =
    Math.floor(
      Math.random() * (maxIntervalSec - minIntervalSec + 1) + minIntervalSec
    ) * 1000;

  meowIntervals[guildId] = setTimeout(() => {
    playMeow(guildId, player, interaction, client);
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
function playImmediateMeow(
  guildId: string,
  secret: string | null,
  interaction: ChatInputCommandInteraction,
  client: Client
) {
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
  scheduleNextMeow(guildId, player, interaction, client);
}

function getCurrentVoiceChannel(
  guildId: string,
  client: Client
): VoiceChannel | null {
  const connection: VoiceConnection | undefined = getVoiceConnection(guildId);

  if (!connection) {
    console.log(
      `O bot não está conectado a nenhum canal de voz no servidor com ID ${guildId}.`
    );
    return null;
  }

  // Verifica se a conexão está ativa
  if (connection.state.status !== VoiceConnectionStatus.Ready) {
    console.log(`A conexão de voz no servidor ${guildId} não está pronta.`);
    return null;
  }

  // Obtém o channelId a partir da conexão
  const channelId = connection.joinConfig.channelId;

  if (!channelId) {
    console.log(`Canal de voz não encontrado na configuração da conexão.`);
    return null;
  }

  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    console.log(`Servidor com ID ${guildId} não encontrado.`);
    return null;
  }

  const channel = guild.channels.cache.get(channelId);

  if (!channel || !channel.isVoiceBased()) {
    console.log(`Canal com ID ${channelId} não é um canal de voz válido.`);
    return null;
  }

  return channel as VoiceChannel;
}
