const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-feed')
        .setDescription('Покормить своего питомца.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const { Pet, User } = interaction.client.sequelize.models;

        // Ищем питомца пользователя
        const pet = await Pet.findOne({ where: { userId: userId } });
        if (!pet) {
            return interaction.reply('У вас нет питомца. Пожалуйста, купите его сначала.');
        }

        // Проверяем, не перекормлен ли питомец
        if (pet.hunger <= 0) {
            return interaction.reply('Ваш питомец не голоден.');
        }

        // Снижаем голод
        pet.hunger -= 20;
        if (pet.hunger < 0) pet.hunger = 0;

        // Обновляем время взаимодействия
        pet.lastInteractedAt = new Date();

        // Сохраняем изменения
        await pet.save();

        return interaction.reply(`Вы покормили своего питомца "${pet.name}". Уровень голода: ${pet.hunger}.`);
    },
};
