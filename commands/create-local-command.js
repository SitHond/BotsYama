const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const config = require('../config.json'); // Подключаем конфигурацию

// REST API для взаимодействия с Discord
const rest = new REST({ version: '10' }).setToken(config.token); // Используем токен из config.json

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-local-command')   
        .setDescription('Создать локальную команду для этого сервера')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Имя команды')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Описание команды')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('response')
                .setDescription('Ответ на команду. Используйте {user}, {guild}, {channel}, {role}')
                .setRequired(true)
        ),
    category: 'system',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const authorId = interaction.user.id;
        const commandName = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const response = interaction.options.getString('response');

        // Получаем модель LocalCommand через interaction.client.sequelize.models
        const { LocalCommand } = interaction.client.sequelize.models;

        try {
            // Проверка, существует ли уже такая команда на сервере
            const existingCommand = await LocalCommand.findOne({
                where: {
                    guildId: guildId,
                    commandName: commandName,
                }
            });

            if (existingCommand) {
                return interaction.reply({
                    content: `Команда с именем \`${commandName}\` уже существует на этом сервере.`,
                    ephemeral: true
                });
            }

            // Создаем новую команду в базе данных
            await LocalCommand.create({
                guildId: guildId,
                commandName: commandName,
                description: description,
                response: response,
                authorId: authorId
            });

            // Динамически регистрируем новую локальную команду как slash-команду
            await rest.put(
                Routes.applicationGuildCommands(interaction.client.user.id, guildId),
                { body: [
                    new SlashCommandBuilder()
                        .setName(commandName)
                        .setDescription(description)
                ] }
            );

            await interaction.reply(`Локальная команда \`/${commandName}\` успешно создана!`);
        } catch (error) {
            console.error('Ошибка при создании команды:', error);
            await interaction.reply('Произошла ошибка при создании команды.');
        }
    },
};
