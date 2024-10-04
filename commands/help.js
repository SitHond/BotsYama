const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of all available commands.'),
    async execute(interaction) {
        // Получение всех команд, зарегистрированных в клиенте
        const commands = interaction.client.commands;

        // Создание списка команд с их описанием
        const commandList = commands.map(command => `\`/${command.data.name}\` - ${command.data.description}`).join('\n');

        // Создание embed сообщения с командами
        const embed = {
            title: 'Доступные команды',
            description: commandList,
            color: 3447003,
            footer: {
                text: 'Используйте /команда для выполнения команды.',
            },
        };

        // Отправка ответа с embed
        await interaction.reply({ embeds: [embed] });
    },
};
