import {
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "dotenv";

config();

const commands = [
  new SlashCommandBuilder()
    .setName("meow")
    .setDescription("O bot entra na call e faz meow")
    .addStringOption((option) =>
      option.setName("nothing").setDescription("nothing to see here")
    ),
  new SlashCommandBuilder()
    .setName("random-gato-preto")
    .setDescription("O bot manda uma imagem aleatoria do gato preto"),
  new SlashCommandBuilder()
    .setName("remindme")
    .setDescription("Set a reminder")
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription(
          "The time to send the reminder (in seconds, minutes, or a timestamp)"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The optional message to remind you of")
    ),
  new SlashCommandBuilder()
    .setName("miawsagem-anônima")
    .setDescription("Envie uma mensagem anônima para uma pessoa")
    .addStringOption((option) =>
      option
        .setName("mensagem")
        .setDescription("A mensagem a ser enviada")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("destinatário")
        .setDescription("Usuario para qual a mensagem sera enviada")
        .setRequired(true)
    )
    .addAttachmentOption(
      (option) =>
        option
          .setName("arquivo")
          .setDescription("Envie uma imagem ou GIF (opcional)")
          .setRequired(false) // É opcional
    ),
  new SlashCommandBuilder()
    .setName("configurar-miawsagem")
    .setDescription(
      "Configura o canal onde as mensagens anônimas serão enviadas"
    )
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("O canal onde as mensagens anônimas serão enviadas")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Apenas administradores podem usar
  new SlashCommandBuilder()
    .setName("globalMeaw")
    .setDescription("O DUELO DE SERVIDORES QUE MAIS MIARAM"),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(
  `${process.env.DISCORD_TOKEN}`
);

(async () => {
  try {
    console.log("Iniciando registro de comandos de barra...");

    await rest.put(Routes.applicationCommands(`${process.env.CLIENT_ID}`), {
      body: commands,
    });

    console.log("Comandos registrados com sucesso.");
  } catch (error) {
    console.error(error);
  }
})();

// new SlashCommandBuilder()
//   .setName("miawsagem-anônima")
//   .setDescription("Envie uma mensagem anônima para uma pessoa")

//   .addStringOption((option) =>
//     option
//       .setName("mensagem")
//       .setDescription("A mensagem a ser enviada")
//       .setRequired(true)
//   )
//   .addStringOption((option) =>
//     option
//       .setName("destinatário")
//       .setDescription(
//         "Nome de usuário global do destinatário (ex: gatopreto)"
//       )
//       .setRequired(true)
//   )
//   .addStringOption((option) =>
//     option
//       .setName("servidor")
//       .setDescription("O servidor onde a mensagem sera enviada")
//   ),
