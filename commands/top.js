const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Op } = require('sequelize'); // Импортируем Op

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Показать топ пользователей по активности в войс-чатах.'),
    category: 'user',
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
                const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ 
                    name: `Никто ещё не был активен в войс-чатах на этом сервере.`,
                    iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
                })
    
             await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Формируем описание с топом по активности
            let description = '';
            users.forEach((user, index) => {
                const hours = Math.floor(user.activity / 60);
                const minutes = Math.round(user.activity % 60);
                const emoji = index === 0 ? '🔸' : index === 1 ? '🥈' : index === 2 ? '🔸' : '🔸'; // Потом переписать!!! Макс, обязательно перепиши
                description += `${emoji} <@${user.id}> - ${hours}ч ${minutes}мин\n`;
            });

            // Создаем embed-сообщение
            const embed = new EmbedBuilder()
                .setColor('#36393e')
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
