const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const { guild, client } = member;
        const Settings = client.sequelize.models.Settings;

        // Получаем настройки для текущего сервера
        const settings = await Settings.findOne({ where: { guildId: guild.id } });
        if (!settings) return;

        // Приветствие нового участника
        if (settings.welcomeChannelId) {
            const welcomeChannel = guild.channels.cache.get(settings.welcomeChannelId);
            if (welcomeChannel) {
                const welcomeMessage = settings.welcomeMessage || `Добро пожаловать на сервер, ${member}! Мы рады видеть вас здесь!`;
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setAuthor({
                        name: `Добро пожаловать, ${member.user.username}!`,
                        iconURL: member.user.displayAvatarURL(),
                    })
                    .setDescription(welcomeMessage)
                    .setTimestamp();

                welcomeChannel.send({ embeds: [embed] });
            }
        }
    },
};

module.exports.leave = {
    name: 'guildMemberRemove',
    async execute(member) {
        const { guild, client } = member;
        const Settings = client.sequelize.models.Settings;

        // Получаем настройки для текущего сервера
        const settings = await Settings.findOne({ where: { guildId: guild.id } });
        if (!settings) return;

        // Прощальное сообщение для покидающего участника
        if (settings.farewellChannelId) {
            const farewellChannel = guild.channels.cache.get(settings.farewellChannelId);
            if (farewellChannel) {
                const farewellMessage = settings.farewellMessage || `Нам жаль, что вы уходите, ${member.user.username}. Надеемся, вы вернетесь!`;
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `${member.user.username} покинул сервер`,
                        iconURL: member.user.displayAvatarURL(),
                    })
                    .setDescription(farewellMessage)
                    .setTimestamp();

                farewellChannel.send({ embeds: [embed] });
            }
        }
    },
};