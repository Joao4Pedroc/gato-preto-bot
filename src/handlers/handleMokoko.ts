import { Client, TextChannel } from "discord.js";

//melhorar mokoko

const channelId = "1082357488013283390";
function getNextNotificationTime(): Date {
  const now = new Date();
  let next = new Date(now.getTime());

  // Incrementa um minuto para evitar repetir o mesmo horário
  next.setMinutes(now.getMinutes() + 1);
  next.setSeconds(0);
  next.setMilliseconds(0);

  while (true) {
    const hours = next.getHours();
    const minutes = next.getMinutes();

    // Verifica se a hora é ímpar
    const isEvenHour = hours % 2 === 0;

    // Verifica se os minutos são 30 ou 50
    const isValidMinute = minutes === 50;

    if (isEvenHour && isValidMinute) {
      return next;
    }

    // Incrementa um minuto e continua a verificação
    next.setMinutes(next.getMinutes() + 1);
  }
}

export async function sendNotification(client: Client): Promise<void> {
  try {
    const channel = await client.channels.fetch(channelId);

    if (!channel || !(channel instanceof TextChannel)) {
      console.error("Canal de notificação inválido.");
      return;
    }

    const message = `📢 **Notificação de Evenyato!** 📢\n\n📅 *Próximiaw evenyato miaukoko em breve!* 🐱 Não perca! \n\n <@userId> <@userId> <@userId>`;

    await channel.send(message);
    console.log(`Notificação enviada em ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error("Erro ao enviar a notificação:", error);
  }
}

export function scheduleNextNotification(client: Client): void {
  const nextNotificationTime = getNextNotificationTime();
  const now = new Date();
  const delay = nextNotificationTime.getTime() - now.getTime();

  console.log(
    `Próxima notificação agendada para ${nextNotificationTime.toLocaleString()}`
  );

  setTimeout(async () => {
    await sendNotification(client);
    // Após enviar a notificação, agendar a próxima
    scheduleNextNotification(client);
    console.log(delay);
  }, delay);
}
