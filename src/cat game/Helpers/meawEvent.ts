import { CommandInteraction, GuildMember } from "discord.js";

export function getRandomEvent(): string {
  const randomNumber = Math.random() * 100; // Número entre 0 e 100

  if (randomNumber < 1) {
    return "legendary"; // 1% de chance
  } else if (randomNumber < 5) {
    return "epic"; // 4% de chance (5% total)
  } else if (randomNumber < 20) {
    return "rare"; // 15% de chance (20% total)
  } else {
    return "common"; // 80% de chance
  }
}

export async function eventoComum(
  interaction: CommandInteraction,
  participants: GuildMember[]
) {
  for (const member of participants) {
    await addCatCoins(member.id, 1); // Função para adicionar CatCoins
  }
  await interaction.followUp("Cada participante recebeu 1 CatCoin!");
}

export async function eventoRaro(
  interaction: CommandInteraction,
  participants: GuildMember[]
) {
  const itemName = "Item Comum";
  for (const member of participants) {
    await addItemToInventory(member.id, itemName, 1); // Função para adicionar item
  }
  await interaction.followUp(`Cada participante recebeu um ${itemName}!`);
}

export async function eventoEpico(
  interaction: CommandInteraction,
  participants: GuildMember[]
) {
  const spawnedCat = generateCat(); // Função para gerar um gato aleatório

  // Armazenar o gato disponível para captura, associando aos participantes
  // talvez usar um Map ou armazenar no banco de dados

  await interaction.followUp(
    "Um gato selvagem apareceu! Use `/capturar` para tentar capturá-lo!"
  );
}

export async function eventoLendario(
  interaction: CommandInteraction,
  participants: GuildMember[]
) {
  const eventCat = generateCat(); // Função para gerar um gato de evento

  // Adicionar o gato diretamente ao inventário dos participantes
  for (const member of participants) {
    await addCatToInventory(member.id, eventCat);
    await addItemToInventory(member.id, "Item de Evento", 1);
  }
  await interaction.followUp(
    "Um gato de evento apareceu e foi capturado por todos! Cada participante recebeu um item de evento!"
  );
}
