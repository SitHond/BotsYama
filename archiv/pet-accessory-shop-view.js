const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-accessory-shop-view')
        .setDescription('Посмотреть доступные аксессуары в магазине'),

    async execute(interaction) {
        const AccessoryShop = interaction.client.sequelize.models.AccessoryShop;

        const accessories = await AccessoryShop.findAll();
        const accessoryList = accessories.map(accessory => `${accessory.name} (${accessory.category}) - ${accessory.price} монет`).join('\n');

        return interaction.reply(`Доступные аксессуары:\n${accessoryList}`);
    },
};
