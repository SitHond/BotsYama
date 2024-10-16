const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-accessory')
        .setDescription('Добавить аксессуар в магазин (только для админов)')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Название аксессуара')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Категория аксессуара (шляпы, очки и т.д.)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('price')
                .setDescription('Цена аксессуара')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('imageurl')
                .setDescription('URL изображения аксессуара')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Эта команда доступна только администраторам.', ephemeral: true });
        }

        const AccessoryShop = interaction.client.sequelize.models.AccessoryShop;

        const accessoryName = interaction.options.getString('name');
        const accessoryCategory = interaction.options.getString('category');
        const accessoryPrice = interaction.options.getInteger('price');
        const accessoryImageUrl = interaction.options.getString('imageurl');

        await AccessoryShop.create({ 
            name: accessoryName, 
            category: accessoryCategory, 
            price: accessoryPrice, 
            imageUrl: accessoryImageUrl 
        });

        return interaction.reply(`Аксессуар ${accessoryName} был добавлен в магазин за ${accessoryPrice} монет.`);
    },
};
