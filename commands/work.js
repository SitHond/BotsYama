const { SlashCommandBuilder } = require('discord.js');
const { Op } = require('sequelize'); // Для работы с операторами Sequelize

module.exports = {
	data: new SlashCommandBuilder()
		.setName('work')
		.setDescription('Выполнить работу, чтобы заработать монеты.'),
	async execute(interaction) {
		// Получаем модель пользователя
		const User = interaction.client.sequelize.models.User;

		// Находим пользователя или создаем нового для конкретного сервера
		const [user] = await User.findOrCreate({
			where: {
				id: interaction.user.id,
				guildId: interaction.guild.id, // Учет сервера
			},
			defaults: {
				username: interaction.user.username,
				balance: 0,
				lastWork: null, // Поле для хранения времени последней работы
			},
		});

		// Проверяем, прошло ли 24 часа с момента последней работы
		const now = new Date();
		const oneDayInMs = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

		if (user.lastWork && now - user.lastWork < oneDayInMs) {
			const timeLeft = new Date(oneDayInMs - (now - user.lastWork));
			const hours = timeLeft.getUTCHours();
			const minutes = timeLeft.getUTCMinutes();
			const seconds = timeLeft.getUTCSeconds();

			// Сообщаем пользователю, сколько времени осталось до следующей работы
			await interaction.reply({
				content: `Вы уже работали сегодня! Пожалуйста, подождите ${hours} ч. ${minutes} мин. ${seconds} сек. до следующей работы.`,
				ephemeral: true, // Сообщение видно только пользователю
			});
			return;
		}

		// Генерируем случайное количество денег от 10 до 100
		const earnedMoney = Math.floor(Math.random() * (100 - 10 + 1)) + 10;

		// Добавляем заработанные деньги к балансу пользователя и обновляем время последней работы
		user.balance += earnedMoney;
		user.lastWork = now; // Обновляем время последней работы
		await user.save(); // Сохраняем изменения в базе данных

		// Создаем embed сообщение
		const embed = {
			color: 0x00FF00, // Зеленый цвет
			title: `Работа выполнена!`,
			description: `${interaction.user.username} заработал ${earnedMoney} монет!`,
			fields: [
				{
					name: 'Ваш текущий баланс',
					value: `${user.balance} монет`,
					inline: true,
				},
			],
			timestamp: new Date(),
			footer: {
				text: 'Хорошая работа!',
			},
		};

		// Отправляем ответ пользователю
		await interaction.reply({ embeds: [embed] });
	},
};
