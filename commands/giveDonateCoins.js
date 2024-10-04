const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-donate-coins')
        .setDescription('Gain some DonateCoins.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of donate coins to gain')
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

        // Добавляем DonateCoins
        user.donatCoins += amount;

        // Сохраняем изменения
        await user.save();

        // Отправляем сообщение о добавлении DonateCoins
        const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setAuthor({ 
            name: `Вы добавили ${amount} донат монет пользователю ${userToUpdate.username}`, 
            iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
        })
    await interaction.reply({ embeds: [embed] });
    },
};
