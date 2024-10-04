const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-donate-coins')
        .setDescription('Забрать Donate Coins.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of donate coins to remove')
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

        // Уменьшаем Donate Coins
        user.donatCoins -= amount;

        // Проверяем, чтобы Donate Coins не ушли в минус
        if (user.donatCoins < 0) user.donatCoins = 0;

        // Сохраняем изменения
        await user.save();

        // Отправляем сообщение о снятии Donate Coins
        await interaction.reply(`You've removed ${amount} Donate Coins. Your new balance is ${user.donatCoins} Donate Coins.`);
    },
};
