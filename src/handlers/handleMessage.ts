import { Message, TextChannel } from "discord.js";
import fs from "fs";

// Caminho do arquivo JSON
const messageCountsPath = "./backend/messageCounts.json";

// Objeto para manter as contagens de mensagens
let messageCounts: { [guildId: string]: number } = {};

// Função para lidar com mensagens
export function handleMessage(message: Message) {
  // Carregar contagens de mensagens na inicialização
  loadMessageCounts();
  // Ignorar mensagens de bots e mensagens fora de servidores (DMs)
  if (message.author.bot || !message.guild) return;

  const guildId = message.guild.id;

  // Inicializar contagem se não existir
  if (!messageCounts[guildId]) {
    messageCounts[guildId] = 0;
  }

  // Incrementar a contagem de mensagens
  messageCounts[guildId]++;

  // Limite de mensagens antes do bot enviar uma resposta
  const MESSAGE_THRESHOLD = 30;

  console.log(
    `Servidor: ${guildId}, Contagem de mensagens: ${messageCounts[guildId]}`
  );

  // Verificar se atingiu o limite de mensagens
  if (messageCounts[guildId] >= MESSAGE_THRESHOLD) {
    if (message.channel instanceof TextChannel) {
      // enviar uma mensagem aleatoria no mesmo canal da ultima mensagem
      const randomMessage = getRandomMessage();
      message.channel.send(randomMessage);
    }
    // Resetar a contagem
    messageCounts[guildId] = 0;

    // Salvar as contagens atualizadas
    saveMessageCounts();
  } else {
    // Salvar as contagens atualizadas mesmo que não tenha atingido o limite
    saveMessageCounts();
  }
}

// Função para escolher uma mensagem aleatória

//"黑猫幸运之神",
//"黑猫之神",
function getRandomMessage(): string {
  if (Math.random() * 1000 < 1) {
    return "幸运黑猫之神要求所有 Kuromi 女孩向@ximbriba 发送消息\n\n如果你认识的话，介绍给Ximbriba吧，这是黑猫财神的请求";
  }
  const randomMessages = [
    "Miaaau! 😺",
    "O gato preto ta de olho em você! 👀",
    "Que tal um /meow? 🐾",
    "Hora do /meow! 🎶",
    "^idiotinha",
    "招财黑猫的招财神",
    "https://discord.com/channels/966244956115173377/966244956677214220/1293619725674217533",
    "https://cdn.discordapp.com/attachments/966244956677214220/1293620308036550806/e5f6dd36-6e14-4358-82bc-447862fadc38.png?ex=6708094b&is=6706b7cb&hm=680a9f19bb4583d6dcb00c86595e75170e12d38ddc0b75695a52c96b78e78d24&",
  ];
  const index = Math.floor(Math.random() * randomMessages.length);
  return randomMessages[index];
}

// Função para carregar o arquivo JSON
function loadMessageCounts() {
  if (fs.existsSync(messageCountsPath)) {
    try {
      const data = fs.readFileSync(messageCountsPath, "utf-8");
      messageCounts = JSON.parse(data);
      console.log("Contagens de mensagens carregadas com sucesso.");
    } catch (error) {
      console.error("Erro ao carregar o arquivo JSON:", error);
    }
  } else {
    console.log("Arquivo JSON não encontrado, criando um novo.");
  }
}

// Função para salvar o arquivo JSON
function saveMessageCounts() {
  try {
    fs.writeFileSync(messageCountsPath, JSON.stringify(messageCounts, null, 2));
    console.log("Contagens de mensagens salvas com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar o arquivo JSON:", error);
  }
}
