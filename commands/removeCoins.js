const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-coins')
        .setDescription('Забрать Coins.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of coins to remove')
                .setRequired(true)
        ),
    async execute(interaction) {
                // Проверка, является ли пользователь администратором
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({
                        content: 'Эта команда доступна только администраторам!',
                        ephemeral: true // Сообщение будет видно только пользователю
                    });
                }
        // Получаем модель пользователя
        const User = interaction.client.sequelize.models.User;
        const amount = interaction.options.getInteger('amount');

        // Получаем или создаем пользователя для конкретного сервера
        const [user] = await User.findOrCreate({
            where: {
                id: interaction.user.id,  // id пользователя
                guildId: interaction.guild.id, // id сервера (гильдии)
            },
            defaults: { 
                username: interaction.user.username,
                balance: 0,
                status: 'Новый игрок',
                exp: 0,
                level: 1,
                donatCoins: 0,
                reputation: 0
            },
        });

        // Уменьшаем баланс пользователя
        user.balance -= amount;

        // Проверяем, чтобы баланс не ушел в минус
        if (user.balance < 0) user.balance = 0;

        // Сохраняем изменения
        await user.save();

        // Отправляем сообщение о снятии монет
        await interaction.reply(`You've removed ${amount} coins. Your new balance is ${user.balance} coins.`);
    },
};
