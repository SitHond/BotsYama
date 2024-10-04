const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('Reputation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        giverId: {
            type: DataTypes.STRING,
            allowNull: false, // ID пользователя, который дал репутацию
        },
        receiverId: {
            type: DataTypes.STRING,
            allowNull: false, // ID пользователя, который получил репутацию
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false, // ID сервера (гильдии), где была выдана репутация
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });
};
