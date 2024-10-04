const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ap')
		.setDescription('Check your profile.'),
	async execute(interaction) {
		// Получение модели пользователя из базы данных
		const User = interaction.client.sequelize.models.User;

		// Получение пользователя или создание нового, если он не существует
		const user = await User.findOrCreate({
			where: { id: interaction.user.id },
			defaults: { username: interaction.user.username },
		});

		// Отправка ответа с балансом пользователя
		await interaction.reply(`
             Your Name: ${interaction.user.username}\nYour status ${interaction.user.status}\nYour Balanse: ${user[0].balance} coins\nYou CreatedAt ${interaction.user.createdAt}`);
	},
};