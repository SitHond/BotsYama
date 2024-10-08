const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bank')
        .setDescription('Check your balance.'),
    async execute(interaction) {
        // Получение модели пользователя из базы данных
        const User = interaction.client.sequelize.models.User;

        // Получение пользователя или создание нового для конкретного сервера, если он не существует
        const [user] = await User.findOrCreate({
            where: {
                id: interaction.user.id,  // id пользователя
                guildId: interaction.guild.id // id сервера (гильдии)
            },
            defaults: {
                username: interaction.user.username,
                balance: 0, // Начальный баланс
                status: 'Новый игрок',
                exp: 0,
                level: 1,
                donatCoins: 0,
                reputation: 0
            },
        });

        // Создание Embed-сообщения
        const embed = new EmbedBuilder()
            .setColor('#36393e')
            .setTitle(`${interaction.user.username}, ваш баланс`)
            .setDescription(`Ваш баланс составляет: **${user.balance} монет**.`)
            .setThumbnail(interaction.user.displayAvatarURL()) // Изображение (например, аватар пользователя)
            .setTimestamp() // Добавление времени

        // Отправка Embed-сообщения
        await interaction.reply({ embeds: [embed] });
    },
};
