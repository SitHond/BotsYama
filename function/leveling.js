// Функция для вычисления уровня на основе опыта
function calculateLevel(exp) {
    const baseExp = 110; // Опыт для первого уровня
    const factor = 2;  // Множитель увеличения опыта

    let level = 1;
    let requiredExp = baseExp;

    // Цикл для вычисления уровня в зависимости от опыта
    while (exp >= requiredExp) {
        level++;
        requiredExp = baseExp * Math.pow(factor, level - 1);
    }

    return level;
}


async function addExp(user, gainedExp, client) {
    console.log(`Пользователь ${user.username} отправил сообщение, текущий опыт: ${user.exp}`);

    // Увеличиваем опыт
    user.exp += gainedExp;

    console.log(`Текущий опыт пользователя ${user.username}: ${user.exp}`);

    const currentLevel = user.level;
    const newLevel = calculateLevel(user.exp); // Используем функцию для расчета уровня

    console.log(`Текущий уровень: ${currentLevel}, Новый уровень: ${newLevel}`);

    // Сохраняем обновленный опыт в базе данных
    await user.save(); // Сохраняем изменения в базе данных

    // Проверяем, повысился ли уровень
    if (newLevel > currentLevel) {
        user.level = newLevel;
        await user.save(); // Сохраняем новый уровень в базе данных

        // Отправляем сообщение в канал
        try {
            const Settings = client.sequelize.models.Settings;
            const settings = await Settings.findOne({ where: { guildId: user.guildId } });
            //console.log('Настройки:', settings); // Логируем настройки

            if (settings && settings.notificationChannelId) {
                const channel = client.channels.cache.get(settings.notificationChannelId);
                //console.log('Канал для уведомления:', channel); // Логируем канал

                if (channel) {
                    await channel.send(`Поздравляем @${user.username}, вы достигли уровня ${newLevel}!`);
                } else {
                    console.log('Канал не найден или бот не имеет к нему доступа.');
                }
            } else {
                console.log('Настройки не найдены или notificationChannelId не установлен.');
            }
        } catch (error) {
            console.error("Ошибка отправки сообщения: ", error);
        }
    }
}




module.exports = { addExp };
