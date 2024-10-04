// models/Settings.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Settings', {
        guildId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        afkChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        notificationChannelId: { // Новое поле для канала оповещений
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });
};
