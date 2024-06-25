import TelegramBot from 'node-telegram-bot-api';

type ChatId = number | string;

interface TgNotificationBot {
    token: string;
    chatId: ChatId;
}

const createTgNotificationBot = ({ token, chatId }: TgNotificationBot) => {
    const bot = new TelegramBot(token, { polling: false });

    const normalizeChatId = async (chatId: ChatId): Promise<string> => {
        if (typeof chatId === 'number') return chatId.toString();
        if (chatId.startsWith('-100') || chatId.startsWith('-')) return chatId;

        try {
            await bot.getChat(chatId);
            return chatId;
        } catch (error) {
            if (isTelegramError(error) && error.response?.body?.error_code === 400) {
                const modifiedChatId = '-' + chatId;
                try {
                    await bot.getChat(modifiedChatId);
                    return modifiedChatId;
                } catch (innerError) {
                    if (isTelegramError(innerError)) {
                        console.error(`Telegram API error: ${innerError.message}`);
                    }
                    return chatId;
                }
            } else {
                if (isTelegramError(error)) {
                    console.error(`Telegram API error: ${error.message}`);
                }
                return chatId;
            }
        }
    };

    const sendMessage = async (message: string) => {
        const normalizedChatId = await normalizeChatId(chatId);
        try {
            await bot.sendMessage(normalizedChatId, message);
        } catch (error) {
            handleSendError(error, normalizedChatId);
        }
    };

    const sendPhoto = async (photo: string, caption?: string) => {
        const normalizedChatId = await normalizeChatId(chatId);
        try {
            await bot.sendPhoto(normalizedChatId, photo, { caption });
        } catch (error) {
            handleSendError(error, normalizedChatId);
        }
    };

    const sendDocument = async (document: string, caption?: string) => {
        const normalizedChatId = await normalizeChatId(chatId);
        try {
            await bot.sendDocument(normalizedChatId, document, { caption });
        } catch (error) {
            handleSendError(error, normalizedChatId);
        }
    };

    const handleSendError = (error: any, chatId: string) => {
        if (isTelegramError(error)) {
            switch (error.response?.body?.error_code) {
                case 403:
                    console.log(`Bot is blocked by the user or doesn't have access to chat with ID ${chatId}`);
                    break;
                case 404:
                    console.log(`Chat with ID ${chatId} not found`);
                    break;
                case 429:
                    console.log(`Rate limit exceeded. Retry after ${error.response.body.parameters.retry_after} seconds`);
                    break;
                default:
                    console.error(`Error sending message to chat ${chatId}: ${error.message}`);
            }
        } else {
            console.error(`Unknown error sending message to chat ${chatId}`);
        }
    };

    type TTelegramError = { response: { body: { error_code: number, parameters: { retry_after: number } } }, message: string };
    const isTelegramError = (error: any): error is TTelegramError => {
        return error && error.response && error.response.body && typeof error.response.body.error_code === 'number';
    };

    return {
        sendMessage,
        sendPhoto,
        sendDocument
    };
};

export default createTgNotificationBot;
