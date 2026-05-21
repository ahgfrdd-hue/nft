const { Telegraf } = require('telegraf');

// Сюда сервер сам подставит токен вашего бота, который вы получили в BotFather
const bot = new Telegraf(process.env.BOT_TOKEN);

// Функция, которая создает ссылку на оплату звездами
async function getPaymentLink(userId, starsAmount) {
    const invoice = {
        title: "Пополнение баланса",
        description: `Покупка ${starsAmount} звезд на сайте`,
        payload: `user_${userId}`, // Запоминаем, какому пользователю придут звезды
        provider_token: "",        // Для звезд это поле ОБЯЗАТЕЛЬНО должно быть пустым!
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

    // // ТУТ в будущем нужно будет дописать строчку,
    // // которая начисляет баланс в вашу базу данных сайта.
});

// Запускаем робота (не блокируя основной поток кода)
bot.launch().then(() => {
    console.log('Бот успешно запущен в режиме Long Polling');
}).catch((err) => {
    console.error('Ошибка запуска бота:', err);
});

// --- ВЕБ-СЕРВЕР EXPRESS ---
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // Render сам передаст нужный порт сюда

// Главная страница для проверки работы
app.get('/', (req, res) => {
    res.send('Бот платежей работает успешно!');
});

// Новый рабочий маршрут /pay
// Пример вызова: https://rader-1.onrender.com/pay?userId=ТВОЙ_ID&amount=50
app.get('/pay', async (req, res) => {
    try {
        const { userId, amount } = req.query;

        if (!userId || !amount) {
            return res.status(400).send('Ошибка: укажите в ссылке параметры userId и amount. Пример: /pay?userId=123&amount=10');
        }

        // Генерируем ссылку на оплату через созданную выше функцию
        const paymentLink = await getPaymentLink(userId, parseInt(amount));
        
        // Перенаправляем пользователя сразу на оплату в Telegram
        res.redirect(paymentLink);
    } catch (error) {
        console.error('Ошибка при генерации ссылки:', error);
        res.status(500).send('Внутренняя ошибка сервера при создании платежа.');
    }
});

// Запуск веб-сервера на порту, который требует Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Веб-сервер запущен на порту ${PORT}`);
});
