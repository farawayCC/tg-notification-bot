export interface TgNotificationBotOptions {
    token: string;
    chatId: string | number;
}

export interface TgNotificationBot {
    send: (message: string) => Promise<void>;
}

export default function createTgNotificationBot(
    options: TgNotificationBotOptions,
): TgNotificationBot;
