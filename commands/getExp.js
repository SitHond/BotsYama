const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js'); // Импортируем PermissionsBitField и EmbedBuilder
const { addExp } = require('../function/leveling'); // Импортируем функцию для добавления опыта

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-exp')
        .setDescription('Gain some experience.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to gain experience')
                .setRequired(true) // Опция обязательная
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of experience to gain')
                .setRequired(true) // Опция обязательная
        ),
    async execute(interaction) {
        // Проверка, является ли пользователь администратором
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Красный цвет для ошибки
                .setDescription('Эта команда доступна только администраторам!')
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true }); // Используем Embed
        }

        // Получаем значения user и amount
        const userToUpdate = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        
        // Проверка, указан ли пользователь
        if (!userToUpdate) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Красный цвет для ошибки
                .setDescription('Пользователь не найден. Пожалуйста, выберите пользователя.')
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true }); // Используем Embed
        }

        if (!amount || amount <= 0) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Красный цвет для ошибки
                .setDescription('Укажите корректное количество опыта!')
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true }); // Используем Embed
        }

        // Получаем модель пользователя
        const User = interaction.client.sequelize.models.User;

        // Получаем или создаем пользователя для конкретного сервера
        const [user] = await User.findOrCreate({
            where: {
                id: userToUpdate.id, // Используем id выбранного пользователя
                guildId: interaction.guild.id, // Учитываем сервер
            },
            defaults: { 
                username: userToUpdate.username,
                balance: 0,
                status: 'Новичок',
                exp: 0,
                level: 1,
                donatCoins: 0,
                reputation: 0
            },
        });

        // Используем функцию addExp для добавления опыта и обновления уровня
        await addExp(user, amount, interaction.client);

        // Отправляем сообщение о добавлении опыта в формате Embed
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ 
                name: `Вы добавили ${amount} очков опыта пользователю ${userToUpdate.username}`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            })
        await interaction.reply({ embeds: [embed] });
    },
};
