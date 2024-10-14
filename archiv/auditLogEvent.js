const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const { guild, client } = member;
        const Settings = client.sequelize.models.Settings;

        try {
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

                    await welcomeChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Ошибка при обработке нового участника:', error);
        }
    },
};

module.exports.leave = {
    name: 'guildMemberRemove',
    async execute(member) {
        const { guild, client } = member;
        const Settings = client.sequelize.models.Settings;

        try {
            // Получаем настройки для текущего сервера
            const settings = await Settings.findOne({ where: { guildId: guild.id } });
            if (!settings || !settings.auditLogChannelId) return;

            const auditChannel = guild.channels.cache.get(settings.auditLogChannelId);
            if (!auditChannel) return;

            // Отправляем сообщение о покинувшем участнике
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: `${member.user.username} покинул сервер`,
                    iconURL: member.user.displayAvatarURL(),
                })
                .setDescription(`Нам жаль, что вы уходите, ${member.user.username}. Надеемся, вы вернетесь!`)
                .setTimestamp();

            await auditChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Ошибка при отправке сообщения о выходе участника в журнал аудита:', error);
        }
    },
};

module.exports.messageDelete = {
    name: 'messageDelete',
    async execute(message) {
        const { guild, client } = message;
        if (!guild) return; // Проверка, чтобы убедиться, что сообщение удалено на сервере

        const Settings = client.sequelize.models.Settings;

        try {
            // Получаем настройки для текущего сервера
            const settings = await Settings.findOne({ where: { guildId: guild.id } });
            if (!settings || !settings.auditLogChannelId) return;

            const auditChannel = guild.channels.cache.get(settings.auditLogChannelId);
            if (!auditChannel) return;

            // Отправляем сообщение об удаленном сообщении
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setAuthor({
                    name: `Сообщение удалено`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setDescription(`**Автор:** ${message.author}
**Канал:** <#${message.channel.id}>
**Содержание:** ${message.content}`)
                .setTimestamp();

            await auditChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Ошибка при отправке сообщения об удалении в журнал аудита:', error);
        }
    },
};

module.exports.voiceStateUpdate = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const { guild, client } = newState;
        const Settings = client.sequelize.models.Settings;

        try {
            // Получаем настройки для текущего сервера
            const settings = await Settings.findOne({ where: { guildId: guild.id } });
            if (!settings || !settings.auditLogChannelId) return;

            const auditChannel = guild.channels.cache.get(settings.auditLogChannelId);
            if (!auditChannel) return;

            // Проверяем, если пользователь подключился к голосовому каналу
            if (!oldState.channelId && newState.channelId) {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setAuthor({
                        name: `${newState.member.user.username} присоединился к голосовому каналу`,
                        iconURL: newState.member.user.displayAvatarURL(),
                    })
                    .setDescription(`**Канал:** <#${newState.channelId}>`)
                    .setTimestamp();

                await auditChannel.send({ embeds: [embed] });
            }

            // Проверяем, если пользователь покинул голосовой канал
            if (oldState.channelId && !newState.channelId) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: `${oldState.member.user.username} покинул голосовой канал`,
                        iconURL: oldState.member.user.displayAvatarURL(),
                    })
                    .setDescription(`**Канал:** <#${oldState.channelId}>`)
                    .setTimestamp();

                await auditChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Ошибка при отправке сообщения в журнал аудита для обновления состояния голосового канала:', error);
        }
    },
};