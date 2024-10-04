const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-coins')
        .setDescription('Gain some Coins.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of coins to gain')
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
                id: interaction.user.id,
                guildId: interaction.guild.id, // Учитываем сервер
            },
            defaults: { username: interaction.user.username },
        });

        // Добавляем монеты
        user.balance += amount;
        await user.save();

        // Отправляем сообщение о добавлении монет
        const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setAuthor({ 
            name: `Вы добавили ${amount} монет пользователю ${userToUpdate.username}`, 
            iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
        })
    await interaction.reply({ embeds: [embed] });
    },
};
