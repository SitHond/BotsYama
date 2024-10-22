const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('p')
        .setDescription('Отобразить профиль пользователя')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Профиль пользователя')
                .setRequired(false)
        ),
    async execute(interaction) {
        const User = interaction.client.sequelize.models.User;
        const Pet = interaction.client.sequelize.models.Pet;
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

            // Ищем питомца пользователя
            const pet = await Pet.findOne({
                where: { userId: targetUser.id, guildId: interaction.guild.id }
            });

            let petInfo = 'Питомец отсутствует';
            if (pet) {
                // Выбираем смайлик в зависимости от показателей питомца
                let petEmoji = '😐'; // Нейтральный смайлик по умолчанию

                if (pet.happiness >= 70 && pet.energy >= 70 && pet.hunger <= 30) {
                    petEmoji = '😃'; // Счастливый
                } else if (pet.happiness < 30 && pet.energy < 30 && pet.hunger > 70) {
                    petEmoji = '😭'; // Очень грустный
                } else if (pet.happiness >= 30 && pet.happiness < 70) {
                    if (pet.energy < 30 || pet.hunger > 70) {
                        petEmoji = '😔'; // Устал или голоден, но не очень грустный
                    } else {
                        petEmoji = '🙂'; // Нормальное состояние
                    }
                } else if (pet.energy <= 30) {
                    petEmoji = '😴'; // Уставший
                } else if (pet.hunger >= 70) {
                    petEmoji = '😡'; // Голодный
                }

                petInfo = `${pet.name} ${petEmoji}`;
            }

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
                    },
                    {
                        name: 'Питомец',
                        value: `\`\`\`${petInfo}\`\`\``,
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
