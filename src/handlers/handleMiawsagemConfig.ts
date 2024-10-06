import { ChannelType, CommandInteraction, TextChannel } from "discord.js";
import path from "path";
import fs from "fs";

interface GuildSettings {
  [guildId: string]: {
    guildId: string;
    channelId: string;
  };
}

const SETTINGS_FILE = path.join(__dirname, "../../backend/config.json");
let guildSettings: GuildSettings = {};

export async function handleMiawsagemConfig(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({
      content: "Este comando só pode ser usado em um servidor.",
      ephemeral: true,
    });
    return;
  }

  const canalOption = interaction.options.get("canal");

  // Verifica se a opção é de fato um canal de texto
  if (!canalOption || canalOption.channel?.type !== ChannelType.GuildText) {
    await interaction.reply({
      content: "Por favor, selecione um canal de texto válido.",
      ephemeral: true,
    });
    return;
  }

  const canal = canalOption.channel as TextChannel;

  // Salva o canal nas configurações
  setGuildChannel(interaction.guild.id, canal.id);

  await interaction.reply({
    content: `Canal configurado com sucesso! As mensagens anônimas serão enviadas no canal ${canal}.`,
    ephemeral: true,
  });
}

// Carrega as configurações do arquivo ao iniciar
export function loadSettings() {
  if (fs.existsSync(SETTINGS_FILE)) {
    const data = fs.readFileSync(SETTINGS_FILE, "utf8");
    try {
      guildSettings = JSON.parse(data);
    } catch (error) {
      console.error("Erro ao parsear config.json:", error);
      guildSettings = {};
    }
  } else {
    // Se o arquivo não existir, cria um arquivo vazio
    saveSettings();
  }
}

// Salva as configurações no arquivo
function saveSettings() {
  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify(guildSettings, null, 2),
    "utf8"
  );
}

// Função para configurar o canal de uma guilda
export function setGuildChannel(guildId: string, channelId: string) {
  if (!guildSettings[guildId]) {
    guildSettings[guildId] = { guildId, channelId };
  } else {
    guildSettings[guildId].channelId = channelId;
  }
  saveSettings();
}

// Função para obter o canal configurado de uma guilda
export function getGuildChannel(guildId: string): string | undefined {
  return guildSettings[guildId]?.channelId;
}

// Carrega as configurações ao iniciar
loadSettings();
