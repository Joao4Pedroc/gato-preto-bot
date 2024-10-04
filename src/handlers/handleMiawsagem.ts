// src/handleMiawsagem.ts
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

  if (!interaction.guild) {
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

      // Envia a mensagem no canal especificado, mencionando o destinatário
      await channel.send({
        content: `Uma miawsagem anônima foi enviada para <@${destinatario.id}>!🐱\n\n${mensagem}`,
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
    destinatario = destinatarioOption.user;

    if (destinatario) {
      try {
        if (interaction.channel instanceof TextChannel) {
          // Envia a mensagem anonimamente para o destinatário
          await destinatario.send(
            `Você recebeu uma miawsagem anônima: "${mensagem}"`
          );

          // Responde no canal atual, mencionando o destinatário
          await interaction.channel.send({
            content: `\n\nUma miawsagem anônima foi enviada para <@${destinatario.id}>!🐱\n\n${mensagem}`,
            allowedMentions: { users: [destinatario.id] },
          });

          // Responde ao usuário de forma discreta que a mensagem foi enviada
          await interaction.reply({
            content: "Sua mensagem anônima foi enviada!🐱",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "Não posso mandar uma miawsagem nesse canal.",
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "Erro ao enviar a mensagem. Tente novamente.",
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply({
        content: "Usuário não encontrado.",
        ephemeral: true,
      });
    }
  }
}

export { handleMiawsagem };
