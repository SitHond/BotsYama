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
                where: { guildId: guild.id, activity: { [Op.gt]: 0 } },
                order: [['activity', 'DESC']],
                limit: 10, // Показываем топ-10 пользователей
            });

            if (users.length === 0) {
                return interaction.reply('Никто ещё не был активен в войс-чатах на этом сервере.');
            }

            // Формируем описание с топом по активности
            let description = '';
            users.forEach((user, index) => {
                const hours = Math.floor(user.activity / 60);
                const minutes = Math.round(user.activity % 60);
                const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔸';
                description += `${emoji} <@${user.id}> - ${hours}ч ${minutes}мин\n`;
            });

            // Создаем embed-сообщение
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Топ пользователей по активности в войс-чатах')
                .setDescription(description)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Ошибка при получении данных активности:', error);
            await interaction.reply('Произошла ошибка при попытке получить данные активности. Попробуйте позже.');
        }
    },
};
