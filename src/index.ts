import TelegramBot from "node-telegram-bot-api";

type ChatId = number | string;

interface TgNotificationBot {
    token: string;
    chatId: ChatId;
}

type TTelegramError = {
    response: {
        body: { error_code: number; parameters: { retry_after: number } };
    };
    message: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTelegramError = (error: any): error is TTelegramError =>
    error && error.response && error.response.body &&
    typeof error.response.body.error_code === "number";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSendError = (error: any, targetChatId: string) => {
    if (isTelegramError(error)) {
        switch (error.response?.body?.error_code) {
            case 403:
                console.log(
                    `Bot is blocked by the user or doesn't have access to chat with ID ${targetChatId}`,
                );
                break;
            case 404:
                console.log(`Chat with ID ${targetChatId} not found`);
                break;
            case 429:
                console.log(
                    `Rate limit exceeded. Retry after ${error.response.body.parameters.retry_after} seconds`,
                );
                break;
            default:
                console.error(
                    `Error sending message to chat ${targetChatId}: ${error.message}`,
                );
        }
    } else {
        console.error(`Unknown error sending message to chat ${targetChatId}`);
    }
};

const createTgNotificationBot = ({ token, chatId }: TgNotificationBot) => {
    const bot = new TelegramBot(token, { polling: false });

    const normalizeChatId = async (
        chatIdToNormalize: ChatId,
    ): Promise<string> => {
        if (typeof chatIdToNormalize === "number") {
            return chatIdToNormalize.toString();
        }
        if (
            chatIdToNormalize.startsWith("-100") ||
            chatIdToNormalize.startsWith("-")
        ) return chatIdToNormalize;

        try {
            await bot.getChat(chatIdToNormalize);
            return chatIdToNormalize;
        } catch (error) {
            if (
                isTelegramError(error) &&
                error.response?.body?.error_code === 400
            ) {
                const modifiedChatId = "-" + chatIdToNormalize;
                try {
                    await bot.getChat(modifiedChatId);
                    return modifiedChatId;
                } catch (innerError) {
                    if (
                        isTelegramError(innerError) &&
                        innerError.response?.body?.error_code === 400
                    ) {
                        // If the first modification fails, prepend with '-100' and retry
                        const doubleModifiedChatId = "-100" + chatIdToNormalize;
                        try {
                            await bot.getChat(doubleModifiedChatId);
                            return doubleModifiedChatId;
                        } catch (secondInnerError) {
                            if (isTelegramError(secondInnerError)) {
                                console.error(
                                    `Telegram API error: ${secondInnerError.message}`,
                                );
                            }
                            return chatIdToNormalize;
                        }
                    } else {
                        if (isTelegramError(innerError)) {
                            console.error(
                                `Telegram API error: ${innerError.message}`,
                            );
                        }
                        return chatIdToNormalize;
                    }
                }
            } else {
                if (isTelegramError(error)) {
                    console.error(`Telegram API error: ${error.message}`);
                }
                return chatIdToNormalize;
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

    return {
        sendMessage,
        sendPhoto,
        sendDocument,
    };
};

export default createTgNotificationBot;
