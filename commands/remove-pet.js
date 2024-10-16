const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-pet')
        .setDescription('Удалить питомца из магазина (только для админов)')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Название питомца, которого нужно удалить')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Эта команда доступна только администраторам.', ephemeral: true });
        }

        const PetShop = interaction.client.sequelize.models.PetShop;
        const petName = interaction.options.getString('name');

        const pet = await PetShop.findOne({ where: { name: petName } });

        if (!pet) {
            return interaction.reply('Такого питомца нет в магазине.');
        }

        await pet.destroy();
        return interaction.reply(`Питомец ${petName} был удален из магазина.`);
    },
};
