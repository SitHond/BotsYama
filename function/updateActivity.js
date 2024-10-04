async function updateActivity(userId, guildId, hours) {
    const User = interaction.client.sequelize.models.User;

    // Найти или создать пользователя
    const [user] = await User.findOrCreate({
        where: { id: userId, guildId: guildId },
        defaults: { activity: 0 },
    });

    // Обновляем активность
    user.activity += hours;
    await user.save();
}
