const { Telegraf } = require('telegraf');

// Сюда сервер сам подставит токен вашего бота, который вы получили в BotFather
const bot = new Telegraf(process.env.BOT_TOKEN); 

// Функция, которая создает ссылку на оплату звездами
// (Её будет вызывать кнопка «Пополнить» на вашем сайте)
async function getPaymentLink(userId, starsAmount) {
    const invoice = {
        title: "Пополнение баланса",
        description: `Покупка ${starsAmount} звезд на сайте`,
        payload: `user_${userId}`, // Запоминаем, какому пользователю придут звезды
        provider_token: "",         // Для звезд это поле ОБЯЗАТЕЛЬНО должно быть пустым!
        currency: "XTR",           // XTR — это кодовое название Telegram Stars
        prices: [{ label: "Звезды", amount: starsAmount }] 
    };

    // Создаем ссылку
    const link = await bot.telegram.createInvoiceLink(invoice);
    return link; // Возвращаем ссылку на сайт
}

// А эта часть кода ЖДЕТ, пока пользователь оплатит
bot.on('successful_payment', async (ctx) => {
    const payment = ctx.message.successful_payment;
    const userId = payment.invoice_payload.split('_')[1]; // Узнаем ID пользователя
    const amount = payment.total_amount;                  // Узнаем сколько звезд пришло

    console.log(`Пользователь ${userId} успешно оплатил ${amount} звезд!`);
    
    // ТУТ в будущем нужно будет дописать строчку, 
    // которая начисляет баланс в вашу базу данных сайта.
});

// Запускаем нашего робота
bot.launch();
// --- ЭТОТ КУСОК ДОБАВЛЯЕМ В САМЫЙ КОНЕЦ ФАЙЛА STARS.JS ---

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // Render сам передаст нужный порт сюда

app.get('/', (req, res) => {
    res.send('Бот платежей работает успешно!');
});

app.listen(PORT, () => {
    console.log(`Веб-сервер запущен на порту ${PORT}`);
});
