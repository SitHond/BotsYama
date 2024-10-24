const { SlashCommandBuilder, Routes, Events } = require('discord.js');
const { REST } = require('@discordjs/rest');
const config = require('../config.json'); // Подключаем конфигурацию

// REST API для взаимодействия с Discord
const rest = new REST({ version: '10' }).setToken(config.token); // Используем токен из config.json

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        const { LocalCommand } = interaction.client.sequelize.models; // Получаем модель локальных команд

        // Проверяем, является ли команда зарегистрированной командой бота
        if (command) {
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else {
            // Если команда не найдена среди стандартных, проверяем, является ли она локальной командой
            try {
                // Ищем локальную команду в базе данных
                const localCommand = await LocalCommand.findOne({
                    where: {
                        guildId: interaction.guild.id,
                        commandName: interaction.commandName,
                    }
                });

                if (localCommand) {
                    // Замена шаблонов на реальные данные
                    let response = localCommand.response
                        .replace('{user}', `<@${interaction.user.id}>`)
                        .replace('{guild}', interaction.guild.name)
                        .replace('{channel}', `<#${interaction.channel.id}>`);

                    // Проверяем наличие упоминаний ролей, если они есть
                    if (interaction.options.getRole('role')) {
                        const role = interaction.options.getRole('role');
                        response = response.replace('{role}', `<@&${role.id}>`);
                    }

                    // Отправляем ответ с заменёнными упоминаниями
                    await interaction.reply(response);
                } else {
                    await interaction.reply({ content: 'Команда не найдена.', ephemeral: true });
                }
            } catch (error) {
                console.error('Ошибка при выполнении локальной команды:', error);
                await interaction.reply({ content: 'Произошла ошибка при выполнении команды.', ephemeral: true });
            }
        }
    },

    // Команда создания локальной команды
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
    async executeCreateLocalCommand(interaction) {
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
