// events/levelUp.js
module.exports = {
    name: 'userLevelUp',
    async execute(user, guild, newLevel) {
        const Settings = user.client.sequelize.models.Settings;
        const settings = await Settings.findOne({ where: { guildId: guild.id } });

        if (!settings || !settings.levelUpChannelId) return;

        const channel = guild.channels.cache.get(settings.levelUpChannelId);

        if (channel) {
            channel.send(`${user.username} has leveled up to level ${newLevel}! 🎉`);
        }
    },
};
