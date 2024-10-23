// commands/pet-status.js
const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet-status')
        .setDescription('Проверить состояние вашего питомца'),
    category: 'entertainment',
    async execute(interaction) {
        const { Pet } = interaction.client.sequelize.models;
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Ищем питомца пользователя
        const pet = await Pet.findOne({ where: { userId: userId, guildId: guildId } });

        if (!pet) {
            const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ 
                name: `У вас нет питомца. Купите питомца командой /pet-buy.`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })

         await interaction.reply({ embeds: [embed], ephemeral: true });
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

        await interaction.reply(petInfo); // TODO: Надо что-то с этом сделать. Обернуть сообщение в Embed :3
    },
};
