const { Events } = require('discord.js');
const { addExp } = require('../function/leveling'); // Импортируем функцию добавления опыта

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        // Игнорируем сообщения бота, кроме сообщений от SD.C Monitoring
        if (message.author.bot && message.author.username !== 'SD.C Monitoring') return;

        const { User } = client.sequelize.models; 

        try {
            // Логика начисления монет за буст сервера
            if (message.author.username === 'SD.C Monitoring' && message.content.includes('Успешный Up!')) {
                // Извлечение имени пользователя, который произвел буст
                const boosterUsername = message.content.split('\n')[1].trim(); // Предполагается, что имя на второй строке

                // Ищем участника сервера по имени
                const member = message.guild.members.cache.find(m => m.user.username === boosterUsername);

                if (!member) {
                    console.error('Не удалось найти пользователя:', boosterUsername);
                    return;
                }

                // Ищем пользователя в базе данных
                const user = await User.findOne({
                    where: {
                        id: member.user.id,
                        guildId: message.guild.id,
                    }
                });

                if (!user) {
                    console.error('Пользователь не найден в базе данных:', member.user.username);
                    return;
                }

                // Начисляем монеты за буст
                const boostReward = 300;
                user.balance += boostReward;
                await user.save();

                // Отправляем сообщение о награде
                await message.channel.send(`🎉 ${member.user.username} получил(а) ${boostReward} монет за буст сервера!`);
                return; // Завершаем выполнение, если это было сообщение о бусте
            }

            // Логика добавления опыта за отправку сообщений
            if (!message.author.bot) {
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
            }
        } catch (error) {
            console.error(`Ошибка при обработке сообщения:`, error);
        }
    },
};
