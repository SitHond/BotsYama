const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Op } = require('sequelize'); // Импортируем Op

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Показать топ пользователей по активности в войс-чатах.'),
    async execute(interaction) {
        const { guild, client } = interaction;
        const User = client.sequelize.models.User;

        try {
            // Получаем всех пользователей с текущего сервера из базы данных, отсортированных по активности
            const users = await User.findAll({
                where: {
                    guildId: guild.id,
                    activity: { [Op.gt]: 0 } // Используем импортированный Op
                },
                order: [['activity', 'DESC']],
                limit: 10, // Показываем топ-10 пользователей
            });

            if (users.length === 0) {
                return interaction.reply('Никто ещё не был активен в войс-чатах на этом сервере.');
            }

            // Формируем embed-сообщение с топом по активности
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Топ пользователей по активности в войс-чатах')
                .setTimestamp();

            users.forEach((user, index) => {
                embed.addFields({
                    name: `#${index + 1} - ${user.username}`,
                    value: `Активность: ${user.activity.toFixed(2)} часов`,
                    inline: false
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Ошибка при получении данных активности:', error);
            await interaction.reply('Произошла ошибка при попытке получить данные активности. Попробуйте позже.');
        }
    },
};
