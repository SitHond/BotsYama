const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        // Удаление глобальных команд
        const globalCommands = await client.application.commands.fetch();
        if (globalCommands.size > 0) {
            console.log(`Удаление ${globalCommands.size} глобальных команд...`);
            for (const command of globalCommands.values()) {
                await client.application.commands.delete(command.id);
                console.log(`Удалена глобальная команда: ${command.name}`);
            }
        } else {
            console.log('Глобальные команды не найдены.');
        }

        // Удаление команд для всех серверов (гильдий)
        const guilds = client.guilds.cache;
        for (const guild of guilds.values()) {
            const guildCommands = await guild.commands.fetch();
            if (guildCommands.size > 0) {
                console.log(`Удаление ${guildCommands.size} команд на сервере ${guild.name}...`);
                for (const command of guildCommands.values()) {
                    await guild.commands.delete(command.id);
                    console.log(`Удалена команда на сервере ${guild.name}: ${command.name}`);
                }
            } else {
                console.log(`Команды на сервере ${guild.name} не найдены.`);
            }
        }

        console.log('Все команды успешно удалены.');
    } catch (error) {
        console.error('Произошла ошибка при удалении команд:', error);
    }

    // Останавливаем бота после завершения удаления
    process.exit(0);
});

// Вход в бот
client.login(token);
