import { ChatInputCommandInteraction } from "discord.js";
import path from "path";
import fs from "fs";

export async function handleRandomGatoPreto(
  interaction: ChatInputCommandInteraction
) {
  try {
    const imagesPath = path.join(process.cwd(), "public", "image");
    const files = fs.readdirSync(imagesPath);

    // Filtrar apenas arquivos de imagem
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif"].includes(ext);
    });

    if (imageFiles.length === 0) {
      return interaction.reply("Nenhuma imagem encontrada na pasta.");
    }

    const randomIndex = Math.floor(Math.random() * imageFiles.length);
    const randomImage = imageFiles[randomIndex];
    const imagePath = path.join(imagesPath, randomImage);

    await interaction.reply({ files: [imagePath] });
  } catch (error) {
    console.error(error);
    await interaction.reply("Ocorreu um erro ao tentar enviar a imagem.");
  }
}
