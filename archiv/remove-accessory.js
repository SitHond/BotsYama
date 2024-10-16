const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-accessory')
        .setDescription('Удалить аксессуар из магазина (только для админов)')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Название аксессуара, который нужно удалить')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Эта команда доступна только администраторам.', ephemeral: true });
        }

        const AccessoryShop = interaction.client.sequelize.models.AccessoryShop;
        const accessoryName = interaction.options.getString('name');

        const accessory = await AccessoryShop.findOne({ where: { name: accessoryName } });

        if (!accessory) {
            return interaction.reply('Такого аксессуара нет в магазине.');
        }

        await accessory.destroy();
        return interaction.reply(`Аксессуар ${accessoryName} был удален из магазина.`);
    },
};
