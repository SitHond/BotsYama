const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-accessory')
        .setDescription('Купить аксессуар для питомца')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Название аксессуара, который вы хотите купить')
                .setRequired(true)),

    async execute(interaction) {
        const AccessoryShop = interaction.client.sequelize.models.AccessoryShop;
        const Pet = interaction.client.sequelize.models.Pet;
        const User = interaction.client.sequelize.models.User;

        const userId = interaction.user.id;
        const accessoryName = interaction.options.getString('name');
        
        // Находим аксессуар в магазине
        const accessoryInShop = await AccessoryShop.findOne({ where: { name: accessoryName } });
        if (!accessoryInShop) {
            return interaction.reply('Такого аксессуара нет в магазине.');
        }

        // Проверяем, достаточно ли у пользователя валюты
        const user = await User.findOne({ where: { id: userId } });
        if (user.balance < accessoryInShop.price) {
            return interaction.reply('У вас недостаточно монет для покупки этого аксессуара.');
        }

        // Проверяем, есть ли у пользователя питомец
        const pet = await Pet.findOne({ where: { userId } });
        if (!pet) {
            return interaction.reply('У вас нет питомца, на которого можно надеть аксессуар.');
        }

        // Списываем монеты и обновляем аксессуары питомца
        await user.update({ balance: user.balance - accessoryInShop.price });

        const updatedAccessories = {
            ...pet.accessories,
            [accessoryName]: true
        };

        await pet.update({ accessories: updatedAccessories });

        return interaction.reply(`Вы купили аксессуар ${accessoryName} для вашего питомца!`);
    },
};
