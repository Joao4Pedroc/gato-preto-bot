import { CommandInteraction, Client, TextChannel } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { getGuildChannel } from "./handleMiawsagemConfig";

interface GuildConfig {
  [guildId: string]: {
    guildId: string;
    channelId: string;
  };
}

export async function handleMiawsagem(
  interaction: CommandInteraction,
  client: Client
) {
  // Obtém a mensagem diretamente como string
  const mensagem = interaction.options.get("mensagem")?.value as string;
  const destinatarioOption = interaction.options.get("destinatário");
  let destinatario;

  if (destinatarioOption && destinatarioOption.user) {
    destinatario = destinatarioOption.user;
  } else {
    await interaction.reply({
      content: "Nenhum usuario foi fornecido",
      ephemeral: true,
    });
  }

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({
      content: "Este comando só pode ser usado dentro de um servidor.",
      ephemeral: true,
    });
    return;
  }

  const channelId = getGuildChannel(guildId);

  if (!channelId) {
    await interaction.reply({
      content:
        "Este servidor não está configurado para enviar mensagens anônimas.\n Configure utilizando /configurar-miawsagem canal:",
      ephemeral: true,
    });
    return;
  }

  let channel;
  try {
    channel = await client.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      await interaction.reply({
        content: "Canal de mensagens inválido ou não encontrado.",
        ephemeral: true,
      });
      return;
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Não foi possível acessar o canal de mensagens.",
      ephemeral: true,
    });
    return;
  }

  // Formatar a mensagem

  if (!destinatario) {
    await interaction.reply({
      content: "Marca alguem mano",
      ephemeral: true,
    });

    return;
  }
  let formattedMessage = `**🐱 Uma miawsagem anônima foi enviada para <@${destinatario.id}>!! 🐱** \n\n\`\`\`${mensagem}\`\`\``;

  try {
    await (channel as TextChannel).send(formattedMessage);
    await interaction.reply({
      content: "Sua mensagem anônima foi enviada com sucesso!",
      ephemeral: true,
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Ocorreu um erro ao enviar sua mensagem anônima.",
      ephemeral: true,
    });
  }
}

