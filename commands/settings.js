const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Настройте или просмотрите настройки бота')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setafk')
                .setDescription('Установите канал AFK для сервера')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Канал, который нужно установить как AFK')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setlevelup')
                .setDescription('Установите канал оповещения о событиях, повышающих уровень')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Канал для отправки уведомлений о повышении уровня')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setwelcome')
                .setDescription('Установите канал приветствия для новых участников')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Канал для отправки приветственных сообщений')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setfarewell')
                .setDescription('Установите канал прощания для уходящих участников')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Канал для отправки прощальных сообщений')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setwelcomemsg')
                .setDescription('Установите пользовательское приветственное сообщение для новых участников')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Пользовательское приветственное сообщение')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setfarewellmsg')
                .setDescription('Установите пользовательское прощальное сообщение для уходящих участников')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Пользовательское прощальное послание')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setauditlog')
                .setDescription('Установите канал журнала аудита для событий сервера (В разработке)')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Канал, по которому будут отправляться журналы аудита')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Просмотрите текущие настройки сервера')
        ),
    category: 'system',
    async execute(interaction) {
        const { options, member, client, guild } = interaction;

        // Проверка разрешений
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Красный цвет для ошибки
                .setAuthor({
                    name: 'Эта команда доступна только администраторам!',
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
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`${channel}`)
            .setAuthor({ 
                name: `AFK channel set to:`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'setlevelup') {
            settings.notificationChannelId = channel.id; // Устанавливаем канал уведомлений
            await settings.save();
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`${channel}`)
            .setAuthor({ 
                name: `Level-up notification channel set to:`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'setwelcome') {
            settings.welcomeChannelId = channel.id; // Устанавливаем канал для приветствий
            await settings.save();
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`${channel}`)
            .setAuthor({ 
                name: `Welcome channel set to:`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'setfarewell') {
            settings.farewellChannelId = channel.id; // Устанавливаем канал для прощаний
            await settings.save();
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`${channel}`)
            .setAuthor({ 
                name: `Farewell channel set to:`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'setwelcomemsg') {
            settings.welcomeMessage = message; // Устанавливаем сообщение для приветствий
            await settings.save();
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`${message}`)
            .setAuthor({ 
                name: `Custom welcome message set to:`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'setfarewellmsg') {
            settings.farewellMessage = message; // Устанавливаем сообщение для прощаний
            await settings.save();
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`${message}`)
            .setAuthor({ 
                name: `Custom farewell message set to:`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'setauditlog') {
            settings.auditLogChannelId = channel.id; // Устанавливаем канал для журнала аудита
            await settings.save();
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`${channel}`)
            .setAuthor({ 
                name: `Audit log channel set to:`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'view') {
            // Формируем ответ с текущими настройками
            const afkChannel = settings.afkChannelId ? `<#${settings.afkChannelId}>` : 'Not set';
            const levelUpChannel = settings.notificationChannelId ? `<#${settings.notificationChannelId}>` : 'Not set';
            const welcomeChannel = settings.welcomeChannelId ? `<#${settings.welcomeChannelId}>` : 'Not set';
            const farewellChannel = settings.farewellChannelId ? `<#${settings.farewellChannelId}>` : 'Not set';
            const welcomeMessage = settings.welcomeMessage ? settings.welcomeMessage : 'Default welcome message';
            const farewellMessage = settings.farewellMessage ? settings.farewellMessage : 'Default farewell message';
            const auditLogChannel = settings.auditLogChannelId ? `<#${settings.auditLogChannelId}>` : 'Not set';

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Текущие настройки сервера')
                .addFields(
                    { name: 'AFK Channel', value: afkChannel, inline: true },
                    { name: 'Level-up Notification Channel', value: levelUpChannel, inline: true },
                    { name: 'Welcome Channel', value: welcomeChannel, inline: true },
                    { name: 'Farewell Channel', value: farewellChannel, inline: true },
                    { name: 'Audit Log Channel', value: auditLogChannel, inline: true },
                    { name: 'Welcome Message', value: welcomeMessage, inline: false },
                    { name: 'Farewell Message', value: farewellMessage, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
};