const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-shop-view')
        .setDescription('Посмотреть доступных питомцев в магазине'),

    async execute(interaction) {
        const PetShop = interaction.client.sequelize.models.PetShop;

        const pets = await PetShop.findAll();
        const petList = pets.map(pet => `${pet.name} (${pet.type}) - ${pet.price} монет`).join('\n');

        return interaction.reply(`Доступные питомцы:\n${petList}`);
    },
};
