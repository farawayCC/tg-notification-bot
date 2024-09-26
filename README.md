# tg-notification-bot

A simple and functional Telegram bot notification package for Node.js. Fork of a python package [AI-Stratov/tg-notification-bot](https://github.com/AI-Stratov/tg_notification_bot)

## Features

- Send text messages
- Send photos
- Send documents

## Installation

```bash
npm install tg-notification-bot
```

## Minimal Usage Example

```javascript
const { default: createTgNotificationBot } = require('tg-notification-bot');

const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const chatId = 'YOUR_CHAT_ID';

const bot = createTgNotificationBot({ token, chatId });

(async () => {
    try {
        await bot.sendMessage('Hello from my new project!');
        // For documents and photos, you can also provide a URL, f.e.: https://http.cat/images/202.jpg
        await bot.sendPhoto('path/to/photo.jpg', 'Here is a photo');
        await bot.sendDocument('path/to/document.pdf', 'Here is a document');
    } catch (error) {
        console.error('Error sending message:', error);
    }
})();
```

# To-Do:
- [ ] Add ability to send documents using `path`, `Buffer`, or `ReadableStream` instead of file paths.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
