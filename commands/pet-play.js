const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-play')
        .setDescription('Поиграть со своим питомцем.'),
    category: 'entertainment',
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const { Pet, User } = interaction.client.sequelize.models;

        // Ищем питомца пользователя
        const pet = await Pet.findOne({ where: { userId: userId } });
        if (!pet) {
            return interaction.reply('У вас нет питомца. Пожалуйста, купите его сначала.');
        }

        // Проверяем уровень энергии питомца
        if (pet.energy <= 20) {
            return interaction.reply('Ваш питомец слишком устал, чтобы играть. Ему нужно отдохнуть.');
        }

        // Повышаем уровень счастья, снижаем энергию
        pet.happiness += 15;
        if (pet.happiness > 100) pet.happiness = 100;
        pet.energy -= 20;

        // Обновляем время взаимодействия
        pet.lastInteractedAt = new Date();

        // Сохраняем изменения
        await pet.save();

        return interaction.reply(`Вы поиграли со своим питомцем "${pet.name}". Уровень счастья: ${pet.happiness}, энергия: ${pet.energy}.`);
    },
};
