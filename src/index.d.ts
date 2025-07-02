type ChatId = number | string;

interface TgNotificationBot {
    token: string;
    chatId: ChatId;
}

/**
 * Creates a Telegram notification bot instance.
 * @param config - The bot configuration object containing the token and chatId.
 * @returns An object with sendMessage, sendPhoto, and sendDocument methods.
 */
declare function createTgNotificationBot(config: TgNotificationBot): {
    sendMessage: (message: string) => Promise<void>;
    sendPhoto: (photo: string, caption?: string) => Promise<void>;
    sendDocument: (document: string, caption?: string) => Promise<void>;
};

export default createTgNotificationBot;
export type { ChatId, TgNotificationBot };
