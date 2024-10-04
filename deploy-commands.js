const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json'); // Убираем guildId, так как будем использовать глобальные команды
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Function to load command files from a directory
function loadCommandsFromDirectory(directory) {
    const commandFiles = fs.readdirSync(directory).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(directory, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Load commands from the main "commands" directory
loadCommandsFromDirectory(commandsPath);

// Load commands from subdirectories inside "commands"
const commandFolders = fs.readdirSync(commandsPath).filter(folder => fs.statSync(path.join(commandsPath, folder)).isDirectory());

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    loadCommandsFromDirectory(folderPath);
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy the commands globally
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Use Routes.applicationCommands to deploy globally (instead of applicationGuildCommands)
        const data = await rest.put(
            Routes.applicationCommands(clientId), // No guildId here for global commands
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} global application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
