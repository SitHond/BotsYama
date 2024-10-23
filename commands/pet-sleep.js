const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-sleep')
        .setDescription('Отправить питомца спать для восстановления энергии.'),
    category: 'entertainment',
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const { Pet, User } = interaction.client.sequelize.models;

        // Ищем питомца пользователя
        const pet = await Pet.findOne({ where: { userId: userId } });
        if (!pet) {
            const embed = new EmbedBuilder()
            .setColor('#00FF00') // Зеленый цвет для успешного сообщения
            .setAuthor({ 
                name: `У вас нет питомца. Пожалуйста, купите его сначала.`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })

         await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Восстанавливаем энергию
        pet.energy += 30;
        if (pet.energy > 100) pet.energy = 100;

        // Обновляем время взаимодействия
        pet.lastInteractedAt = new Date();

        // Сохраняем изменения
        await pet.save();
        const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setAuthor({ 
            name: `Ваш питомец "${pet.name}" поспал и восстановил свою энергию. Текущий уровень энергии: ${pet.energy}.`, 
            iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
        });

        await interaction.reply({ embeds: [embed] });
    },
};
