const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-pet')
        .setDescription('Добавить питомца в магазин (только для админов)')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Название питомца')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Тип питомца (например, dog, cat)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('price')
                .setDescription('Цена питомца')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Эта команда доступна только администраторам.', ephemeral: true });
        }

        const PetShop = interaction.client.sequelize.models.PetShop;

        const petName = interaction.options.getString('name');
        const petType = interaction.options.getString('type');
        const petPrice = interaction.options.getInteger('price');

        await PetShop.create({ name: petName, type: petType, price: petPrice });

        return interaction.reply(`Питомец ${petName} был добавлен в магазин за ${petPrice} монет.`);
    },
};
