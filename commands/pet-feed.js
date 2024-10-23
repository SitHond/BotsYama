const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-feed')
        .setDescription('Покормить своего питомца.'),
    category: 'entertainment',
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const { Pet, User } = interaction.client.sequelize.models;

        // Ищем питомца пользователя
        const pet = await Pet.findOne({ where: { userId: userId, guildId: guildId } });
        if (!pet) {
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ 
                name: `У вас нет питомца. Пожалуйста, купите его сначала.`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })

         await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Ищем пользователя, чтобы проверить его баланс
        const user = await User.findOne({ where: { id: userId, guildId: guildId } });
        if (!user) {
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ 
                name: `Пользователь не найден в базе данных.`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })

         await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const feedCost = 100;

        // Проверяем, достаточно ли у пользователя средств
        if (user.balance < feedCost) {
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ 
                name: `У вас недостаточно средств для покупки корма. Необходимо ${feedCost} монет, у вас есть только ${user.balance}.`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })

         await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Проверяем, не перекормлен ли питомец
        if (pet.hunger <= 0) {
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ 
                name: `Ваш питомец не голоден.`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })

         await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Снижаем голод питомца
        pet.hunger -= 20;
        if (pet.hunger < 0) pet.hunger = 0;

        // Обновляем время взаимодействия
        pet.lastInteractedAt = new Date();

        // Сохраняем изменения питомца
        await pet.save();

        // Вычитаем стоимость корма из баланса пользователя
        user.balance -= feedCost;
        await user.save();

        // Отправка сообщения о повышении репутации
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ 
                name: `Вы покормили своего питомца "${pet.name}". Уровень голода: ${pet.hunger}. С вашего баланса было снято ${feedCost} монет.`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

        await interaction.reply({ embeds: [embed] });
    },
};
