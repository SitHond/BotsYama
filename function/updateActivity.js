async function updateActivity(client, userId, guildId, hours) {
    const User = client.sequelize.models.User; // Доступ к модели через client

    // Найти или создать пользователя
    const [user] = await User.findOrCreate({
        where: { id: userId, guildId: guildId },
        defaults: { activity: 0 },
    });

    // Обновляем активность
    user.activity += hours;
    await user.save();
}
