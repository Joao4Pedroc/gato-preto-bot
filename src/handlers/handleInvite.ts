import { Client, TextChannel } from "discord.js";

export async function createInvitesForAllServers(client: Client) {
  // Itera sobre todos os servidores que o bot está
  client.guilds.cache.forEach(async (guild) => {
    try {
      // Pega o primeiro canal de texto do servidor (geralmente é o canal "geral")
      const textChannels = guild.channels.cache.filter(
        (channel) => channel.type === 0 // Tipo 0 é para Text Channels
      );

      if (textChannels.size === 0) {
        console.log(`No text channels found in ${guild.name}.`);
        return;
      }

      const firstTextChannel = textChannels.first() as TextChannel;

      // Cria um convite para o canal
      const invite = await firstTextChannel.createInvite({
        maxAge: 0, // O convite nunca expira
        maxUses: 1, // Opcional: pode limitar o número de usos (remova essa linha se não quiser limitar)
        unique: true, // Garantir que o convite seja único
      });

      // Loga o convite no console
      console.log(`Invite for ${guild.name}: ${invite.url}`);
    } catch (error) {
      console.error(`Error creating invite for ${guild.name}:`, error);
    }
  });
}
