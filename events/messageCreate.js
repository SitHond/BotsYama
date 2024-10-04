const { Events } = require('discord.js');
const { addExp } = require('../function/leveling'); // Импортируем функцию добавления опыта

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        // Игнорируем сообщения бота
        if (message.author.bot) return;

        // Получаем модель пользователя
        const { User } = client.sequelize.models; 
        
        try {
            // Ищем или создаем запись пользователя в базе данных
            const [user] = await User.findOrCreate({
                where: { id: message.author.id, guildId: message.guild.id },
                defaults: { username: message.author.username, exp: 0, level: 1 } // Начальные значения
            });

            console.log(`Пользователь ${message.author.username} отправил сообщение, текущий опыт: ${user.exp}`);

            // Генерация случайного количества опыта от 1 до 80
            const randomExp = Math.floor(Math.random() * 80) + 1;

            // Добавляем пользователю случайное количество опыта
            await addExp(user, randomExp, client);
            console.log(`Пользователь ${message.author.username} получил ${randomExp} опыта.`);
        } catch (error) {
            console.error(`Ошибка при добавлении опыта: `, error);
        }
    },
};