/*

 ////////////////////////// LOGICA ANTIGA DO HANDLEMIAWSAGEM //////////////////////////


import { CommandInteraction, Guild, TextChannel, User } from "discord.js";
import {
  addDefaultUserForGuild,
  getDefaultUsersForGuild,
  getGuildChannel,
} from "./handleMiawsagemConfig";

async function handleMiawsagem(interaction: CommandInteraction) {
  // Obtém a opção 'mensagem'
  const mensagemOption = interaction.options.get("mensagem");
  if (!mensagemOption || !mensagemOption.value) {
    await interaction.reply({
      content: "Você precisa fornecer uma mensagem.",
      ephemeral: true,
    });
    return;
  }
  const mensagem = mensagemOption.value as string;

  // Obtém a opção 'destinatário'
  const destinatarioOption = interaction.options.get("destinatário");
  if (!destinatarioOption || !destinatarioOption.value) {
    await interaction.reply({
      content: "Você precisa fornecer o destinatário.",
      ephemeral: true,
    });
    return;
  }
  const destinatarioInput = destinatarioOption.value as string;

  let destinatario: User | undefined;
  console.log("vai se fudeeeeeeeeeee");

  if (true) {
    // Está no privado (DM)
    // Obtém a opção 'servidor' (o nome do servidor)
    const servidorOption = interaction.options.get("servidor");
    let servidorNome = servidorOption ? (servidorOption.value as string) : null;

    // Verifica se o servidor foi fornecido
    let guild: Guild | undefined;
    if (servidorNome) {
      // O usuário forneceu o nome do servidor - procurar pelo nome
      const matchedGuilds = interaction.client.guilds.cache.filter(
        (g) => g.name.toLowerCase() === servidorNome!.toLowerCase()
      );

      if (matchedGuilds.size === 0) {
        await interaction.reply({
          content: `Não foi possível encontrar um servidor com o nome "${servidorNome}".`,
          ephemeral: true,
        });
        return;
      }

      guild = matchedGuilds.first()!; // Usa o primeiro servidor encontrado com o nome correspondente

      // Adiciona o usuário atual à lista de "usuários padrão" para esse servidor
      addDefaultUserForGuild(guild.id, interaction.user.id);
    } else {
      // O usuário não forneceu o nome do servidor - verifica em qual servidor ele é o "usuário padrão"
      guild = interaction.client.guilds.cache.find((g) =>
        getDefaultUsersForGuild(g.id)?.includes(interaction.user.id)
      );

      if (!guild) {
        await interaction.reply({
          content:
            "Escolha o servidor em que a mensagem sera enviada na opção servidor. (Esse processo precisa ser feito apenas uma vez)",
          ephemeral: true,
        });
        return;
      }
    }

    // Encontra o canal configurado para o servidor encontrado
    const channelId = getGuildChannel(guild.id);
    if (!channelId) {
      await interaction.reply({
        content: `Nenhum canal foi configurado para o servidor ${guild.name}.`,
        ephemeral: true,
      });
      return;
    }

    const channel = guild.channels.cache.get(channelId) as TextChannel;
    if (!channel || !(channel instanceof TextChannel)) {
      await interaction.reply({
        content: `Não foi possível encontrar o canal configurado no servidor ${guild.name}.`,
        ephemeral: true,
      });
      return;
    }

    try {
      // Envia uma resposta inicial para evitar timeout
      await interaction.reply({
        content: "Processando sua mensagem anônima... ⏳",
        ephemeral: true,
      });

      // Não é necessário rebuscar o guild, já temos ele

      // Tenta encontrar o usuário na cache global de usuários pelo nome de usuário
      destinatario = interaction.client.users.cache.find(
        (user) =>
          user.username.toLowerCase() === destinatarioInput.toLowerCase()
      );

      // Se não encontrar, tenta buscar pelo apelido (nickname) no servidor
      if (!destinatario) {
        const memberByNickname = guild.members.cache.find(
          (member) =>
            member.nickname &&
            member.nickname.toLowerCase() === destinatarioInput.toLowerCase()
        );

        if (memberByNickname) {
          destinatario = memberByNickname.user;
        }
      }

      // Se ainda não encontrar, verifica se o input é um ID e tenta buscar pelo ID
      if (!destinatario && /^\d+$/.test(destinatarioInput)) {
        try {
          destinatario = await interaction.client.users.fetch(
            destinatarioInput
          );
        } catch (error) {
          destinatario = undefined;
        }
      }

      // Se o destinatário ainda não foi encontrado
      if (!destinatario) {
        await interaction.editReply({
          content:
            '\nUsuário não encontrado. Por favor, verifique se o nome está correto ou forneça o ID do usuário (Esse processo precisa ser feito apenas uma vez).\n\nPara obter o ID do usuário:\n1. Ative o Modo de Desenvolvedor no Discord (Configurações > Avançado > Modo de Desenvolvedor).\n2. Vá até o perfil do usuário no servidor.\n3. Clique com o botão direito no nome do usuário e selecione "Copiar ID".\n4. Reenvie o comando usando o ID como destinatário.',
        });
        return;
      }

      // Envia a mensagem no canal especificado, mencio nando o destinatário
      await channel.send({
        content: `Uma miawsagem anônima foi enviada para <@${destinatario.id}>!🐱\n\n\`\`\`${mensagem}\`\`\``,
        allowedMentions: { users: [destinatario.id] },
      });

      // Edita a resposta para confirmar o envio
      await interaction.editReply({
        content: "Sua mensagem anônima foi enviada com sucesso!🐱",
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "Erro ao enviar a mensagem. Tente novamente.",
      });
    }
  } else {
    // Está em servidor
  }
}

export { handleMiawsagem };
*/
