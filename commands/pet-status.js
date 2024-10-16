const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-status')
        .setDescription('Показать текущий статус питомца.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        const { Pet } = interaction.client.sequelize.models;

        // Ищем питомца пользователя
        const pet = await Pet.findOne({ where: { userId: userId } });
        if (!pet) {
            return interaction.reply('У вас нет питомца.');
        }

        return interaction.reply(`Статус вашего питомца "${pet.name}":\nСчастье: ${pet.happiness}\nГолод: ${pet.hunger}\nЭнергия: ${pet.energy}`);
    },
};
