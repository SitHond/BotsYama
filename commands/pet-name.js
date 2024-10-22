const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pet-name')
    .setDescription('Изменить имя вашего питомца.')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Новое имя для вашего питомца.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const newName = interaction.options.getString('name');
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const { Pet } = interaction.client.sequelize.models;

    // Ищем питомца пользователя
    const pet = await Pet.findOne({ where: { userId: userId, guildId: guildId } });
    if (!pet) {
      return interaction.reply('У вас еще нет питомцев!');
    }

    // Обновляем имя питомца
    pet.name = newName;

    // Сохраняем изменения
    await pet.save();

    return interaction.reply(`Имя вашего питомца успешно изменено на "${newName}".`);
  },
};
