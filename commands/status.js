const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Обновить статус пользователя.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Новый статус.')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Получаем строку и приводим ее к нижнему регистру
        const newStatus = interaction.options.getString('command').toLowerCase();
        
        // Получаем модель пользователя
        const User = interaction.client.sequelize.models.User;

        // Находим пользователя или создаем нового для конкретного сервера
        const [user] = await User.findOrCreate({
            where: {
                id: interaction.user.id,
                guildId: interaction.guild.id, // Учет сервера
            },
            defaults: { 
                username: interaction.user.username 
            },
        });

        // Обновляем статус пользователя
        user.status = newStatus;
        await user.save();

        // Отправляем ответ с новым статусом
        await interaction.reply(`Ваш статус обновлен на: ${newStatus}`);
    },
};
