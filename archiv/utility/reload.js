const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true)),
	async execute(interaction) {
		// Retrieve the command name from the interaction
		const commandName = interaction.options.getString('command').toLowerCase();

		// Check if the command exists
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`There is no command with name \`${commandName}\`, ${interaction.user}!`);
		}

		// Delete the command from the cache
		delete require.cache[require.resolve(`../${commandName}.js`)];

		try {
			// Reload the command
			const newCommand = require(`../${commandName}.js`);
			interaction.client.commands.set(newCommand.data.name, newCommand);

			await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
		} catch (error) {
			console.error(error);
			await interaction.reply(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
		}
	},
};
