import { CommandInteraction } from "discord.js";
import fs from "fs";
import path from "path";

interface serverMeowCounts {
  [guildId: string]: number;
}

let dataFilePath = path.join(__dirname, "../backend/serverMeowCounts.json");

let serverMeowCounts: serverMeowCounts = {}; // guildId: count

export async function handleGlobalMeow(interaction: CommandInteraction) {
  // Salva os dados
  saveServerMeowCounts();
  // Carrega os dados
  loadServerMeowCounts();

  // Verifica se há dados para exibir
  const guildIds = Object.keys(serverMeowCounts);
  if (guildIds.length === 0) {
    await interaction.reply("Nenhum miado registrado ainda.");
    return;
  }

  // Cria uma lista de servidores e suas contagens
  const serverCountsArray = guildIds.map((guildId) => {
    const count = serverMeowCounts[guildId];
    const guild = interaction.client.guilds.cache.get(guildId);
    const guildName = guild ? guild.name : `Servidor desconhecido (${guildId})`;
    return { guildName, count };
  });

  // Ordena a lista em ordem decrescente de miados
  serverCountsArray.sort((a, b) => b.count - a.count);

  // Monta a mensagem
  let message = "🏆 **Ranking de Miados entre Servidores** 🏆\n\n";
  serverCountsArray.forEach((entry, index) => {
    message += `${index + 1}. **${entry.guildName}**: ${entry.count} miados\n`;
  });

  // Envia a mensagem
  await interaction.reply(message);
}

// Função para carregar os dados
function loadServerMeowCounts() {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, "utf-8");
    serverMeowCounts = JSON.parse(data);
  }
}

// Função para salvar os dados
function saveServerMeowCounts() {
  fs.writeFileSync(dataFilePath, JSON.stringify(serverMeowCounts, null, 2));
}

export function icrementServerMeowCount(guildId: string) {
  if (!serverMeowCounts[guildId]) {
    serverMeowCounts[guildId] = 0;
  }
  serverMeowCounts[guildId] += 1;
  saveServerMeowCounts();
}
