// commands/pet-buy.js
const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-buy')
        .setDescription('Купить питомца за фиксированную цену.'),
    category: 'entertainment',
    async execute(interaction) {
        const { Pet, User } = interaction.client.sequelize.models;
        const userId = interaction.user.id;
        const guildId = interaction.guild.id; // Получаем ID гильдии
        const petName = `Питомец-${uuidv4().slice(0, 6)}`; // Рандомное имя для питомца
        const petType = 'Тамагочи'; // Тип питомца

        // Проверяем, есть ли у пользователя питомец
        const existingPet = await Pet.findOne({ where: { userId: userId, guildId: guildId } });
        if (existingPet) {
            const embed = new EmbedBuilder()
            .setColor('#00FF00') // Зеленый цвет для успешного сообщения
            .setAuthor({ 
                name: `У вас уже есть питомец.`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })

         await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Проверяем баланс пользователя
        // Находим пользователя в базе данных по его Discord ID и ID гильдии
        const user = await User.findOne({ where: { id: userId, guildId: guildId } });
        const petPrice = 10000; // Устанавливаем фиксированную цену питомца

        if (user.balance < petPrice) {
            const embed = new EmbedBuilder()
            .setColor('#00FF00') // Красный
            .setAuthor({ 
                name: `У вас недостаточно монет для покупки питомца.`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })

         await interaction.reply({ embeds: [embed], ephemeral: true });
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
        const embed = new EmbedBuilder()
            .setColor('#00FF00') // Зеленый
            .setAuthor({ 
                name: `Вы успешно купили питомца "${petName}" (${petType}).`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

        await interaction.reply({ embeds: [embed] });
    },
};
