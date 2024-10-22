// commands/pet-status.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-status')
        .setDescription('Проверить состояние вашего питомца'),
    async execute(interaction) {
        const { Pet } = interaction.client.sequelize.models;
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Ищем питомца пользователя
        const pet = await Pet.findOne({ where: { userId: userId, guildId: guildId } });

        if (!pet) {
            return interaction.reply('У вас нет питомца. Купите питомца командой /pet-buy.');
        }

        // Генерация сообщений в зависимости от состояния питомца
        let hungerStatus = 'Хорошо';
        let energyStatus = 'Хорошо';
        let happinessStatus = 'Хорошо';

        if (pet.hunger >= 80) hungerStatus = 'Очень голоден';
        else if (pet.hunger >= 50) hungerStatus = 'Немного голоден';

        if (pet.energy <= 20) energyStatus = 'Очень устал';
        else if (pet.energy <= 50) energyStatus = 'Немного устал';

        if (pet.happiness <= 20) happinessStatus = 'Очень грустный';
        else if (pet.happiness <= 50) happinessStatus = 'Немного грустный';

        const petInfo = `
        **Имя питомца**: ${pet.name}
        **Тип питомца**: ${pet.type}

        **Голод**: ${pet.hunger}/100 (${hungerStatus})
        **Энергия**: ${pet.energy}/100 (${energyStatus})
        **Счастье**: ${pet.happiness}/100 (${happinessStatus})
        `;

        await interaction.reply(petInfo);
    },
};
