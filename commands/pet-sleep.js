const { SlashCommandBuilder } = require('discord.js');

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
            return interaction.reply('У вас нет питомца. Пожалуйста, купите его сначала.');
        }

        // Восстанавливаем энергию
        pet.energy += 30;
        if (pet.energy > 100) pet.energy = 100;

        // Обновляем время взаимодействия
        pet.lastInteractedAt = new Date();

        // Сохраняем изменения
        await pet.save();

        return interaction.reply(`Ваш питомец "${pet.name}" поспал и восстановил свою энергию. Текущий уровень энергии: ${pet.energy}.`);
    },
};
