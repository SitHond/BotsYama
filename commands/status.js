const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
        const embed = new EmbedBuilder()
            .setColor('#00FF00') // Зеленый цвет для успешного сообщения
            .setAuthor({ 
                name: `Ваш статус обновлен на: ${newStatus}`,
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })

         await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
