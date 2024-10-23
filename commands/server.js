const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Информаци о сервере'),
    category: 'user',
    async execute(interaction) {
        const guild = interaction.guild; // Получаем объект сервера

        // Получаем количество администраторов
        const adminCount = guild.members.cache.filter(member => member.permissions.has(PermissionsBitField.Flags.Administrator)).size;

        // Получаем информацию о создателе сервера
        const creator = await guild.fetchOwner(); // Получаем владельца сервера

        // Получаем уровень проверки
        const verificationLevel = guild.verificationLevel; // Уровень проверки

        // Получаем URL изображения сервера
        const iconUrl = guild.iconURL() || 'Нет изображения'; // Если изображение отсутствует, выводим сообщение

        // Создаём Embed с информацией о сервере
        const serverInfoEmbed = new EmbedBuilder()
            .setColor('#0099ff') // Устанавливаем цвет рамки
            .setTitle(`Информация о сервере: ${guild.name}`)
            .addFields(
                { name: 'Количество участников', value: `${guild.memberCount}`, inline: true },
                { name: 'Количество администраторов', value: `${adminCount}`, inline: true },
                { name: 'Уровень проверки', value: `${verificationLevel}`, inline: true },
                { name: 'Дата создания', value: `${guild.createdAt.toLocaleDateString()} ${guild.createdAt.toLocaleTimeString()}`, inline: true },
                { name: 'Создатель сервера', value: `${creator.user.tag}`, inline: true },
                { name: 'Изображение сервера', value: iconUrl ? `[Ссылка на изображение](${iconUrl})` : 'Нет изображения', inline: true } // Добавляем ссылку на изображение
            )
            .setTimestamp() // Устанавливаем временную метку
            .setThumbnail(iconUrl); // Устанавливаем изображение в качестве миниатюры

        await interaction.reply({ embeds: [serverInfoEmbed], ephemeral: true });
    },
};
