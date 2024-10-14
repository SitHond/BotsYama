const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-donate-coins')
        .setDescription('Убрать у пользователя донат валюту')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('У кого убрать')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Сколько')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Проверка, является ли пользователь администратором
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Красный цвет для ошибки
                .setAuthor({ 
                    name: `Эта команда доступна только администраторам!`,
                    iconURL: 'https://media.discordapp.net/attachments/768105199151218690/837717853796565042/-2.png?ex=6701608c&is=67000f0c&hm=9698de4d28bf1627adbd5bdd109ac6f6d63a00859c5d7ecb8dcb2edb956ec5ca&=&format=webp&quality=lossless'
                });
            return interaction.reply({ embeds: [embed], ephemeral: true }); // Используем Embed
        }

        // Получаем модель пользователя
        const User = interaction.client.sequelize.models.User;
        const amount = interaction.options.getInteger('amount');
        const userToUpdate = interaction.options.getUser('user');

        // Получаем или создаем пользователя для конкретного сервера
        const [user] = await User.findOrCreate({
            where: {
                id: userToUpdate.id,
                guildId: interaction.guild.id, // Учитываем сервер
            },
            defaults: { 
                username: userToUpdate.username,
                balance: 0,
                status: 'Новый игрок',
                exp: 0,
                level: 1,
                donatCoins: 0,
                reputation: 0
            },
        });

        // Уменьшаем количество донатных монет пользователя
        user.donatCoins -= amount;

        // Проверяем, чтобы количество донатных монет не ушло в минус
        if (user.donatCoins < 0) user.donatCoins = 0;

        // Сохраняем изменения
        await user.save();

        // Отправляем сообщение о снятии донатных монет
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ 
                name: `Вы удалили ${amount} донат монет у пользователя ${userToUpdate.username}`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });
        await interaction.reply({ embeds: [embed] });
    },
};