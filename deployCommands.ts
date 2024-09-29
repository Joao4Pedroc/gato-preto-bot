import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";

config();

const commands = [
  new SlashCommandBuilder()
    .setName("meow")
    .setDescription("O bot entra na call e faz meow"),
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
