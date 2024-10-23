const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pet-name')
    .setDescription('Изменить имя вашего питомца.')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Новое имя для вашего питомца.')
        .setRequired(true)
    ),
category: 'entertainment',
  async execute(interaction) {
    const newName = interaction.options.getString('name');
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const { Pet } = interaction.client.sequelize.models;

    // Ищем питомца пользователя
    const pet = await Pet.findOne({ where: { userId: userId, guildId: guildId } });
    if (!pet) {
        const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setAuthor({ 
            name: `У вас еще нет питомцев!`,
            iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
        })

     await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Обновляем имя питомца
    pet.name = newName;

    // Сохраняем изменения
    await pet.save();
    const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setAuthor({ 
        name: `Имя вашего питомца успешно изменено на "${newName}".`, 
        iconURL: 'https://media.discordapp.net/attachments/768105199151218690/838851952627548210/-3.png?ex=66fcef02&is=66fb9d82&hm=9ab482f7494d25371e6aa5c1e1ecc3a7104ad104a6c3fb7df61149e3e77f594b&=&format=webp&quality=lossless&width=591&height=591'
    });

    await interaction.reply({ embeds: [embed] });
  },
};
