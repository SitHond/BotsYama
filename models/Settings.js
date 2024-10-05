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
        notificationChannelId: { // Новое поле для канала оповещений о повышении уровня
            type: DataTypes.STRING,
            allowNull: true,
        },
        welcomeChannelId: { // Новое поле для канала приветствий
            type: DataTypes.STRING,
            allowNull: true,
        },
        farewellChannelId: { // Новое поле для канала прощаний
            type: DataTypes.STRING,
            allowNull: true,
        },
        welcomeMessage: { // Новое поле для сообщения приветствия
            type: DataTypes.TEXT,
            allowNull: true,
        },
        farewellMessage: { // Новое поле для сообщения прощания
            type: DataTypes.TEXT,
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