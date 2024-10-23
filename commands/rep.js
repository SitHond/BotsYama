const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rep')
        .setDescription('Повышение репутации пользователю.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Пользователь, которому вы хотите повысить репутацию.')
                .setRequired(true)
        ),
    category: 'user',
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');

        // Проверка на попытку повысить репутацию самому себе
        if (targetUser.id === interaction.user.id) {
            return interaction.reply('Вы не можете повысить репутацию самому себе.');
        }

        // Получение модели User
        const User = interaction.client.sequelize.models.User;

        // Проверка, повышал ли пользователь репутацию этому пользователю ранее на данном сервере
        let user = await User.findOne({
            where: {
                id: interaction.user.id,
                guildId: interaction.guild.id, // Учет сервера
            }
        });

        // Если записи пользователя нет, создаем новую
        if (!user) {
            user = await User.create({
                id: interaction.user.id,
                guildId: interaction.guild.id,
                username: interaction.user.username,
                lastRepGivenTo: null,
                reputation: 0
            });
        }

        if (user.lastRepGivenTo === targetUser.id) {
            return interaction.reply('Вы уже повысили репутацию этому пользователю на этом сервере.');
        }

        // Обновляем репутацию целевого пользователя
        let target = await User.findOne({
            where: {
                id: targetUser.id,
                guildId: interaction.guild.id, // Учет сервера
            }
        });

        // Если целевой пользователь не найден, создаем запись для него
        if (!target) {
            target = await User.create({
                id: targetUser.id,
                guildId: interaction.guild.id,
                username: targetUser.username,
                reputation: 0,
                lastRepGivenTo: null,
            });
        }

        target.reputation += 1;
        await target.save();

        // Обновляем запись о том, кому был дан реп
        user.lastRepGivenTo = targetUser.id;
        await user.save();

        // Отправка сообщения о повышении репутации
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ 
                name: `Репутация пользователя ${targetUser.username} повышена.`, 
                iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
            });

        await interaction.reply({ embeds: [embed] });
    },
};
