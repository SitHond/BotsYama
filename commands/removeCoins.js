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
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000') // Красный цвет для ошибки
                        .setAuthor({ 
                            name: `Эта команда доступна только администраторам!`, 
                            iconURL: 'https://media.discordapp.net/attachments/768105199151218690/837717853796565042/-2.png?ex=6701608c&is=67000f0c&hm=9698de4d28bf1627adbd5bdd109ac6f6d63a00859c5d7ecb8dcb2edb956ec5ca&=&format=webp&quality=lossless'
                        })       
                    return interaction.reply({ embeds: [embed], ephemeral: true }); // Используем Embed
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
