const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Команды для покупки ролей.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('catalog')
                .setDescription('Открыть каталог доступных ролей.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('Купить роль по порядковому номеру.')
                .addIntegerOption(option =>
                    option.setName('number')
                        .setDescription('Порядковый номер роли в каталоге.')
                        .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('Добавить роли в магазин и установить цену.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Роль для добавления в магазин.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('price')
                        .setDescription('Цена роли.')
                        .setRequired(true))
        ),
    category: 'user',
    async execute(interaction) {
        const { options, guild, member, client } = interaction;
        const subcommand = options.getSubcommand();
        const RoleShop = client.sequelize.models.RoleShop;
        const User = client.sequelize.models.User;

        if (subcommand === 'catalog') {
            // Получаем все роли из магазина
            const roles = await RoleShop.findAll({ where: { guildId: guild.id } });
            if (roles.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: 'Нет доступных ролей для покупки.',
                        iconURL: 'https://media.discordapp.net/attachments/768105199151218690/837717853796565042/-2.png'
                    });
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Формируем список ролей и их цен
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Каталог ролей')
                .setDescription('Доступные роли для покупки:');

            roles.forEach((role, index) => {
                embed.addFields({ name: `#${index + 1} - ${role.roleName}`, value: `Цена: ${role.price} монет` });
            });

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'role') {
            const roleNumber = options.getInteger('number');
            const roles = await RoleShop.findAll({ where: { guildId: guild.id } });

            if (roleNumber < 1 || roleNumber > roles.length) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: 'Неверный номер роли.',
                        iconURL: 'https://media.discordapp.net/attachments/768105199151218690/837717853796565042/-2.png'
                    });
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const roleToBuy = roles[roleNumber - 1];
            const role = guild.roles.cache.get(roleToBuy.roleId);
            if (!role) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: 'Роль не найдена на сервере.',
                        iconURL: 'https://media.discordapp.net/attachments/768105199151218690/837717853796565042/-2.png'
                    });
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Получаем пользователя
            const [user] = await User.findOrCreate({
                where: { id: interaction.user.id, guildId: guild.id },
                defaults: { balance: 1000 }, // начальный баланс, если пользователя нет
            });

            // Проверка баланса
            if (user.balance < roleToBuy.price) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: 'Недостаточно средств для покупки этой роли.',
                        iconURL: 'https://media.discordapp.net/attachments/768105199151218690/837717853796565042/-2.png'
                    });
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Снимаем деньги и выдаем роль
            user.balance -= roleToBuy.price;
            await user.save();
            await member.roles.add(role);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `Вы успешно купили роль **${role.name}** за **${roleToBuy.price}** монет.`,
                    iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png'
                });
            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'settings') {
            // Проверка, является ли пользователь администратором
            if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setAuthor({
                        name: 'Эта команда доступна только администраторам!',
                        iconURL: 'https://media.discordapp.net/attachments/768105199151218690/837717853796565042/-2.png'
                    });
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const role = options.getRole('role');
            const price = options.getInteger('price');

            // Сохранение роли в базе данных
            await RoleShop.findOrCreate({
                where: { guildId: guild.id, roleId: role.id },
                defaults: { roleName: role.name, price },
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({
                    name: `Роль **${role.name}** добавлена в магазин с ценой **${price}** монет.`,
                    iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png'
                });
            await interaction.reply({ embeds: [embed] });
        }
    },
};