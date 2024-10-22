// commands/pet-buy.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-buy')
        .setDescription('Купить питомца за фиксированную цену.'),
    async execute(interaction) {
        const { Pet, User } = interaction.client.sequelize.models;
        const userId = interaction.user.id;
        const guildId = interaction.guild.id; // Получаем ID гильдии
        const petName = `Питомец-${uuidv4().slice(0, 6)}`; // Рандомное имя для питомца
        const petType = 'Тамагочи'; // Тип питомца

        // Проверяем, есть ли у пользователя питомец
        const existingPet = await Pet.findOne({ where: { userId: userId, guildId: guildId } });
        if (existingPet) {
            return interaction.reply('У вас уже есть питомец.');
        }

        // Проверяем баланс пользователя
        // Находим пользователя в базе данных по его Discord ID и ID гильдии
        const user = await User.findOne({ where: { id: userId, guildId: guildId } });
        const petPrice = 10000; // Устанавливаем фиксированную цену питомца

        if (user.balance < petPrice) {
            return interaction.reply('У вас недостаточно монет для покупки питомца.');
        }

        // Вычитаем стоимость питомца из баланса пользователя
        user.balance -= petPrice;
        await user.save();

        // Создаем нового питомца с корректным guildId
        await Pet.create({
            userId: userId,
            guildId: guildId, // Важно: передаем ID гильдии
            name: petName,
            type: petType,
            hunger: 50, // Начальные показатели
            energy: 50,
            happiness: 50,
            hygiene: 50, // Дополнительный параметр для гигиены
            lastInteractedAt: new Date(),
        });

        return interaction.reply(`Вы успешно купили питомца "${petName}" (${petType}).`);
    },
};
