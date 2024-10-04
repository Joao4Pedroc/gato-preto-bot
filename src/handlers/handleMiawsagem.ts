import { CommandInteraction, TextChannel, User } from "discord.js";

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
    // Está no privado
    try {
      // Envia uma resposta inicial para evitar timeout
      await interaction.reply({
        content: "Processando sua mensagem anônima... ⏳",
        ephemeral: true,
      });

      // IDs do servidor e canal onde a mensagem será enviada
      const guildId = ""; //  ID do seu servidor
      const channelId = ""; // ID do canal específico

      // Busca o servidor pelo ID
      const guild = interaction.client.guilds.cache.get(guildId);
      if (!guild) {
        await interaction.editReply({
          content: "Não foi possível encontrar o servidor.",
        });
        return;
      }

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
            'Usuário não encontrado. Por favor, verifique se o nome está correto ou forneça o ID do usuário.\n\nPara obter o ID do usuário:\n1. Ative o Modo de Desenvolvedor no Discord (Configurações > Avançado > Modo de Desenvolvedor).\n2. Vá até o perfil do usuário no servidor.\n3. Clique com o botão direito no nome do usuário e selecione "Copiar ID".\n4. Reenvie o comando usando o ID como destinatário.',
        });
        return;
      }

      // Busca o canal pelo ID
      const channel = guild.channels.cache.get(channelId) as TextChannel;
      if (!channel || !(channel instanceof TextChannel)) {
        await interaction.editReply({
          content: "Não foi possível encontrar o canal no servidor.",
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
