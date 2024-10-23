const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bet')
        .setDescription('Сделать ставку на рулетку.')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Сумма ставки')
                .setRequired(false)) // Необязательный аргумент
        .addStringOption(option => 
            option.setName('bettype')
                .setDescription('Тип ставки: черное, красное, четное, нечетное, или конкретное число (0-36)')
                .setRequired(false)), // Необязательный аргумент
    category: 'entertainment',
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const betType = interaction.options.getString('bettype');

        // Если не указаны аргументы, показываем правила
        if (!amount || !betType) {
            const rulesEmbed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('🎰 Правила рулетки')
                .setDescription(
                    `В этой игре вы можете делать ставки на следующие исходы:
                    \n- **Черное** или **Красное**: ставка x2.
                    \n- **Четное** или **Нечетное**: ставка x2.
                    \n- **Конкретное число (0-36)**: ставка x36.
                    \nПример использования:\n- \`/bet 500 black\`\n- \`/bet 500 17\`\n\nУдачи в игре!`
                )
                .setFooter({ text: 'Ставьте разумно!' })
                .setTimestamp();

            return interaction.reply({ embeds: [rulesEmbed] });
        }

        const User = interaction.client.sequelize.models.User;
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const validNumbers = Array.from({ length: 37 }, (_, i) => i.toString());

        // Проверка корректности ставки
        if (!['black', 'red', 'even', 'odd'].includes(betType.toLowerCase()) && !validNumbers.includes(betType)) {
            return interaction.reply({
                content: 'Неверный тип ставки. Доступные типы: черное, красное, четное, нечетное или число (0-36).',
                ephemeral: true
            });
        }

        // Получаем пользователя и проверяем баланс
        const [user] = await User.findOrCreate({
            where: { id: userId, guildId },
            defaults: { balance: 1000 } // начальный баланс, если пользователя нет
        });
        if (user.balance < amount) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Красный цвет для ошибки
                .setAuthor({ 
                    name: `Недостаточно средств для ставки!`, 
                    iconURL: 'https://media.discordapp.net/attachments/768105199151218690/837717853796565042/-2.png?ex=6701608c&is=67000f0c&hm=9698de4d28bf1627adbd5bdd109ac6f6d63a00859c5d7ecb8dcb2edb956ec5ca&=&format=webp&quality=lossless'
                })       
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Снимаем деньги с баланса за ставку
        user.balance -= amount;
        await user.save();

        // Определяем результат рулетки
        const result = Math.floor(Math.random() * 37); // случайное число от 0 до 36
        const color = result === 0 ? 'green' : result % 2 === 0 ? 'black' : 'red';

        let payoutMultiplier = 0;
        let win = false;

        // Определяем победу в зависимости от типа ставки
        if (betType.toLowerCase() === 'black' && color === 'black') {
            payoutMultiplier = 2;
            win = true;
        } else if (betType.toLowerCase() === 'red' && color === 'red') {
            payoutMultiplier = 2;
            win = true;
        } else if (betType.toLowerCase() === 'even' && result !== 0 && result % 2 === 0) {
            payoutMultiplier = 2;
            win = true;
        } else if (betType.toLowerCase() === 'odd' && result % 2 !== 0) {
            payoutMultiplier = 2;
            win = true;
        } else if (validNumbers.includes(betType) && parseInt(betType) === result) {
            payoutMultiplier = 36;
            win = true;
        }

        let description = `Рулетка остановилась на ${result} (${color})\n`;

        if (win) {
            const winnings = amount * payoutMultiplier;
            user.balance += winnings; // добавляем выигрыш на баланс
            await user.save();

            description += `Поздравляем! Вы выиграли **${winnings}** монет. Ваш новый баланс: **${user.balance}**.`;
        } else {
            description += `К сожалению, вы проиграли. Ваш текущий баланс: **${user.balance}**.`;
        }

        // Создаем embed для ответа
        const embed = new EmbedBuilder()
            .setColor(win ? '#00FF00' : '#FF0000')
            .setTitle('🎰 Результат рулетки')
            .setDescription(description)
            .setFooter({ text: 'Удачи в следующий раз!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
