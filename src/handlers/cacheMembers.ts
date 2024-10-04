import { Client, Guild } from "discord.js";

/**
 * Função para adicionar todos os membros de um servidor à cache do bot.
 * @param client - Instância do cliente Discord.
 * @param guildId - ID do servidor (guild) que deseja cachear os membros.
 */

async function cacheAllGuildMembers(
  client: Client,
  guildId: string
): Promise<void> {
  try {
    // Busca o servidor pelo ID
    const guild: Guild = await client.guilds.fetch(guildId);
    if (!guild) {
      console.error(`Guild with ID ${guildId} not found.`);
      return;
    }

    console.log(`Buscando membros do servidor: ${guild.name}`);

    // Busca todos os membros do servidor e adiciona à cache
    // O método fetch sem argumentos busca todos os membros disponíveis
    await guild.members.fetch();
    console.log(
      `Total de membros na cache para ${guild.name}: ${guild.members.cache.size}`
    );

    console.log(
      `Todos os membros do servidor ${guild.name} foram adicionados à cache.`
    );
  } catch (error) {
    console.error(
      `Erro ao buscar membros do servidor com ID ${guildId}:`,
      error
    );
  }
}

export { cacheAllGuildMembers };
