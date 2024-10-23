const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-pet-channel')
        .setDescription('Установить канал для сообщений питомцев')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Канал для сообщений')
                .setRequired(true)),
    category: 'system',
    async execute(interaction) {
        const { Settings } = interaction.client.sequelize.models;
        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id; // Получаем ID гильдии

        // Создание или обновление записи с guildId и petChannelId
        await Settings.upsert({
            guildId: guildId, // ID гильдии
            petChannelId: channel.id, // ID канала для питомцев
        });
        const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setDescription(`${channel}`)
        .setAuthor({ 
            name: `Канал для сообщений питомцев установлен:`, 
            iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
        });

        await interaction.reply({ embeds: [embed] });
    },
};
