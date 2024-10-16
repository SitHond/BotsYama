const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-pet-channel')
        .setDescription('Установить канал для сообщений питомцев')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Канал для сообщений')
                .setRequired(true)),
    async execute(interaction) {
        const { Settings } = interaction.client.sequelize.models;
        const channel = interaction.options.getChannel('channel');
        const guildId = interaction.guild.id; // Получаем ID гильдии

        // Создание или обновление записи с guildId и petChannelId
        await Settings.upsert({
            guildId: guildId, // ID гильдии
            petChannelId: channel.id, // ID канала для питомцев
        });

        return interaction.reply(`Канал для сообщений питомцев установлен: ${channel}`);
    },
};
