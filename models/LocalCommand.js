// models/LocalCommand.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('LocalCommand', {
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        commandName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: { // Добавляем поле для описания команды
            type: DataTypes.STRING,
            allowNull: false, // Сделаем его обязательным для новых команд
            defaultValue: 'Описание не указано' // Задаём дефолтное значение для старых записей
        },
        response: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        authorId: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });
};
