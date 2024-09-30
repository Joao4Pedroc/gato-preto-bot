import { Message, TextChannel } from "discord.js";

// TODO: uma forma mais efetiva de contar mensagens

const MESSAGE_THRESHOLD = 100; // numero de mensagens ate o gato preto interagir
const messageCount: { [guildId: string]: number } = {};

const messages = ["Miaaau😺", "Miaaaw😺", "😺😺😺"];

export async function handleMessage(message: Message) {
  if (message.author.bot) return;

  const guildId = message.guild?.id;
  if (!guildId) return;

  if (!messageCount[guildId]) {
    messageCount[guildId] = 0;
  }

  messageCount[guildId]++;

  // verificar se o limite de mensagens foi atingido
  if (messageCount[guildId] >= MESSAGE_THRESHOLD) {
    // Verificar se o canal é um canal de texto ou um canal de notícias
    if (message.channel instanceof TextChannel) {
      // enviar uma mensagem aleatoria no mesmo canal da ultima mensagem
      const randomMessage = getRandomMessage();
      message.channel.send(randomMessage);
    }
  }

  // Resetar o contador de mensagens do servidor
  messageCount[guildId] = 0;
}

// Função para escolher uma mensagem aleatória
function getRandomMessage() {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}
