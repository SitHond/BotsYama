const moment = require('moment');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const User = newState.client.sequelize.models.User;
        const Settings = newState.client.sequelize.models.Settings;

        const userId = newState.member.id;
        const guildId = newState.guild.id;

        try {
            // Get AFK channel ID from settings
            const settings = await Settings.findOne({ where: { guildId } });
            const afkChannelId = settings ? settings.afkChannelId : null;

            // Если пользователь подключился к голосовому каналу и это не AFK канал
            if (!oldState.channelId && newState.channelId && newState.channelId !== afkChannelId) {
                newState.client.voiceTimes = newState.client.voiceTimes || {};
                newState.client.voiceTimes[userId] = moment(); // Сохраняем время входа в голосовой канал
            }

            // Если пользователь вышел из голосового канала и это не AFK канал
            if (oldState.channelId && !newState.channelId && oldState.channelId !== afkChannelId) {
                const enterTime = newState.client.voiceTimes && newState.client.voiceTimes[userId];
                if (enterTime) {
                    const exitTime = moment();
                    const duration = moment.duration(exitTime.diff(enterTime)).asMinutes(); // Длительность в минутах

                    delete newState.client.voiceTimes[userId]; // Удаляем запись после расчета

                    // Обновляем активность пользователя в базе данных
                    const [user] = await User.findOrCreate({
                        where: { id: userId, guildId: guildId },
                        defaults: { activity: 0 },
                    });

                    // Добавляем активность пользователя
                    user.activity += duration;
                    await user.save();

                    console.log(`Пользователь ${userId} был активен в голосовом канале ${duration} минут.`);
                }
            }
        } catch (error) {
            console.error('Ошибка при обновлении активности:', error);
        }
    },
};
