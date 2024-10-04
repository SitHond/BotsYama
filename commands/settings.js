const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure bot settings.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setafk')
                .setDescription('Set the AFK channel for the server.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to set as AFK')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setlevelup')
                .setDescription('Set the notification channel for level-up events.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send level-up notifications to')
                        .setRequired(true)
                )),
    async execute(interaction) {
        const { options, member, client, guild } = interaction;

        // Проверка разрешений
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Эта команда доступна только администраторам!',
                ephemeral: true
            });
        }

        const subcommand = options.getSubcommand();
        const Settings = client.sequelize.models.Settings;

        const channel = options.getChannel('channel');

        // Используем findOrCreate и обновляем атрибуты при необходимости
        const [settings] = await Settings.findOrCreate({
            where: { guildId: guild.id },
            defaults: {} // Убираем unknown attributes
        });

        if (subcommand === 'setafk') {
            settings.afkChannelId = channel.id; // Устанавливаем AFK канал
            await settings.save();
            await interaction.reply(`AFK channel set to ${channel}.`);
        } else if (subcommand === 'setlevelup') {
            settings.notificationChannelId = channel.id; // Устанавливаем канал уведомлений
            await settings.save();
            await interaction.reply(`Level-up notification channel set to ${channel}.`);
        }
    },
};
