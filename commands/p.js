const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('p')
        .setDescription('Check your profile.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user whose profile you want to check')
                .setRequired(false)
        ),
    async execute(interaction) {
        const User = interaction.client.sequelize.models.User;
        const targetUser = interaction.options.getUser('user') || interaction.user;

        try {
            // Найти или создать пользователя
            const [user, created] = await User.findOrCreate({
                where: {
                    id: targetUser.id,
                    guildId: interaction.guild.id
                },
                defaults: {
                    username: targetUser.username,
                    balance: 0,
                    status: 'Статус не указан',
                    exp: 0,
                    level: 1,
                    donatCoins: 0,
                    reputation: 0,
                    activity: 0, // Инициализация активности
                }
            });

            // Ваша логика для создания embed
            const rMember = interaction.guild.members.cache.get(targetUser.id);
            const defEmoji = '💰';
            const donEmoji = '💎';
            const guildInfo = {
                defaultMoneyName: 'Gold',
                donateMoneyName: 'Diamonds'
            };

            const embed = {
                title: `Профиль ${rMember.user.username}`,
                description: `Статус: \`\`\`${user.status || 'Нет статуса'}\`\`\``,
                color: 3553598,
                footer: {
                    text: `Вошел на сервер: ${rMember.joinedAt}`
                },
                thumbnail: {
                    url: rMember.user.displayAvatarURL()
                },
                fields: [
                    {
                        name: 'Уровень',
                        value: `\`\`\`${user.level} [${user.exp}]\`\`\``,
                        inline: true
                    },
                    {
                        name: `${defEmoji} ${guildInfo.defaultMoneyName}`,
                        value: `\`\`\`${user.balance}\`\`\``,
                        inline: true
                    },
                    {
                        name: `${donEmoji} ${guildInfo.donateMoneyName}`,
                        value: `\`\`\`${user.donatCoins}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Репутация',
                        value: `\`\`\`${user.reputation}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Активность',
                        value: `\`\`\`${(user.activity / 60).toFixed(2)} ч.\`\`\``,
                        inline: true
                    }
                ]
            };

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error:', error);
            await interaction.reply({ content: 'Произошла ошибка при выполнении команды.', ephemeral: true });
        }
    }
};
