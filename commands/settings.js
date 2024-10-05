const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure or view bot settings.')
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
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setwelcome')
                .setDescription('Set the welcome channel for new members.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send welcome messages to')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setfarewell')
                .setDescription('Set the farewell channel for members leaving.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send farewell messages to')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setwelcomemsg')
                .setDescription('Set the custom welcome message for new members.')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The custom welcome message')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setfarewellmsg')
                .setDescription('Set the custom farewell message for members leaving.')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('The custom farewell message')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View the current server settings.')
        ),
    async execute(interaction) {
        const { options, member, client, guild } = interaction;

        // Проверка разрешений
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Красный цвет для ошибки
                .setAuthor({
                    name: `Эта команда доступна только администраторам!`,
                    iconURL: 'https://media.discordapp.net/attachments/768105199151218690/837717853796565042/-2.png?ex=6701608c&is=67000f0c&hm=9698de4d28bf1627adbd5bdd109ac6f6d63a00859c5d7ecb8dcb2edb956ec5ca&=&format=webp&quality=lossless'
            })       
            return interaction.reply({ embeds: [embed], ephemeral: true }); // Используем Embed
        }

        const subcommand = options.getSubcommand();
        const Settings = client.sequelize.models.Settings;

        const channel = options.getChannel('channel');
        const message = options.getString('message');

        // Используем findOrCreate для получения или создания настроек
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
        } else if (subcommand === 'setwelcome') {
            settings.welcomeChannelId = channel.id; // Устанавливаем канал для приветствий
            await settings.save();
            await interaction.reply(`Welcome channel set to ${channel}.`);
        } else if (subcommand === 'setfarewell') {
            settings.farewellChannelId = channel.id; // Устанавливаем канал для прощаний
            await settings.save();
            await interaction.reply(`Farewell channel set to ${channel}.`);
        } else if (subcommand === 'setwelcomemsg') {
            settings.welcomeMessage = message; // Устанавливаем сообщение для приветствий
            await settings.save();
            await interaction.reply(`Custom welcome message set to: ${message}`);
        } else if (subcommand === 'setfarewellmsg') {
            settings.farewellMessage = message; // Устанавливаем сообщение для прощаний
            await settings.save();
            await interaction.reply(`Custom farewell message set to: ${message}`);
        } else if (subcommand === 'view') {
            // Формируем ответ с текущими настройками
            const afkChannel = settings.afkChannelId ? `<#${settings.afkChannelId}>` : 'Not set';
            const levelUpChannel = settings.notificationChannelId ? `<#${settings.notificationChannelId}>` : 'Not set';
            const welcomeChannel = settings.welcomeChannelId ? `<#${settings.welcomeChannelId}>` : 'Not set';
            const farewellChannel = settings.farewellChannelId ? `<#${settings.farewellChannelId}>` : 'Not set';
            const welcomeMessage = settings.welcomeMessage ? settings.welcomeMessage : 'Default welcome message';
            const farewellMessage = settings.farewellMessage ? settings.farewellMessage : 'Default farewell message';

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Текущие настройки сервера')
                .addFields(
                    { name: 'AFK Channel', value: afkChannel, inline: true },
                    { name: 'Level-up Notification Channel', value: levelUpChannel, inline: true },
                    { name: 'Welcome Channel', value: welcomeChannel, inline: true },
                    { name: 'Farewell Channel', value: farewellChannel, inline: true },
                    { name: 'Welcome Message', value: welcomeMessage, inline: false },
                    { name: 'Farewell Message', value: farewellMessage, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
};