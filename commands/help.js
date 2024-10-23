const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Отобразить команды бота с описанием'),
    async execute(interaction) {
        // Получаем все команды, зарегистрированные в клиенте
        const commands = interaction.client.commands;
        
        // Получаем модель LocalCommand через interaction.client.sequelize.models
        const { LocalCommand } = interaction.client.sequelize.models;
        
        // Получаем локальные команды из базы данных
        const localCommands = await LocalCommand.findAll({
            where: { guildId: interaction.guild.id }
        });

        // Создаем кнопки для категорий
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('entertainment')
                    .setLabel('Развлекательные')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('admin')
                    .setLabel('Административные')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('system')
                    .setLabel('Системные')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('user')
                    .setLabel('Пользовательские')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('local')
                    .setLabel('Локальные команды')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Создаем основное embed сообщение
        const embed = new EmbedBuilder()
            .setTitle('Доступные команды')
            .setDescription('Выберите категорию, чтобы просмотреть команды')
            .setColor(3447003)
            .setFooter({ text: 'Нажмите на кнопку для выбора категории.' });

        // Отправляем сообщение с кнопками
        await interaction.reply({ embeds: [embed], components: [row] });

        // Создаем collector для отслеживания нажатий кнопок
        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'entertainment') {
                const entertainmentCommands = commands
                    .filter(command => command.category === 'entertainment')
                    .map(command => `\`/${command.data.name}\` - ${command.data.description}`)
                    .join('\n') || 'Нет развлекательных команд.';

                await i.update({
                    embeds: [new EmbedBuilder()
                        .setTitle('Развлекательные команды')
                        .setDescription(entertainmentCommands)
                        .setColor(3447003)],
                    components: [row]
                });
            } else if (i.customId === 'admin') {
                const adminCommands = commands
                    .filter(command => command.category === 'admin')
                    .map(command => `\`/${command.data.name}\` - ${command.data.description}`)
                    .join('\n') || 'Нет административных команд.';

                await i.update({
                    embeds: [new EmbedBuilder()
                        .setTitle('Административные команды')
                        .setDescription(adminCommands)
                        .setColor(3447003)],
                    components: [row]
                });
            } else if (i.customId === 'system') {
                const systemCommands = commands
                    .filter(command => command.category === 'system')
                    .map(command => `\`/${command.data.name}\` - ${command.data.description}`)
                    .join('\n') || 'Нет системных команд.';

                await i.update({
                    embeds: [new EmbedBuilder()
                        .setTitle('Системные команды')
                        .setDescription(systemCommands)
                        .setColor(3447003)],
                    components: [row]
                });
            } else if (i.customId === 'user') {
                const userCommands = commands
                    .filter(command => command.category === 'user')
                    .map(command => `\`/${command.data.name}\` - ${command.data.description}`)
                    .join('\n') || 'Нет пользовательских команд.';

                await i.update({
                    embeds: [new EmbedBuilder()
                        .setTitle('Пользовательские команды')
                        .setDescription(userCommands)
                        .setColor(3447003)],
                    components: [row]
                });
            } else if (i.customId === 'local') {
                const localCommandList = localCommands
                    .map(command => `\`/${command.commandName}\` - ${command.description || 'Описание не указано'}`)
                    .join('\n') || 'Нет локальных команд.';

                await i.update({
                    embeds: [new EmbedBuilder()
                        .setTitle('Локальные команды')
                        .setDescription(localCommandList)
                        .setColor(3447003)],
                    components: [row]
                });
            }
        });

        collector.on('end', collected => {
            console.log(`Коллектор завершен, собрано: ${collected.size} нажатий.`);
        });
    },
};
