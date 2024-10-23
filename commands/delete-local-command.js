const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const config = require('../config.json'); // Подключаем конфигурацию

// REST API для взаимодействия с Discord
const rest = new REST({ version: '10' }).setToken(config.token); // Используем токен из config.json

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-local-command')
        .setDescription('Удалить локальную команду')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Имя команды для удаления')
                .setRequired(true)
        ),
    category: 'system',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const commandName = interaction.options.getString('name');

        // Получаем модель LocalCommand через interaction.client.sequelize.models
        const { LocalCommand } = interaction.client.sequelize.models;

        try {
            // Ищем команду в базе данных
            const localCommand = await LocalCommand.findOne({
                where: {
                    guildId: guildId,
                    commandName: commandName,
                }
            });

            if (!localCommand) {
                return interaction.reply({
                    content: `Команда с именем \`${commandName}\` не найдена.`,
                    ephemeral: true
                });
            }

            // Удаляем команду из базы данных
            await localCommand.destroy();

            // Удаляем команду из Discord
            const commands = await rest.get(
                Routes.applicationGuildCommands(interaction.client.user.id, guildId)
            );

            const commandToDelete = commands.find(cmd => cmd.name === commandName);

            if (commandToDelete) {
                await rest.delete(
                    `${Routes.applicationGuildCommands(interaction.client.user.id, guildId)}/${commandToDelete.id}`
                );
            }

            await interaction.reply(`Команда \`/${commandName}\` успешно удалена.`);
        } catch (error) {
            console.error('Ошибка при удалении команды:', error);
            await interaction.reply('Произошла ошибка при удалении команды.');
        }
    },
};
